import os
import sys
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.health_api import app
from app.session import SESSIONS
from app.readiness_checks import run_all_readiness_checks

client = TestClient(app)

def test_start_draws_from_historical_exam_by_default():
    # start diagnostic draws questions from Ifrane 2023 historical exam by default
    response = client.post("/diagnostic/start", json={})
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "questions" in data
    
    questions = data["questions"]
    assert len(questions) >= 5
    
    # Check that questions are drawn from Ifrane (IFR23-Qxx)
    ifrane_qs = [q for q in questions if q["question_id"].startswith("IFR23")]
    assert len(ifrane_qs) >= 5
    
    # diagnostic start does not expose expected_answer
    for q in questions:
        assert "expected_answer" not in q
        assert "correction_steps" not in q
        assert "correction_needed" not in q
        assert "answer_key" not in q
        
        # diagnostic start includes topic_id and requires_image_upload
        assert "topic_id" in q
        assert "requires_image_upload" in q
        assert "requires_visual_support" in q

def test_submit_wrong_decimal_subtraction():
    # start diagnostic using demo questions so we have a question with skill_tag/topic_id 'decimal_subtraction'
    response = client.post("/diagnostic/start", json={"student_alias": "demo_student", "source": "demo"})
    assert response.status_code == 200
    start_data = response.json()
    session_id = start_data["session_id"]
    questions = start_data["questions"]
    
    # Let's find the decimal subtraction question Q-MATH-01 (or any decimal_subtraction topic)
    # and submit a wrong answer
    answers = []
    for q in questions:
        if q["topic_id"] == "decimal_subtraction":
            answers.append({"question_id": q["question_id"], "student_answer": "999.99"})
        else:
            # Answer correctly to isolate decimal_subtraction as a weak skill
            original_q = next(item for item in SESSIONS[session_id]["questions"] if item["question_id"] == q["question_id"])
            answers.append({"question_id": q["question_id"], "student_answer": original_q["expected_answer"]})
            
    submit_resp = client.post("/diagnostic/submit", json={
        "session_id": session_id,
        "answers": answers
    })
    assert submit_resp.status_code == 200
    submit_data = submit_resp.json()
    
    # submit diagnostic with wrong decimal_subtraction returns weak skill decimal_subtraction
    assert "decimal_subtraction" in submit_data["weak_skills"]
    
    # response includes revision note for decimal_subtraction
    notes = submit_data["revision_notes_for_weak_skills"]
    assert len(notes) >= 1
    sub_note = next((n for n in notes if n["topic_id"] == "decimal_subtraction"), None)
    assert sub_note is not None
    assert "decimal_subtraction" in sub_note["topic_id"]
    assert "title_for_student" in sub_note
    assert "very_easy_explanation" in sub_note

def test_weak_geometry_angle_skill_flags():
    # start diagnostic on Ifrane historical exam
    response = client.post("/diagnostic/start", json={"student_alias": "demo_student", "source": "historical_ifrane_2023"})
    assert response.status_code == 200
    start_data = response.json()
    session_id = start_data["session_id"]
    questions = start_data["questions"]
    
    # Make sure we have an angle_construction question in the started session
    # IFR23-Q07 topic_id is 'angle_construction'
    assert any(q["topic_id"] == "angle_construction" for q in questions)
    
    # Submit wrong answer for angle_construction, correct for others
    answers = []
    for q in questions:
        if q["topic_id"] == "angle_construction":
            answers.append({"question_id": q["question_id"], "student_answer": "wrong_drawing"})
        else:
            original_q = next(item for item in SESSIONS[session_id]["questions"] if item["question_id"] == q["question_id"])
            answers.append({"question_id": q["question_id"], "student_answer": original_q["expected_answer"]})
            
    submit_resp = client.post("/diagnostic/submit", json={
        "session_id": session_id,
        "answers": answers
    })
    assert submit_resp.status_code == 200
    submit_data = submit_resp.json()
    
    assert "angle_construction" in submit_data["weak_skills"]
    
    # weak geometry/angle skill returns visual_support_needed true
    assert submit_data["visual_support_needed"] is True
    
    # weak geometry/angle skill returns photo_upload_recommended true
    assert submit_data["photo_upload_recommended"] is True

def test_readiness_checks_include_all_new_checks():
    status = run_all_readiness_checks()
    assert status["overall_status"] == "ready"
    checks = status["checks"]
    
    # readiness checks include topic map, revision notes, and historical exam bank
    assert "topic_map_available" in checks
    assert "revision_notes_available" in checks
    assert "historical_exam_bank_available" in checks
    assert "historical_questions_link_to_valid_topics" in checks
    assert "photo_required_question_exists" in checks
    
    assert checks["topic_map_available"]["status"] == "pass"
    assert checks["revision_notes_available"]["status"] == "pass"
    assert checks["historical_exam_bank_available"]["status"] == "pass"
    assert checks["historical_questions_link_to_valid_topics"]["status"] == "pass"
    assert checks["photo_required_question_exists"]["status"] == "pass"
