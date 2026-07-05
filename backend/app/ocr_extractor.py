import os
import re
import json
from typing import List, Union, Tuple, Optional
from app.pdf_preview import generate_pdf_previews

def check_ocr_availability() -> Tuple[bool, str, str]:
    """
    Checks if local OCR (pytesseract + tesseract executable) is available.
    Returns:
        (is_available, engine_name, warning_message)
    """
    try:
        import pytesseract
        from PIL import Image
    except ImportError as e:
        return (
            False,
            "none",
            "Les paquets Python 'pytesseract' ou 'Pillow' ne sont pas installés. "
            "Veuillez exécuter 'pip install pytesseract Pillow' pour les installer."
        )

    # Detect the path C:\Program Files\Tesseract-OCR\tesseract.exe directly
    tesseract_win_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_win_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_win_path
    elif os.path.exists(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"):
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"

    # Check if tesseract binary is on path or configured
    try:
        version = str(pytesseract.get_tesseract_version())
        return (True, f"tesseract (version {version})", "")
    except Exception as e:
        return (
            False,
            "tesseract_binary_missing",
            "L'exécutable Tesseract-OCR n'a pas été trouvé sur le système. "
            "Veuillez installer Tesseract-OCR sur votre machine et l'ajouter au PATH système, "
            "ou configurer 'pytesseract.pytesseract.tesseract_cmd'."
        )

def run_ocr_extraction(exam_id: str, pdf_path: str, pages: Union[str, List[int]] = "all") -> dict:
    # 1. Sanitize exam_id to prevent directory traversal
    if not re.match(r"^[a-zA-Z0-9_-]+$", exam_id):
        return {
            "exam_id": exam_id,
            "ocr_status": "error",
            "pages_processed": [],
            "ocr_engine": "none",
            "warnings": ["ID d'examen invalide."],
            "draft_text_by_page": {},
            "draft_questions_detected": 0,
            "detected_tesseract_path": "none",
            "tesseract_version": "none",
            "available_languages": [],
            "selected_language": "none"
        }

    # 2. Check ocr engine availability
    is_available, engine_name, warning_msg = check_ocr_availability()
    
    # Initialize diagnostic variables
    detected_tesseract_path = "none"
    tesseract_version = "none"
    available_languages = []
    selected_language = "default"
    
    import pytesseract
    from PIL import Image
    
    if is_available:
        detected_tesseract_path = getattr(pytesseract.pytesseract, "tesseract_cmd", "tesseract")
        try:
            tesseract_version = str(pytesseract.get_tesseract_version())
        except Exception:
            tesseract_version = "unknown"
            
        try:
            available_languages = pytesseract.get_languages()
        except Exception:
            available_languages = []
            
        # Fallback language order selection
        if "fra" in available_languages and "eng" in available_languages:
            selected_language = "fra+eng"
        elif "fra" in available_languages and "ara" in available_languages:
            selected_language = "fra+ara"
        elif "fra" in available_languages:
            selected_language = "fra"
        elif "eng" in available_languages:
            selected_language = "eng"
        else:
            selected_language = "default"
            
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ocr_dir = os.path.join(base_dir, "data", "ocr", exam_id)
    os.makedirs(ocr_dir, exist_ok=True)

    if not is_available:
        summary = {
            "exam_id": exam_id,
            "ocr_status": "ocr_engine_unavailable",
            "pages_processed": [],
            "ocr_engine": engine_name,
            "warnings": [warning_msg],
            "draft_text_by_page": {},
            "draft_questions_detected": 0,
            "detected_tesseract_path": detected_tesseract_path,
            "tesseract_version": tesseract_version,
            "available_languages": available_languages,
            "selected_language": selected_language
        }
        # Save summary to disk even if unavailable so endpoints/importer can query it
        summary_path = os.path.join(ocr_dir, "ocr_summary.json")
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        return summary

    # 3. Ensure page previews exist
    preview_root = os.path.join(base_dir, "data", "previews", exam_id)
    
    previews_existed = os.path.exists(preview_root) and len([f for f in os.listdir(preview_root) if f.startswith("page_") and f.endswith(".png")]) > 0
    if not previews_existed:
        generate_pdf_previews(pdf_path, exam_id)

    if not os.path.exists(preview_root):
        return {
            "exam_id": exam_id,
            "ocr_status": "error",
            "pages_processed": [],
            "ocr_engine": engine_name,
            "warnings": [f"Impossible de générer des aperçus pour '{pdf_path}'."],
            "draft_text_by_page": {},
            "draft_questions_detected": 0,
            "detected_tesseract_path": detected_tesseract_path,
            "tesseract_version": tesseract_version,
            "available_languages": available_languages,
            "selected_language": selected_language
        }

    # Find list of generated PNGs
    png_files = sorted([f for f in os.listdir(preview_root) if f.startswith("page_") and f.endswith(".png")])
    total_pages_count = len(png_files)

    # 4. Parse pages input
    target_page_numbers = []
    if pages == "all":
        target_page_numbers = list(range(1, total_pages_count + 1))
    elif isinstance(pages, list):
        for p in pages:
            if 1 <= p <= total_pages_count:
                target_page_numbers.append(p)
    else:
        target_page_numbers = list(range(1, total_pages_count + 1))

    draft_text_by_page = {}
    pages_processed = []
    warnings = []

    for page_num in target_page_numbers:
        img_name = f"page_{str(page_num).zfill(3)}.png"
        img_path = os.path.join(preview_root, img_name)
        if not os.path.exists(img_path):
            warnings.append(f"Aperçu manquant pour la page {page_num}.")
            continue

        try:
            img = Image.open(img_path)
            if selected_language != "default":
                text = pytesseract.image_to_string(img, lang=selected_language)
            else:
                text = pytesseract.image_to_string(img)
            
            cleaned_text = text.strip()
            draft_text_by_page[str(page_num)] = cleaned_text
            
            # Save raw page text artifact
            page_txt_path = os.path.join(ocr_dir, f"page_{str(page_num).zfill(3)}.txt")
            with open(page_txt_path, "w", encoding="utf-8") as f:
                f.write(cleaned_text)
                
            pages_processed.append(page_num)
        except Exception as e:
            warnings.append(f"Erreur d'OCR à la page {page_num} : {str(e)}")

    # Try to detect draft questions from OCR text
    draft_questions_detected = 0
    all_text = "\n".join(draft_text_by_page.values())
    pattern = r"(?:Question|Q|Exercice|Ex)\s*(\d+)[:\-\.\)]|(?:\n\s*|\A\s*)(\d+)[:\-\.\)]\s"
    draft_questions_detected = len(list(re.finditer(pattern, all_text, re.IGNORECASE)))

    ocr_status = "completed"
    if not pages_processed:
        ocr_status = "failed"
    elif warnings:
        ocr_status = "completed_with_warnings"

    summary = {
        "exam_id": exam_id,
        "ocr_status": ocr_status,
        "pages_processed": pages_processed,
        "ocr_engine": engine_name,
        "warnings": warnings,
        "draft_text_by_page": draft_text_by_page,
        "draft_questions_detected": draft_questions_detected,
        "detected_tesseract_path": detected_tesseract_path,
        "tesseract_version": tesseract_version,
        "available_languages": available_languages,
        "selected_language": selected_language
    }

    # Save summary.json
    summary_path = os.path.join(ocr_dir, "ocr_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    return summary
