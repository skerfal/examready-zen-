import os
import json

def load_topic_map() -> list:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "data", "math_topic_map_6aep.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def list_topics() -> list[dict]:
    return load_topic_map()

def get_topic(topic_id: str) -> dict:
    topics = load_topic_map()
    for t in topics:
        if t["topic_id"] == topic_id:
            return t
    return None

def list_topics_by_domain(domain: str) -> list[dict]:
    topics = load_topic_map()
    return [t for t in topics if t["domain"] == domain]

def get_diagnostic_priority_topics() -> list[dict]:
    topics = load_topic_map()
    return [t for t in topics if t.get("priority_for_diagnostic") == "high"]

def get_topics_requiring_photo_answer() -> list[dict]:
    topics = load_topic_map()
    return [t for t in topics if t.get("supports_photo_answer") is True]
