import os
import sys
import uuid
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.health_api import app
from app.session import SESSIONS

client = TestClient(app)

def test_check_answer_flow():
    # 1. Create a mock session with different types of questions
    session_id = str(uuid.uuid4())
    
    mock_questions = [
        {
            "question_id": "Q-MATH-01",
            "question_text": "Calculer: 47.55 - 12.45",
            "expected_answer": "35.10",
            "answer_status": "approved",
            "exam_id": "imported_exam_1",
            "answer_type": "numeric"
        },
        {
            "question_id": "Q-MATH-02",
            "question_text": "Compléter la figure géométrique",
            "expected_answer": "Tracé géométrique",
            "answer_status": "approved",
            "exam_id": "imported_exam_1",
            "answer_type": "geometry",
            "requires_visual_support": True
        },
        {
            "question_id": "Q-MATH-03",
            "question_text": "Calculer: 5 + 5",
            "expected_answer": "10",
            "proposed_expected_answer": "10",
            "answer_status": "proposed",  # unapproved proposed answer
            "exam_id": "imported_exam_1",
            "answer_type": "numeric"
        },
        {
            "question_id": "Q-MATH-04",
            "question_text": "Calculer: 2 * 3",
            "expected_answer": "6",
            "answer_status": "approved",
            "exam_id": "ifrane_2023_math",  # curated standard (always approved)
            "answer_type": "numeric"
        }
    ]
    
    SESSIONS[session_id] = {
        "student_alias": "test_student",
        "questions": mock_questions,
        "status": "active"
    }
    
    # Test case 1: Correct approved answer returns correct
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": session_id,
        "question_id": "Q-MATH-01",
        "student_answer": "35.10"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "correct"
    assert data["expected_answer_available"] is True
    assert data["can_retry"] is False
    assert data["needs_visual_review"] is False

    # Test case 2: Wrong answer returns incorrect
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": session_id,
        "question_id": "Q-MATH-01",
        "student_answer": "34.00"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "incorrect"
    assert data["expected_answer_available"] is True
    assert data["can_retry"] is True
    assert data["mistake_type"] == "conceptual_error"

    # Test case 3: 35.1 vs 35.10 returns partial/precision warning
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": session_id,
        "question_id": "Q-MATH-01",
        "student_answer": "35.1"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "partial"
    assert data["expected_answer_available"] is True
    assert data["can_retry"] is True
    assert data["mistake_type"] == "correct_value_precision_warning"

    # Test case 4: Geometry question returns manual_check_required with needs_visual_review=true
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": session_id,
        "question_id": "Q-MATH-02",
        "student_answer": "some answer"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "manual_check_required"
    assert data["needs_visual_review"] is True
    assert data["can_retry"] is False

    # Test case 5: Unapproved proposed expected answer is not used for grading (returns manual_check_required)
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": session_id,
        "question_id": "Q-MATH-03",
        "student_answer": "10"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "manual_check_required"
    assert data["expected_answer_available"] is False
    assert data["correct_answer_display"] is None

    # Test case 6: Curated exam question is always approved even if status is not explicitly set to approved
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": session_id,
        "question_id": "Q-MATH-04",
        "student_answer": "6"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "correct"
    assert data["expected_answer_available"] is True

    # Test case 7: Invalid session_id returns 404
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": "non-existent-session-id",
        "question_id": "Q-MATH-01",
        "student_answer": "35.10"
    })
    assert resp.status_code == 404
    assert "Invalid session_id" in resp.json()["detail"]

    # Test case 8: Invalid question_id returns 404
    resp = client.post("/diagnostic/check-answer", json={
        "session_id": session_id,
        "question_id": "Q-INVALID-ID",
        "student_answer": "35.10"
    })
    assert resp.status_code == 404
    assert "Question not found" in resp.json()["detail"]
