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
    
    exam_id = "math_test_solutions"
    
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

def test_solution_extraction_and_answer_review_workflow(clean_registry_and_imported_exams):
    exam_id = clean_registry_and_imported_exams
    
    # 1. Register and setup mock exam with 2 questions
    registry = load_registry()
    registry[exam_id] = {
        "exam_id": exam_id,
        "source_file": "math_test_solutions.pdf",
        "subject": "math",
        "region": "TestRegion",
        "year": 2026,
        "status": "imported_draft",
        "questions_count": 0,
        "needs_manual_verification": True
    }
    save_registry(registry)
    
    # Write initial questions to file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    exam_json_path = os.path.join(base_dir, "data", "historical_exams", "imported", f"{exam_id}.json")
    os.makedirs(os.path.dirname(exam_json_path), exist_ok=True)
    
    initial_data = {
        "exam_id": exam_id,
        "region": "TestRegion",
        "year": 2026,
        "subject": "math",
        "grade": "6AEP",
        "source_file": "math_test_solutions.pdf",
        "questions": [
            {
                "question_id": f"{exam_id}_Q01",
                "detected_number": 1,
                "question_text": "Combien font 12 * 3 ?",
                "topic_id": "decimal_multiplication",
                "status": "approved",
                "answer_type": "numeric"
            },
            {
                "question_id": f"{exam_id}_Q02",
                "detected_number": 2,
                "question_text": "Construire un cercle de rayon 5cm",
                "topic_id": "circle_perimeter",
                "status": "approved",
                "answer_type": "drawing_photo"
            }
        ]
    }
    with open(exam_json_path, "w", encoding="utf-8") as f:
        json.dump(initial_data, f, indent=2, ensure_ascii=False)
        
    # Mock correction text
    mock_solution_text = """
    Correction 1:
    Le résultat de la multiplication est 36.
    
    Correction 2:
    (Tracé géométrique du cercle de rayon 5cm)
    """
    
    # 2. POST /exam-bank/{exam_id}/extract-solutions
    with patch("fitz.open") as mock_open:
        mock_doc = MagicMock()
        mock_page = MagicMock()
        mock_page.get_text.return_value = mock_solution_text
        mock_doc.__iter__.return_value = [mock_page]
        mock_open.return_value = mock_doc
        
        # Write dummy file to disk to satisfy os.path.exists without global mock
        with open("dummy_corr.pdf", "w") as f:
            f.write("dummy content")
        try:
            response = client.post(
                f"/exam-bank/{exam_id}/extract-solutions",
                json={"solution_file_path": "dummy_corr.pdf"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert data["extracted_blocks_count"] == 2
        finally:
            if os.path.exists("dummy_corr.pdf"):
                os.remove("dummy_corr.pdf")
            
    # 3. GET /exam-bank/{exam_id}/answers
    response_get = client.get(f"/exam-bank/{exam_id}/answers")
    assert response_get.status_code == 200
    answers = response_get.json()
    assert len(answers) == 2
    
    a1 = [a for a in answers if a["question_id"] == f"{exam_id}_Q01"][0]
    assert "36." in a1["proposed_expected_answer"]
    assert a1["answer_matching_confidence"] == "high"
    assert a1["answer_status"] == "proposed"
    
    # 4. PATCH /exam-bank/{exam_id}/questions/{question_id}/answer to approve answer
    response_patch = client.patch(
        f"/exam-bank/{exam_id}/questions/{exam_id}_Q01/answer",
        json={
            "answer_status": "approved",
            "expected_answer": "36"
        }
    )
    assert response_patch.status_code == 200
    updated_q = response_patch.json()
    assert updated_q["answer_status"] == "approved"
    assert updated_q["expected_answer"] == "36"

    # 5. PATCH /exam-bank/{exam_id}/review to test missing answers warning
    # Q1 is numeric (auto-checkable) and has approved answer ("36").
    # Q2 is drawing_photo (not auto-checkable), so it doesn't need approved expected_answer.
    # Therefore, promoting to ready should NOT trigger a warning.
    response_review_nowarn = client.patch(
        f"/exam-bank/{exam_id}/review",
        json={
            "status": "ready",
            "review_notes": "Ready check"
        }
    )
    assert response_review_nowarn.status_code == 200
    assert "warning" not in response_review_nowarn.json()

    # Now let's add a 3rd question (numeric, auto-checkable) which has NO approved answer
    # We edit it via questions PATCH API first
    client.patch(
        f"/exam-bank/{exam_id}/questions/{exam_id}_Q03",
        json={
            "question_text": "Combien font 10 + 5 ?",
            "topic_id": "decimal_addition",
            "status": "approved",
            "answer_type": "numeric",
            "expected_answer": "",
            "answer_status": "missing"
        }
    )
    # Wait, does Q03 exist? No, we need to add it to JSON directly to test it.
    with open(exam_json_path, "r", encoding="utf-8") as f:
        exam_data = json.load(f)
    exam_data["questions"].append({
        "question_id": f"{exam_id}_Q03",
        "detected_number": 3,
        "question_text": "Combien font 10 + 5 ?",
        "topic_id": "decimal_addition",
        "status": "approved",
        "answer_type": "numeric",
        "expected_answer": "",
        "answer_status": "missing"
    })
    with open(exam_json_path, "w", encoding="utf-8") as f:
        json.dump(exam_data, f, indent=2, ensure_ascii=False)
        
    # Promote to ready again - it should succeed but return warning ready_with_missing_answers_warning
    response_review_warn = client.patch(
        f"/exam-bank/{exam_id}/review",
        json={
            "status": "ready",
            "review_notes": "Ready check with missing expected answer"
        }
    )
    assert response_review_warn.status_code == 200
    assert response_review_warn.json()["warning"] == "ready_with_missing_answers_warning"
