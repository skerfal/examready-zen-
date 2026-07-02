import os
import re
import json
import shutil
import zipfile
from datetime import datetime, timezone
from app.exam_registry import add_or_update_exam

def scan_input_folder(input_folder: str) -> list[str]:
    files = []
    if not os.path.exists(input_folder):
        return files
    for root, _, filenames in os.walk(input_folder):
        for f in filenames:
            if f.lower().endswith(('.pdf', '.zip')):
                files.append(os.path.join(root, f))
    return sorted(files)

def safe_extract_zip(zip_path: str, temp_dir: str) -> list[str]:
    extracted_pdfs = []
    if not os.path.exists(zip_path):
        return extracted_pdfs
    
    os.makedirs(temp_dir, exist_ok=True)
    abs_temp_dir = os.path.abspath(temp_dir)
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for member in zip_ref.infolist():
            # Resolve target path to prevent Zip Slip vulnerability
            target_path = os.path.abspath(os.path.join(abs_temp_dir, member.member_name if hasattr(member, 'member_name') else member.filename))
            
            if not target_path.startswith(abs_temp_dir):
                continue  # Skip insecure members
            
            if member.is_dir():
                os.makedirs(target_path, exist_ok=True)
            else:
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                with zip_ref.open(member, 'r') as source, open(target_path, 'wb') as target:
                    shutil.copyfileobj(source, target)
                if member.filename.lower().endswith('.pdf'):
                    extracted_pdfs.append(target_path)
                    
    return sorted(extracted_pdfs)

def parse_filename_metadata(file_path: str) -> dict:
    filename = os.path.basename(file_path)
    name_without_ext, _ = os.path.splitext(filename)
    
    # Subject matching: default to math, check keywords
    subject = "math"
    lower_name = name_without_ext.lower()
    words_for_subject = re.split(r"[_\s\-0-9]+", lower_name)
    if any(w in words_for_subject for w in ["ar", "arab", "arabic", "arabe"]):
        subject = "arabic"
    elif any(w in words_for_subject for w in ["fr", "franc", "french", "français", "francais"]):
        subject = "french"
    elif any(w in words_for_subject for w in ["islam", "islamique", "islamic"]):
        subject = "islamic_education"
        
    # Year matching: 4-digit number between 2000 and 2099
    year_match = re.search(r"(?<!\d)(20\d{2})(?!\d)", name_without_ext)
    year = int(year_match.group(1)) if year_match else None
    
    # Correction matching
    is_correction = False
    correction_keywords = ["correction", "corrigé", "corrige", "solution", "answers", "cor"]
    for keyword in correction_keywords:
        if keyword in lower_name:
            is_correction = True
            break
            
    # Region extraction
    words = re.split(r"[_\s\-0-9]+", name_without_ext)
    filter_words = {
        "correction", "corrigé", "corrige", "solution", "answers", "cor",
        "math", "maths", "diagnostic", "exam", "examen", "sujet", "pdf",
        "6aep", "aep", "grade", "primary", "pr", "regional", "provincial", "zip",
        "draft", "tarbiya", "tarbiyah", "islamia", "eveil", "ijtimaeyat", "history", "geography", "social"
    }
    
    region = None
    for word in words:
        word_clean = word.strip().lower()
        if len(word_clean) >= 3 and word_clean not in filter_words and word_clean.isalpha():
            region = word_clean.capitalize()
            break
            
    return {
        "subject": subject,
        "year": year,
        "region": region,
        "is_correction": is_correction
    }

def extract_pdf_text(pdf_path: str) -> str:
    text = ""
    # Try fitz (PyMuPDF) first
    try:
        import fitz
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        return text
    except Exception:
        pass
        
    # Fallback to PyPDF2
    try:
        import PyPDF2
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text
    except Exception:
        return ""

def get_pdf_page_count(pdf_path: str) -> int:
    try:
        import fitz
        doc = fitz.open(pdf_path)
        return len(doc)
    except Exception:
        pass
    try:
        import PyPDF2
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            return len(reader.pages)
    except Exception:
        return 0

