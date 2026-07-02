import io
import os
import json
import pytest
from fastapi.testclient import TestClient
from app.health_api import app
from app.exam_registry import load_registry, save_registry
from unittest.mock import patch, MagicMock

client = TestClient(app)

@pytest.fixture
def clean_registry_and_imported_exams():
    # Save original registry state
    registry = load_registry()
    original = registry.copy()
    
    # Target exam ID
    exam_id = "math_test_curation"
    
    yield exam_id
    
    # Restore registry
    save_registry(original)
    
    # Delete temp JSON if created
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_json = os.path.join(base_dir, "data", "historical_exams", "imported", f"{exam_id}.json")
    if os.path.exists(temp_json):
        try:
            os.remove(temp_json)
        except Exception:
            pass

def test_question_review_workflow(clean_registry_and_imported_exams):
    exam_id = clean_registry_and_imported_exams
    
    # 1. Register a mock exam in registry first
    registry = load_registry()
    registry[exam_id] = {
        "exam_id": exam_id,
        "source_file": "math_test_curation.pdf",
        "subject": "math",
        "region": "TestRegion",
        "year": 2026,
        "status": "imported_draft",
        "questions_count": 0,
        "needs_manual_verification": True
    }
    save_registry(registry)
    
    # Mock question extraction text
    mock_pdf_text = """
    Question 1: Pose et effectue la multiplication suivante : 23.5 * 12
    Question 2: Construis un triangle ABC rectangle en A
    """
    
    # 2. Trigger question extraction API
    with patch("fitz.open") as mock_open:
        mock_doc = MagicMock()
        mock_page = MagicMock()
        mock_page.get_text.return_value = mock_pdf_text
        mock_doc.__iter__.return_value = [mock_page]
        mock_doc.__len__.return_value = 1
        mock_open.return_value = mock_doc
        
        # Mock file exists check to bypass missing PDF error
        with patch("os.path.exists", return_value=True):
            response = client.post(f"/exam-bank/{exam_id}/extract-questions")
            assert response.status_code == 200
            data = response.json()
            assert data["questions_detected"] == 2
            assert data["questions_needing_review"] == 2
            assert len(data["draft_questions"]) == 2
            
    # 3. GET /exam-bank/{exam_id}/questions and confirm they are drafts
    response_get = client.get(f"/exam-bank/{exam_id}/questions")
    assert response_get.status_code == 200
    questions = response_get.json()
    assert len(questions) == 2
    assert all(q["status"] == "draft" for q in questions)
    
    # 4. PATCH a question to update topic and approve it
    q1_id = f"{exam_id}_Q01"
    response_patch = client.patch(
        f"/exam-bank/{exam_id}/questions/{q1_id}",
        json={
            "status": "approved",
            "topic_id": "decimal_multiplication",
            "expected_answer": "282"
        }
    )
    assert response_patch.status_code == 200
    updated_q = response_patch.json()
    assert updated_q["status"] == "approved"
    assert updated_q["topic_id"] == "decimal_multiplication"
    assert updated_q["expected_answer"] == "282"
    
    # 5. Try promoting the exam to status="ready" (should FAIL because Q2 is still draft/needs_manual_classification)
    response_review_fail = client.patch(
        f"/exam-bank/{exam_id}/review",
        json={
            "status": "ready",
            "review_notes": "Attempting ready without all approved questions valid"
        }
    )
    # Wait, in the rule: "An exam can only be promoted to 'ready' if it has at least one approved question and NO APPROVED QUESTION has topic_id = needs_manual_classification."
    # Wait, is Q2 approved? No, Q2 is still "draft".
    # Wait, so the only approved question is Q1, which has topic_id = "decimal_multiplication" (valid!).
    # So this should actually PASS the "approved questions only" checks if we ignore draft/rejected questions!
    # Wait! The requirement says:
    # "An exam can only be promoted to 'ready' if:
    # - it has at least one approved question
    # - no approved question has topic_id = 'needs_manual_classification'
    # - all approved questions point to valid topic IDs
    # - rejected/draft questions are ignored for diagnostics"
    # Ah! Since Q2 is still in "draft" status, it is ignored! So the validation should actually allow promoting the exam to "ready" because Q1 is approved and valid!
    # Let's verify this. Yes, that's exactly the rule!
    # Let's test that if we approve Q2 but leave its topic_id as "needs_manual_classification", then promoting to "ready" FAILs!
    # Let's patch Q2 to status = "approved" (keeping topic_id = "needs_manual_classification" default)
    q2_id = f"{exam_id}_Q02"
    client.patch(
        f"/exam-bank/{exam_id}/questions/{q2_id}",
        json={
            "status": "approved",
            "topic_id": "needs_manual_classification"
        }
    )
    
    # Try promoting to "ready" now - it must fail because Q2 is approved but has "needs_manual_classification"!
    response_review_fail = client.patch(
        f"/exam-bank/{exam_id}/review",
        json={
            "status": "ready",
            "review_notes": "Attempting ready with needs_manual_classification"
        }
    )
    assert response_review_fail.status_code == 400
    assert "notion classifiée valide" in response_review_fail.json()["detail"]
    
    # 6. Correct Q2's topic and approve it
    client.patch(
        f"/exam-bank/{exam_id}/questions/{q2_id}",
        json={
            "status": "approved",
            "topic_id": "triangle_construction"
        }
    )
    
    # Try promoting to "ready" now - it should succeed!
    response_review_success = client.patch(
        f"/exam-bank/{exam_id}/review",
        json={
            "status": "ready",
            "review_notes": "All questions approved and classified"
        }
    )
    assert response_review_success.status_code == 200
    assert response_review_success.json()["status"] == "ready"
    
    # 7. Check student diagnostic selection only retrieves approved questions
    # Let's mark Q2 as "rejected" to see if it gets excluded from diagnostics
    client.patch(
        f"/exam-bank/{exam_id}/questions/{q2_id}",
        json={
            "status": "rejected"
        }
    )
    
    # Start a session using this exam
    response_session = client.post(
        "/diagnostic/start",
        json={
            "student_alias": "test_curation_student",
            "source": f"historical_{exam_id}"
        }
    )
    assert response_session.status_code == 200
    session_data = response_session.json()
    
    # We should only get Q1, but since select_exam_questions falls back to at least 5 questions,
    # it might fill up using the demo question bank if the exam questions are less than 5.
    # But Q1 should be in the list, and Q2 (which is rejected) must NOT be in the list!
    selected_qs = session_data["questions"]
    assert any(q["question_id"] == q1_id for q in selected_qs)
    assert not any(q["question_id"] == q2_id for q in selected_qs)
