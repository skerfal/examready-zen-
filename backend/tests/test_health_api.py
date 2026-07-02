import os
import sys
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.health_api import app

client = TestClient(app)

def test_healthz_endpoint():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert data["service"] == "examready-zen-math-mvp"

def test_readyz_endpoint():
    response = client.get("/readyz")
    assert response.status_code == 200
    data = response.json()
    assert "overall_status" in data
    assert data["overall_status"] in ["ready", "warning"]

def test_diagnose_endpoint_golden():
    response = client.post("/diagnose", json={
        "question": "47.55 - 12.45",
        "student_answer": "35.1",
        "expected_answer": "35.10"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "diagnosed"
    assert data["concept_mastery"] == "correct"
    assert data["diagnosis"] == "formatting precision issue"
    assert data["human_review_required"] is False

def test_demo_questions_endpoint():
    response = client.get("/demo-questions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    # Verify fields of first question
    q = data[0]
    assert "question_id" in q
    assert "subject" in q
    assert "grade" in q
    assert "skill_tag" in q
    assert "question_text" in q
    assert "expected_answer" in q
