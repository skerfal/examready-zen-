import os
import pytest
from fastapi.testclient import TestClient
from app.health_api import app

client = TestClient(app)

def test_get_exam_bank_endpoint():
    response = client.get("/exam-bank")
    assert response.status_code == 200
    data = response.json()
    
    # Assert aggregate stats are returned
    assert "total_exams" in data
    assert "total_questions" in data
    assert "subjects" in data
    assert "exams_needing_review" in data
    assert "exams" in data
    assert "topic_coverage" in data
    
    # Verify curated Ifrane 2023 math exam is listed
    exams = data["exams"]
    assert len(exams) >= 1
    ifrane_exam = next((e for e in exams if e["exam_id"] == "ifrane_2023_math"), None)
    assert ifrane_exam is not None
    assert ifrane_exam["region"] == "Ifrane"
    assert ifrane_exam["year"] == 2023
    assert ifrane_exam["subject"] == "math"
    assert ifrane_exam["questions_count"] == 18
    assert ifrane_exam["needs_manual_verification"] is False
    assert ifrane_exam["has_solution"] is True

    # Verify topic coverage is loaded
    coverage = data["topic_coverage"]
    assert len(coverage) > 0
    ordering_numbers_cov = next((c for c in coverage if c["topic_id"] == "ordering_numbers"), None)
    assert ordering_numbers_cov is not None
    assert ordering_numbers_cov["question_count"] >= 1
    assert ordering_numbers_cov["exam_count"] >= 1
    assert "ifrane_2023_math" in ordering_numbers_cov["exam_ids"]

def test_post_import_local_validation():
    # Test path that does not exist
    response = client.post("/exam-bank/import-local", json={"input_path": "C:\\invalid_path_that_does_not_exist"})
    assert response.status_code == 400
    assert "does not exist" in response.json()["detail"]

def test_existing_endpoints_preserved():
    # Verify that readiness check is still operational
    response = client.get("/readyz")
    assert response.status_code == 200
    assert response.json()["overall_status"] == "ready"
    
    # Verify get topics endpoint
    response = client.get("/topics")
    assert response.status_code == 200
    assert len(response.json()) == 38
