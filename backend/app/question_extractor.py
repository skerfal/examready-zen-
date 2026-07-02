import os
import re
from app.topic_classifier import classify_question
from app.topic_map import get_topic

def extract_questions_from_pdf(pdf_path: str, exam_id: str) -> dict:
    if not os.path.exists(pdf_path):
        return {
            "status": "scanned_needs_ocr",
            "questions": [],
            "warnings": [f"Le fichier PDF '{pdf_path}' n'existe pas."],
            "extraction_quality_summary": {
                "total_text_length": 0,
                "page_text_length": {},
                "question_blocks_detected": 0,
                "average_question_length": 0.0,
                "suspected_scanned_pdf": True,
                "suspected_layout_issue": False,
                "extraction_confidence": "scanned_needs_ocr",
                "extraction_warnings": ["missing_file"]
            }
        }
        
    pages = []
    # 1. Page-by-page text extraction
    try:
        import fitz
        doc = fitz.open(pdf_path)
        for page_num, page in enumerate(doc, 1):
            pages.append((page_num, page.get_text() or ""))
    except Exception:
        try:
            import PyPDF2
            with open(pdf_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page_num, page in enumerate(reader.pages, 1):
                    pages.append((page_num, page.extract_text() or ""))
        except Exception:
            pass

    # 2. Check if OCR text is available for this exam_id
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ocr_dir = os.path.join(base_dir, "data", "ocr", exam_id)
    ocr_pages = []
    is_ocr_sourced = False
    
    if os.path.exists(ocr_dir):
        try:
            for fname in sorted(os.listdir(ocr_dir)):
                match = re.match(r"^page_(\d+)\.txt$", fname)
                if match:
                    p_num = int(match.group(1))
                    txt_path = os.path.join(ocr_dir, fname)
                    try:
                        with open(txt_path, "r", encoding="utf-8") as f:
                            ocr_pages.append((p_num, f.read() or ""))
                    except Exception:
                        pass
        except OSError:
            pass

    # Text density check (scanned vs selectable text)
    total_text = "".join(text for _, text in pages).strip()
    total_text_length = len(total_text)
    
    if total_text_length < 100 and ocr_pages:
        pages = ocr_pages
        total_text = "".join(text for _, text in pages).strip()
        total_text_length = len(total_text)
        is_ocr_sourced = True
        
    page_text_length = {str(page_num): len(text) for page_num, text in pages}
    
    if total_text_length < 100 and not is_ocr_sourced:
        return {
            "status": "scanned_needs_ocr",
            "questions": [],
            "warnings": ["Le document PDF semble être un scan (OCR non disponible ou insuffisant)."],
            "extraction_quality_summary": {
                "total_text_length": total_text_length,
                "page_text_length": page_text_length,
                "question_blocks_detected": 0,
                "average_question_length": 0.0,
                "suspected_scanned_pdf": True,
                "suspected_layout_issue": False,
                "extraction_confidence": "scanned_needs_ocr",
                "extraction_warnings": ["suspected_scanned_pdf"]
            }
        }

    # 3. Splitting question blocks
    questions = []
    q_counter = 1
    
    # Pattern to match common question starters like "Question 1:", "Q2-", "1)", "Exercice 3."
    pattern = r"(?:Question|Q|Exercice|Ex)\s*(\d+)[:\-\.\)]|(?:\n\s*|\A\s*)(\d+)[:\-\.\)]\s"
    
    for page_num, page_text in pages:
        matches = list(re.finditer(pattern, page_text, re.IGNORECASE))
        if not matches:
            continue
            
        for i, match in enumerate(matches):
            q_num_str = match.group(1) or match.group(2)
            try:
                detected_num = int(q_num_str)
            except ValueError:
                detected_num = q_counter
                
            start_idx = match.end()
            end_idx = matches[i+1].start() if i + 1 < len(matches) else len(page_text)
            q_text = page_text[start_idx:end_idx].strip()
            
            # Clean whitespace and limit size
            q_text = re.sub(r"\s+", " ", q_text)
            if len(q_text) > 400:
                q_text = q_text[:400] + "..."
                
            q_id = f"{exam_id}_Q{str(detected_num).zfill(2)}"
            
            # Classification
            classification = classify_question(q_text)
            topic_id = classification["topic_id"]
            topic_confidence = classification["confidence"]
            classification_reason = classification["reason"]
            
            topic_info = get_topic(topic_id)
            domain = "numbers_calculation"
            requires_visual_support = False
            requires_image_upload = False
            
            if topic_info:
                domain = topic_info.get("domain", "numbers_calculation")
                requires_visual_support = topic_info.get("requires_visual_support", False)
                requires_image_upload = topic_info.get("supports_photo_answer", False)
                
            # Inferred answer type and difficulty
            answer_type = "text"
            if requires_image_upload:
                answer_type = "drawing_photo"
            elif any(w in q_text.lower() for w in ["calcule", "pose et effectue", "somme", "produit", "quotient"]):
                answer_type = "numeric"
            elif any(w in q_text.lower() for w in ["graphique", "diagramme", "popular", "muni"]):
                answer_type = "chart_interpretation"
                
            difficulty = "medium"
            if any(w in q_text.lower() for w in ["simplifie", "complexe", "difficile"]):
                difficulty = "hard"
            elif any(w in q_text.lower() for w in ["facile", "convertis"]):
                difficulty = "easy"
                
            # Individual question quality check
            q_warnings = []
            if len(q_text) < 30:
                q_warnings.append("too_short")
                q_confidence = "low"
            elif len(q_text) > 350:
                q_warnings.append("extremely_long")
                q_confidence = "medium"
            else:
                q_confidence = "high"
                
            if is_ocr_sourced:
                q_confidence = "ocr_needs_review"
                q_status = "needs_review"
                q_warnings.append("ocr_derived")
            else:
                q_status = "draft"
                
            questions.append({
                "question_id": q_id,
                "question_text": q_text or f"Question {detected_num}",
                "detected_number": detected_num,
                "topic_id": topic_id,
                "topic_confidence": topic_confidence,
                "classification_reason": classification_reason,
                "answer_type": answer_type,
                "difficulty": difficulty,
                "requires_visual_support": requires_visual_support,
                "requires_image_upload": requires_image_upload,
                "extraction_confidence": q_confidence,
                "extraction_warnings": q_warnings,
                "status": q_status,
                "needs_manual_verification": True,
                "source_page": page_num,
                "source_text_snippet": q_text[:100]
            })
            q_counter += 1
            
    warnings = []
    question_blocks_detected = len(questions)
    average_question_length = sum(len(q["question_text"]) for q in questions) / question_blocks_detected if question_blocks_detected > 0 else 0.0
    
    suspected_layout_issue = False
    extraction_warnings = []
    
    if question_blocks_detected == 0:
        suspected_layout_issue = True
        extraction_warnings.append("suspected_layout_issue_no_questions")
        warnings.append("Aucune question n'a été extraite du texte. Veuillez vérifier le format du PDF.")
    elif average_question_length < 30:
        suspected_layout_issue = True
        extraction_warnings.append("suspected_layout_issue_too_short")
    elif average_question_length > 600:
        suspected_layout_issue = True
        extraction_warnings.append("suspected_layout_issue_too_long")
        
    if is_ocr_sourced:
        overall_confidence = "ocr_needs_review"
        extraction_warnings.append("ocr_derived")
        warnings.append("Extraction réalisée à partir du texte OCR local.")
    elif suspected_layout_issue:
        overall_confidence = "low"
    elif any(q["extraction_confidence"] == "low" for q in questions):
        overall_confidence = "medium"
    else:
        overall_confidence = "high"
        
    quality_summary = {
        "total_text_length": total_text_length,
        "page_text_length": page_text_length,
        "question_blocks_detected": question_blocks_detected,
        "average_question_length": average_question_length,
        "suspected_scanned_pdf": is_ocr_sourced,
        "suspected_layout_issue": suspected_layout_issue,
        "extraction_confidence": overall_confidence,
        "extraction_warnings": extraction_warnings
    }
        
    return {
        "status": "text_extracted",
        "questions": questions,
        "warnings": warnings,
        "extraction_quality_summary": quality_summary
    }
