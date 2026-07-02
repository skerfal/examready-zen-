import pytest
from fastapi.testclient import TestClient
from app.health_api import app
from app.exam_registry import load_registry, save_registry

client = TestClient(app)

@pytest.fixture
def temp_exam_registration():
    import os
    import json
    # Insert a mock imported exam into registry for testing
    registry = load_registry()
    original = registry.copy()
    
    mock_id = "math_test_review_exam"
    registry[mock_id] = {
        "exam_id": mock_id,
        "source_file": "test_review_exam.pdf",
        "subject": "math",
        "region": "TestRegion",
        "year": 2026,
        "status": "imported_draft",
        "questions_count": 1,
        "needs_manual_verification": True,
        "imported_at": "2026-06-23T22:00:00Z"
    }
    save_registry(registry)
    
    # Write mock JSON file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mock_json_dir = os.path.join(base_dir, "data", "historical_exams", "imported")
    os.makedirs(mock_json_dir, exist_ok=True)
    mock_json_path = os.path.join(mock_json_dir, f"{mock_id}.json")
    
    mock_data = {
        "exam_id": mock_id,
        "region": "TestRegion",
        "year": 2026,
        "subject": "math",
        "grade": "6AEP",
        "questions": [
            {
                "question_id": f"{mock_id}_Q01",
                "question_text": "Quelle est la somme de 2 et 3 ?",
                "topic_id": "decimal_addition",
                "status": "approved"
            }
        ]
    }
    with open(mock_json_path, "w", encoding="utf-8") as f:
        json.dump(mock_data, f, indent=2, ensure_ascii=False)
    
    yield mock_id
    
    # Restore original registry
    save_registry(original)
    
    # Clean up mock JSON
    if os.path.exists(mock_json_path):
        try:
            os.remove(mock_json_path)
        except Exception:
            pass

def test_get_exam_detail(temp_exam_registration):
    exam_id = temp_exam_registration
    response = client.get(f"/exam-bank/{exam_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["exam_id"] == exam_id
    assert data["status"] == "imported_draft"
    assert data["needs_manual_verification"] is True
    assert "metadata" in data
    assert data["metadata"]["region"] == "TestRegion"

def test_patch_review_status_success(temp_exam_registration):
    exam_id = temp_exam_registration
    
    # Update status to ready
    response = client.patch(
        f"/exam-bank/{exam_id}/review",
        json={"status": "ready", "review_notes": "All looks good!", "reviewed_by": "test_admin"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["needs_manual_verification"] is False
    assert data["review_notes"] == "All looks good!"
    assert data["reviewed_by"] == "test_admin"
    assert "updated_at" in data

def test_patch_review_invalid_status(temp_exam_registration):
    exam_id = temp_exam_registration
    response = client.patch(
        f"/exam-bank/{exam_id}/review",
        json={"status": "invalid_status_tag", "review_notes": "", "reviewed_by": "test_admin"}
    )
    assert response.status_code == 400
    assert "Invalid status" in response.json()["detail"]

def test_draft_excluded_from_diagnostic_and_list(temp_exam_registration):
    exam_id = temp_exam_registration
    
    # By default, imported_draft should NOT show in listed historical exams
    response = client.get("/historical-exams")
    assert response.status_code == 200
    exams = response.json()
    assert not any(e["exam_id"] == exam_id for e in exams)
    
    # Starting diagnostic session with imported_draft source should fallback to demo questions
    response = client.post("/diagnostic/start", json={"student_alias": "tester", "source": f"historical_{exam_id}"})
    assert response.status_code == 200
    data = response.json()
    # Confirm it returned demo questions instead of the empty test exam
    # (since the test exam questions are empty and status is not ready)
    assert len(data["questions"]) == 5
    assert all(q["question_id"].startswith("Q-MATH") for q in data["questions"])

def test_ready_imported_included_in_list(temp_exam_registration):
    exam_id = temp_exam_registration
    
    # Promote mock exam to ready
    client.patch(
        f"/exam-bank/{exam_id}/review",
        json={"status": "ready", "review_notes": "Ready to go", "reviewed_by": "admin"}
    )
    
    # Should now be listed under ready historical exams
    response = client.get("/historical-exams")
    assert response.status_code == 200
    exams = response.json()
    assert any(e["exam_id"] == exam_id for e in exams)

def test_rejected_exam_excluded(temp_exam_registration):
    exam_id = temp_exam_registration
    
    # Reject mock exam
    client.patch(
        f"/exam-bank/{exam_id}/review",
        json={"status": "rejected", "review_notes": "Spam PDF", "reviewed_by": "admin"}
    )
    
    # Excluded from liveness/listed exams
    response = client.get("/historical-exams")
    assert response.status_code == 200
    exams = response.json()
    assert not any(e["exam_id"] == exam_id for e in exams)
