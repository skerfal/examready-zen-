import os
import json

def load_historical_exam(exam_id: str) -> dict:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "data", "historical_exams", f"{exam_id}.json")
    if not os.path.exists(file_path):
        file_path = os.path.join(base_dir, "data", "historical_exams", "imported", f"{exam_id}.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None

def _get_all_exam_filepaths() -> list[str]:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    exams_dir = os.path.join(base_dir, "data", "historical_exams")
    paths = []
    if os.path.exists(exams_dir):
        # Curated files first
        for file in sorted(os.listdir(exams_dir)):
            if file.endswith(".json") and file != "exam_registry.json":
                paths.append(os.path.join(exams_dir, file))
        imported_dir = os.path.join(exams_dir, "imported")
        if os.path.exists(imported_dir):
            for file in sorted(os.listdir(imported_dir)):
                if file.endswith(".json"):
                    paths.append(os.path.join(imported_dir, file))
    return paths

def list_historical_exams() -> list[dict]:
    exams = []
    from app.exam_registry import load_registry
    registry = load_registry()
    for exam_id, rec in registry.items():
        status = rec.get("status")
        if exam_id == "ifrane_2023_math" or status == "ready":
            exams.append({
                "exam_id": exam_id,
                "region": rec.get("region", "Unknown"),
                "year": rec.get("year", 0),
                "subject": rec.get("subject", "math"),
                "grade": rec.get("grade", "6AEP"),
                "total_questions": rec.get("questions_count", 0)
            })
    return exams

def list_questions_by_topic(topic_id: str) -> list[dict]:
    questions = []
    from app.exam_registry import load_registry
    registry = load_registry()
    for file_path in _get_all_exam_filepaths():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                exam_data = json.load(f)
                exam_id = exam_data.get("exam_id")
                rec = registry.get(exam_id, {})
                status = rec.get("status")
                if exam_id == "ifrane_2023_math" or status == "ready":
                    for q in exam_data.get("questions", []):
                        is_approved = (exam_id == "ifrane_2023_math") or (q.get("status") == "approved")
                        if is_approved and q.get("topic_id") == topic_id:
                            q["exam_id"] = exam_id
                            q["region"] = exam_data.get("region")
                            q["year"] = exam_data.get("year")
                            questions.append(q)
        except Exception:
            pass
    return questions

def list_questions_requiring_photo() -> list[dict]:
    questions = []
    from app.exam_registry import load_registry
    registry = load_registry()
    for file_path in _get_all_exam_filepaths():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                exam_data = json.load(f)
                exam_id = exam_data.get("exam_id")
                rec = registry.get(exam_id, {})
                status = rec.get("status")
                if exam_id == "ifrane_2023_math" or status == "ready":
                    for q in exam_data.get("questions", []):
                        is_approved = (exam_id == "ifrane_2023_math") or (q.get("status") == "approved")
                        if is_approved and q.get("requires_image_upload") is True:
                            q["exam_id"] = exam_id
                            q["region"] = exam_data.get("region")
                            q["year"] = exam_data.get("year")
                            questions.append(q)
        except Exception:
            pass
    return questions

def select_diagnostic_questions_from_history(limit: int = 10) -> list[dict]:
    from app.topic_map import get_diagnostic_priority_topics
    priority_topics = [t["topic_id"] for t in get_diagnostic_priority_topics()]
    
    questions = []
    from app.exam_registry import load_registry
    registry = load_registry()
    for file_path in _get_all_exam_filepaths():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                exam_data = json.load(f)
                exam_id = exam_data.get("exam_id")
                rec = registry.get(exam_id, {})
                status = rec.get("status")
                if exam_id == "ifrane_2023_math" or status == "ready":
                    for q in exam_data.get("questions", []):
                        is_approved = (exam_id == "ifrane_2023_math") or (q.get("status") == "approved")
                        if is_approved and q.get("topic_id") in priority_topics:
                            q["exam_id"] = exam_id
                            q["region"] = exam_data.get("region")
                            q["year"] = exam_data.get("year")
                            questions.append(q)
        except Exception:
            pass
    return questions[:limit]

def select_reinforcement_questions(topic_id: str, limit: int = 5) -> list[dict]:
    return list_questions_by_topic(topic_id)[:limit]

