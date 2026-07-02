import io
import re
import os
import zipfile
import hashlib
from typing import Optional

def get_file_hash(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()

def parse_path_metadata(internal_path: str) -> dict:
    # Normalize paths
    path_clean = internal_path.replace("\\", "/")
    parts = path_clean.split("/")
    filename = parts[-1]
    folders = parts[:-1]
    
    # 1. Parse using standard filename metadata parser
    from app.exam_importer import parse_filename_metadata
    meta = parse_filename_metadata(filename)
    
    # Override subject default of "math" if containing folder names specify other subjects
    subject_map = {
        "math": ["math", "maths", "calcul", "mathématique", "mathematique"],
        "french": ["fr", "franc", "french", "français", "francais"],
        "arabic": ["ar", "arab", "arabic", "arabe"],
        "islamic_education": ["islam", "islamique", "islamic", "tarbiya", "tarbiyah", "islamia"],
        "science": ["sc", "science", "sciences", "tabiya", "eveil"],
        "social_studies": ["soc", "social", "histoire", "géo", "geographie", "ijtimaeyat"]
    }
    
    filename_lower = filename.lower()
    has_math_kw = any(kw in filename_lower for kw in ["math", "calcul"])
    
    # If standard parser defaulted to math, check folders
    if meta["subject"] == "math" and not has_math_kw:
        for f in [fold.lower() for fold in folders]:
            for sub, kws in subject_map.items():
                if any(kw in f for kw in kws):
                    meta["subject"] = sub
                    break
            if meta["subject"] != "math":
                break
                
    # If region is missing, check folders (excluding filter words)
    if not meta["region"] or meta["region"] == "Unknown":
        filter_words = {
            "correction", "corrigé", "corrige", "solution", "answers", "cor",
            "math", "maths", "diagnostic", "exam", "examen", "sujet", "pdf",
            "6aep", "aep", "grade", "primary", "pr", "regional", "provincial", "zip",
            "draft", "tarbiya", "tarbiyah", "islamia", "eveil", "ijtimaeyat", "history", "geography", "social"
        }
        for f in reversed(folders):
            f_clean = f.strip().lower()
            if len(f_clean) >= 3 and f_clean not in filter_words and f_clean.isalpha():
                meta["region"] = f.capitalize()
                break
                
    # If year is missing, check folders
    if not meta["year"] or meta["year"] == 0:
        for f in reversed(folders):
            year_match = re.search(r"(?<!\d)(20\d{2})(?!\d)", f)
            if year_match:
                meta["year"] = int(year_match.group(1))
                break
                
    # If correction is False, check folders
    if not meta["is_correction"]:
        correction_keywords = ["correction", "corrigé", "corrige", "solution", "answers", "cor", "key", "barème", "bareme"]
        for f in [fold.lower() for fold in folders]:
            if any(keyword in f for keyword in correction_keywords):
                meta["is_correction"] = True
                break
                
    return meta

def check_text_density(zip_ref: zipfile.ZipFile, member: zipfile.ZipInfo) -> str:
    try:
        import fitz
        data = zip_ref.read(member)
        doc = fitz.open(stream=data, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        if len(text.strip()) > 100:
            return "selectable"
    except Exception:
        pass
        
    try:
        import PyPDF2
        data = zip_ref.read(member)
        reader = PyPDF2.PdfReader(io.BytesIO(data))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        if len(text.strip()) > 100:
            return "selectable"
    except Exception:
        pass
        
    return "scanned_or_low_text"

def analyze_zip_package(zip_path: str) -> dict:
    if not os.path.exists(zip_path):
        return {
            "zip_filename": os.path.basename(zip_path),
            "pdf_count": 0,
            "subjects_detected": [],
            "items": [],
            "pairs": [],
            "warnings": ["Le fichier archive spécifié n'existe pas."]
        }
        
    zip_filename = os.path.basename(zip_path)
    items = []
    pairs = []
    subjects_detected = set()
    warnings = []
    
    # Track file hashes to detect duplicates
    file_hashes = {}
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            pdf_members = [
                m for m in zip_ref.infolist()
                if m.filename.lower().endswith('.pdf') and not m.is_dir()
            ]
            
            # 1. Read files and parse individual metadata
            for member in pdf_members:
                # Zip Slip check (resolve path)
                # Note: We do not extract here, but we check filename format to be safe
                clean_path = member.filename.replace("\\", "/")
                if "../" in clean_path or clean_path.startswith("/"):
                    continue  # Skip insecure path names
                    
                data = zip_ref.read(member)
                f_hash = get_file_hash(data)
                
                # Check for duplicates
                is_dup = False
                if f_hash in file_hashes:
                    is_dup = True
                    file_hashes[f_hash].append(member.filename)
                else:
                    file_hashes[f_hash] = [member.filename]
                    
                meta = parse_path_metadata(member.filename)
                density = check_text_density(zip_ref, member)
                
                role = "correction" if meta["is_correction"] else "exam"
                subjects_detected.add(meta["subject"])
                
                items.append({
                    "internal_path": member.filename,
                    "detected_subject": meta["subject"],
                    "file_role": role,
                    "region": meta["region"] or "Unknown",
                    "year": meta["year"] or 0,
                    "text_density": density,
                    "paired_with": None,
                    "warnings": [],
                    "_hash": f_hash
                })
                
            # Add duplicate warnings
            for f_hash, filenames in file_hashes.items():
                if len(filenames) > 1:
                    # Flag all matching items
                    for it in items:
                        if it["_hash"] == f_hash:
                            it["warnings"].append("duplicate_looking_files")
                            
            # 2. Pair exams with corrections
            exams = [it for it in items if it["file_role"] == "exam"]
            corrections = [it for it in items if it["file_role"] == "correction"]
            
            for exam in exams:
                best_match = None
                best_score = -1
                
                for corr in corrections:
                    # Correction must not be already paired
                    if corr["paired_with"] is not None:
                        continue
                        
                    # Must share subject (unless both are unknown, but let's require subject matching)
                    if exam["detected_subject"] != corr["detected_subject"] or exam["detected_subject"] == "unknown":
                        continue
                        
                    score = 10  # base score for subject match
                    
                    # Region match
                    if exam["region"] != "Unknown" and exam["region"] == corr["region"]:
                        score += 5
                    # Year match
                    if exam["year"] != 0 and exam["year"] == corr["year"]:
                        score += 5
                        
                    # String similarity indicator: exam filename is prefix/sub of correction name
                    exam_name = os.path.splitext(os.path.basename(exam["internal_path"]))[0].lower()
                    corr_name = os.path.splitext(os.path.basename(corr["internal_path"]))[0].lower()
                    
                    # Clean names from correction keywords to do substring match
                    exam_clean = re.sub(r"(_correction|_corrigé|correction|corrigé|corrige|solution|answers|cor|bareme|barème)", "", exam_name)
                    corr_clean = re.sub(r"(_correction|_corrigé|correction|corrigé|corrige|solution|answers|cor|bareme|barème)", "", corr_name)
                    
                    if exam_clean in corr_clean or corr_clean in exam_clean:
                        score += 5
                        
                    if score > best_score:
                        best_score = score
                        best_match = corr
                        
                if best_match and best_score >= 15:
                    # Establish bidirectional link
                    exam["paired_with"] = best_match["internal_path"]
                    best_match["paired_with"] = exam["internal_path"]
                    
                    confidence = "high" if best_score >= 20 else "medium"
                    pairs.append({
                        "exam_pdf": exam["internal_path"],
                        "solution_pdf": best_match["internal_path"],
                        "subject": exam["detected_subject"],
                        "confidence": confidence
                    })
                    
            # 3. Compile warnings and final shapes
            for it in items:
                if it["year"] == 0:
                    it["warnings"].append("missing_year")
                if it["region"] == "Unknown":
                    it["warnings"].append("missing_region")
                if it["detected_subject"] == "unknown":
                    it["warnings"].append("missing_subject")
                if it["text_density"] == "scanned_or_low_text":
                    it["warnings"].append("scanned_pdf_needs_ocr")
                    
                if it["file_role"] == "exam" and it["paired_with"] is None:
                    it["warnings"].append("no_correction_found")
                if it["file_role"] == "correction" and it["paired_with"] is None:
                    it["warnings"].append("correction_without_subject")
                    
                # Clean up private hash property
                del it["_hash"]
                
    except Exception as e:
        warnings.append(f"Erreur d'analyse de l'archive ZIP : {str(e)}")
        
    if not items and not warnings:
        warnings.append("Aucun fichier PDF d'examen valide trouvé dans l'archive ZIP.")
        
    return {
        "zip_filename": zip_filename,
        "pdf_count": len(items),
        "subjects_detected": sorted(list(subjects_detected)),
        "items": items,
        "pairs": pairs,
        "warnings": warnings
    }