def parse_draft_questions(text: str, exam_id: str) -> list[dict]:
    questions = []
    if not text or len(text.strip()) < 100:
        return questions
        
    # Heuristic to split text by common question numbers
    pattern = r"(?:Question|Q|Exercice|Ex)\s*(\d+)[:\-\.\)]|(?:\n\s*|\A\s*)(\d+)[:\-\.\)]\s"
    matches = list(re.finditer(pattern, text, re.IGNORECASE))
    
    if not matches:
        return questions
        
    for i, match in enumerate(matches):
        q_num = match.group(1) or match.group(2)
        start_idx = match.end()
        end_idx = matches[i+1].start() if i + 1 < len(matches) else len(text)
        q_text = text[start_idx:end_idx].strip()
        
        # Clean spacing
        q_text = re.sub(r"\s+", " ", q_text)
        if len(q_text) > 400:
            q_text = q_text[:400] + "..."
            
        q_id = f"{exam_id}_Q{q_num.zfill(2)}"
        
        questions.append({
            "question_id": q_id,
            "page": 1,
            "domain": "numbers_calculation",
            "topic_id": "unknown",
            "subtopic": "unknown",
            "question_text": q_text or f"Draft Question {q_num}",
            "answer_type": "text",
            "difficulty": "medium",
            "requires_image_upload": False,
            "requires_visual_support": False,
            "skill_tag": "unknown",
            "correction_needed": "",
            "common_mistakes": "",
            "remediation_hint": "",
            "linked_revision_note_topic_id": "unknown",
            "expected_answer": ""
        })
        
    return questions

def process_exam_file(file_path: str, temp_dir: str, output_dir: str, package_metadata: dict = None) -> dict:
    if not file_path.lower().endswith('.pdf'):
        return {
            "success": False,
            "error": "Le fichier doit être un PDF"
        }
        
    filename = os.path.basename(file_path)
    metadata = parse_filename_metadata(file_path)
    
    subject = metadata["subject"]
    year = metadata["year"]
    region = metadata["region"]
    is_correction = metadata["is_correction"]
    
    # Normalize ID
    region_str = region.lower() if region else "unknown_region"
    year_str = str(year) if year else "unknown_year"
    exam_id = f"{subject}_{region_str}_{year_str}"
    if is_correction:
        exam_id += "_correction"
        
    # Get page count
    total_pages = get_pdf_page_count(file_path)
    
    # Extract text
    extracted_text = extract_pdf_text(file_path)
    text_length = len(extracted_text.strip())
    
    # Status determination
    if is_correction:
        status = "solution_file_detected"
    elif text_length <= 100:
        status = "scanned_pdf_needs_manual_review"
    elif not region or not year:
        status = "missing_metadata"
    else:
        status = "text_extracted"
        
    needs_manual = status != "text_extracted"
    
    # Draft questions
    questions = []
    if status == "text_extracted":
        questions = parse_draft_questions(extracted_text, exam_id)
        
    draft_record = {
        "exam_id": exam_id,
        "region": region or "Unknown",
        "year": year or 0,
        "subject": subject,
        "grade": "6AEP",
        "source_file": filename,
        "total_pages": total_pages,
        "questions": questions
    }
    if package_metadata:
        draft_record["package_metadata"] = package_metadata
    
    # Write draft file if imported is requested and status matches
    os.makedirs(output_dir, exist_ok=True)
    draft_file_path = os.path.join(output_dir, f"{exam_id}.json")
    
    # Avoid overwriting existing curated files in core folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    curated_file_path = os.path.join(base_dir, "data", "historical_exams", f"{exam_id}.json")
    
    if not os.path.exists(curated_file_path):
        with open(draft_file_path, "w", encoding="utf-8") as f:
            json.dump(draft_record, f, indent=2, ensure_ascii=False)
            
    # Add to registry
    registry_record = {
        "exam_id": exam_id,
        "source_file": filename,
        "subject": subject,
        "region": region or "Unknown",
        "year": year or 0,
        "status": status,
        "questions_count": len(questions),
        "needs_manual_verification": needs_manual,
        "imported_at": datetime.now(timezone.utc).isoformat()
    }
    if package_metadata:
        registry_record["package_metadata"] = package_metadata
        
    updated = add_or_update_exam(registry_record)
    
    return {
        "success": True,
        "exam_id": exam_id,
        "status": status,
        "questions_count": len(questions),
        "needs_manual": needs_manual,
        "registry_updated": updated
    }

