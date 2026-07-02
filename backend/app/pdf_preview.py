import os
import re
from typing import Optional

def generate_pdf_previews(pdf_path: str, exam_id: str) -> dict:
    # Secure exam_id check
    if not re.match(r"^[a-zA-Z0-9_-]+$", exam_id):
        return {
            "success": False,
            "pages_rendered": 0,
            "preview_paths": [],
            "warnings": ["ID d'examen invalide."]
        }

    if not os.path.exists(pdf_path):
        return {
            "success": False,
            "pages_rendered": 0,
            "preview_paths": [],
            "warnings": [f"Le fichier PDF '{pdf_path}' n'existe pas."]
        }

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    preview_dir = os.path.join(base_dir, "data", "previews", exam_id)
    os.makedirs(preview_dir, exist_ok=True)
    
    pages_rendered = 0
    preview_paths = []
    warnings = []
    
    try:
        import fitz
        doc = fitz.open(pdf_path)
        for page_num, page in enumerate(doc, 1):
            pix = page.get_pixmap(dpi=150)
            dest_name = f"page_{str(page_num).zfill(3)}.png"
            dest_path = os.path.join(preview_dir, dest_name)
            pix.save(dest_path)
            preview_paths.append(dest_path)
            pages_rendered += 1
    except Exception as e:
        warnings.append(f"Échec de la génération des aperçus PDF : {str(e)}")
        
    return {
        "success": pages_rendered > 0,
        "pages_rendered": pages_rendered,
        "preview_paths": preview_paths,
        "warnings": warnings
    }

def get_preview_file_path(exam_id: str, page_number: int) -> Optional[str]:
    # Secure validation
    if not re.match(r"^[a-zA-Z0-9_-]+$", exam_id):
        return None
        
    if page_number <= 0:
        return None
        
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest_name = f"page_{str(page_number).zfill(3)}.png"
    dest_path = os.path.abspath(os.path.join(base_dir, "data", "previews", exam_id, dest_name))
    
    # Path traversal protection
    preview_root = os.path.abspath(os.path.join(base_dir, "data", "previews"))
    if not dest_path.startswith(preview_root):
        return None
        
    if os.path.exists(dest_path):
        return dest_path
    return None
