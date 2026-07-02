import os
import json

def load_revision_notes() -> list:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "data", "revision_notes", "math_6aep_revision_notes.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def list_revision_notes() -> list[dict]:
    return load_revision_notes()

def get_revision_note(topic_id: str) -> dict:
    notes = load_revision_notes()
    for n in notes:
        if n["topic_id"] == topic_id:
            return n
    return None

def get_revision_notes_for_weak_skills(weak_skills: list[str]) -> list[dict]:
    notes = load_revision_notes()
    return [n for n in notes if n["topic_id"] in weak_skills]
