import os
import json

ALLOWED_STATUSES = [
    "ready",
    "imported_draft",
    "needs_manual_review",
    "scanned_pdf_needs_review",
    "missing_metadata",
    "rejected"
]

def get_registry_path() -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "data", "historical_exams", "exam_registry.json")

def load_registry() -> dict:
    path = get_registry_path()
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_registry(registry_data: dict):
    path = get_registry_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(registry_data, f, indent=2, ensure_ascii=False)

def add_or_update_exam(exam_record: dict) -> bool:
    registry = load_registry()
    exam_id = exam_record.get("exam_id")
    if not exam_id:
        return False
        
    source_file = exam_record.get("source_file")
    
    # Check by source_file to avoid duplicate ingestion
    if source_file:
        for rec in registry.values():
            if rec.get("source_file") == source_file and rec.get("exam_id") != exam_id:
                return False
                
    existing = registry.get(exam_id)
    if existing:
        changed = False
        for key, val in exam_record.items():
            if existing.get(key) != val:
                existing[key] = val
                changed = True
        if changed:
            save_registry(registry)
            return True
        return False
    else:
        registry[exam_id] = exam_record
        save_registry(registry)
        return True
