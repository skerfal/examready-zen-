import os
import sys
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.historical_exam_bank import load_historical_exam, list_historical_exams, list_questions_requiring_photo
from app.topic_map import list_topics
from app.health_api import app

client = TestClient(app)

def test_ifrane_exam_loads_and_has_structure():
    exam = load_historical_exam("ifrane_2023_math")
    assert exam is not None
    assert exam["exam_id"] == "ifrane_2023_math"
    assert exam["region"] == "Ifrane"
    assert exam["year"] == 2023
    assert exam["subject"] == "math"
    assert exam["grade"] == "6AEP"
    assert len(exam["questions"]) >= 18

def test_ifrane_exam_has_all_domains():
    exam = load_historical_exam("ifrane_2023_math")
    domains = set(q["domain"] for q in exam["questions"])
    
    # Assert all core math domains are present
    assert "numbers_calculation" in domains
    assert "geometry" in domains
    assert "measurement" in domains
    assert "proportionality_word_problems" in domains
    assert "data_handling" in domains

def test_all_exam_questions_link_to_valid_topic():
    exam = load_historical_exam("ifrane_2023_math")
    valid_topics = set(t["topic_id"] for t in list_topics())
    
    for q in exam["questions"]:
        assert q["topic_id"] in valid_topics, f"Question '{q['question_id']}' points to invalid topic '{q['topic_id']}'."

def test_photo_required_questions():
    photo_qs = list_questions_requiring_photo()
    assert len(photo_qs) >= 1
    # Check that drawing questions are indeed included
    types = set(q["answer_type"] for q in photo_qs)
    assert "drawing_photo" in types
    
    for q in photo_qs:
        assert q["requires_image_upload"] is True

def test_historical_exams_api_endpoints():
    response = client.get("/historical-exams")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["exam_id"] == "ifrane_2023_math"
    
    response_detail = client.get("/historical-exams/ifrane_2023_math")
    assert response_detail.status_code == 200
    assert response_detail.json()["exam_id"] == "ifrane_2023_math"

def test_questions_by_topic_endpoint():
    # Retrieve ordering numbers questions
    response = client.get("/historical-questions/topic/ordering_numbers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["topic_id"] == "ordering_numbers"

def test_photo_required_endpoint():
    response = client.get("/historical-questions/photo-required")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["requires_image_upload"] is True
