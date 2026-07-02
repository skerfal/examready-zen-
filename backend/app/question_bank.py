import os
import json

def get_demo_questions() -> list:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "data", "demo_math_questions.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        # Fallback empty list if something is wrong
        return []