def process_zip_package_file(zip_path: str, temp_dir: str, output_dir: str) -> dict:
    import hashlib
    from app.zip_exam_package import analyze_zip_package
    
    # 1. Calculate package_id
    h = hashlib.md5()
    try:
        with open(zip_path, "rb") as f:
            chunk = f.read(8192)
            while chunk:
                h.update(chunk)
                chunk = f.read(8192)
        package_id = h.hexdigest()
    except Exception:
        package_id = hashlib.md5(os.path.basename(zip_path).encode("utf-8")).hexdigest()
        
    zip_filename = os.path.basename(zip_path)
    
    # 2. Run analysis
    analysis = analyze_zip_package(zip_path)
    
    # 3. Create destination directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    extracted_packages_dir = os.path.join(base_dir, "data", "historical_exams", "imported", "extracted_packages", package_id)
    os.makedirs(extracted_packages_dir, exist_ok=True)
    abs_pkg_dir = os.path.abspath(extracted_packages_dir)
    
    # 4. Extract PDFs safely (Zip Slip protection)
    extracted_paths_map = {}
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for member in zip_ref.infolist():
            if member.is_dir() or not member.filename.lower().endswith('.pdf'):
                continue
            
            # Resolve target path to prevent Zip Slip vulnerability
            target_path = os.path.abspath(os.path.join(abs_pkg_dir, member.filename))
            if not target_path.startswith(abs_pkg_dir):
                continue  # Zip Slip protection
                
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with zip_ref.open(member, 'r') as source, open(target_path, 'wb') as target:
                shutil.copyfileobj(source, target)
            extracted_paths_map[member.filename] = target_path
            
    # 5. Process each PDF
    imported_exam_ids = []
    exams_imported = 0
    duplicates_skipped = 0
    scanned_manual_review_needed = 0
    errors = 0
    
    for item in analysis["items"]:
        internal_path = item["internal_path"]
        file_path = extracted_paths_map.get(internal_path)
        if not file_path:
            continue
            
        package_metadata = {
            "package_id": package_id,
            "zip_filename": zip_filename,
            "internal_pdf_path": internal_path,
            "paired_solution_internal_path": item["paired_with"] or "",
            "paired_solution_file_path": extracted_paths_map.get(item["paired_with"], "") if item["paired_with"] else "",
            "package_warnings": item["warnings"]
        }
        
        try:
            res = process_exam_file(file_path, temp_dir, output_dir, package_metadata=package_metadata)
            if res["success"]:
                exam_id = res["exam_id"]
                imported_exam_ids.append(exam_id)
                if res["registry_updated"]:
                    exams_imported += 1
                else:
                    duplicates_skipped += 1
                if res["status"] in ["scanned_pdf_needs_manual_review", "scanned_pdf_needs_review"]:
                    scanned_manual_review_needed += 1
            else:
                errors += 1
        except Exception:
            errors += 1
            
    # Combine analysis and metrics
    result = dict(analysis)
    result.update({
        "package_id": package_id,
        "exams_imported": exams_imported,
        "duplicates_skipped": duplicates_skipped,
        "scanned_manual_review_needed": scanned_manual_review_needed,
        "errors": errors,
        "imported_exam_ids": imported_exam_ids
    })
    return result
