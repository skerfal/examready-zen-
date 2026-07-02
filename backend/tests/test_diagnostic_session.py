import os
import sys
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.health_api import app
from app.session import SESSIONS

client = TestClient(app)

def test_start_diagnostic_success():
    response = client.post("/diagnostic/start", json={"student_alias": "younes"})
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "questions" in data
    assert isinstance(data["questions"], list)
    assert len(data["questions"]) >= 1
    # Check that expected answer is stripped to prevent client cheating
    for q in data["questions"]:
        assert "expected_answer" not in q
        assert "correction_steps" not in q

def test_submit_diagnostic_golden_precision():
    # Start session
    start_resp = client.post("/diagnostic/start", json={"student_alias": "younes", "source": "demo"})
    session_id = start_resp.json()["session_id"]
    questions = start_resp.json()["questions"]
    
    # Let's find the subtraction question and submit answers
    answers = []
    for q in questions:
        q_id = q["question_id"]
        # Find expected answer from in-memory session database to mock correct answers
        # For Q-MATH-01, we want to mock the student answer as "35.1" (golden case)
        if q_id == "Q-MATH-01":
            answers.append({"question_id": q_id, "student_answer": "35.1"})
        else:
            # Let's find the correct answer in the active session database to mark correct
            original_q = next(item for item in SESSIONS[session_id]["questions"] if item["question_id"] == q_id)
            answers.append({"question_id": q_id, "student_answer": original_q["expected_answer"]})
            
    submit_resp = client.post("/diagnostic/submit", json={
        "session_id": session_id,
        "answers": answers
    })
    assert submit_resp.status_code == 200
    data = submit_resp.json()
    assert data["session_id"] == session_id
    assert data["score_percent"] == 100.0
    assert len(data["weak_skills"]) == 0
    assert "decimal_subtraction" in data["strengths"]
    
    # Verify detailed results has formatting precision issue graded correctly
    sub_res = next(r for r in data["detailed_results"] if r["question_id"] == "Q-MATH-01")
    assert sub_res["diagnosis"]["concept_mastery"] == "correct"
    assert sub_res["diagnosis"]["diagnosis"] == "formatting precision issue"
 
def test_submit_diagnostic_wrong_answers_produces_weak_skills():
    start_resp = client.post("/diagnostic/start", json={"student_alias": "younes", "source": "demo"})
    session_id = start_resp.json()["session_id"]
    questions = start_resp.json()["questions"]
    
    # Submit wrong answers for all questions
    answers = [{"question_id": q["question_id"], "student_answer": "999.99"} for q in questions]
    
    submit_resp = client.post("/diagnostic/submit", json={
        "session_id": session_id,
        "answers": answers
    })
    assert submit_resp.status_code == 200
    data = submit_resp.json()
    assert data["score_percent"] == 0.0
    assert len(data["weak_skills"]) > 0
    # Since we got 0% on decimal_subtraction, it must be in weak_skills
    assert "decimal_subtraction" in data["weak_skills"]
    # Practice questions should be recommended matching weak skills
    assert len(data["recommended_practice"]) >= 1
    # Check that recommended questions are from the database
    for q in data["recommended_practice"]:
        assert "question_id" in q
        assert "skill_tag" in q
        assert q["skill_tag"] in data["weak_skills"]
 
def test_submit_diagnostic_unknown_session_id():
    response = client.post("/diagnostic/submit", json={
        "session_id": "invalid-session-uuid-12345",
        "answers": []
    })
    assert response.status_code == 404
    assert "Invalid session_id" in response.json()["detail"]
 
def test_privacy_and_no_real_student_data_stored():
    # Make sure we don't store real emails in session alias or elsewhere
    start_resp = client.post("/diagnostic/start", json={"student_alias": "real_student@test.com", "source": "demo"})
    session_id = start_resp.json()["session_id"]

    
    # Check SESSIONS store
    session_record = SESSIONS.get(session_id)
    assert session_record is not None
    # We should have sanitized it using safety screen or similar, or verified that we only use mock profiles.
    # Actually, let's verify that when a student alias contains PII (e.g. email), SESSIONS stores it,
    # but does SESSIONS sanitize it? Yes, we can make sure SESSIONS doesn't persist raw PII.
    # To do this, let's check if the agent.py or safety.py screens it.
    # Wait, SESSIONS stores student_alias. Let's see: should SESSIONS redact the alias?
    # Yes, let's sanitize student_alias in start_diagnostic_session if it contains PII!
    # Let's inspect session.py - SESSIONS[session_id] = { "student_alias": student_alias, ... }
    # To redact PII from student_alias, let's modify session.py to run redact_pii(student_alias)!
    # Let's verify that session_record["student_alias"] is sanitized.
    from app.safety import redact_pii
    assert session_record["student_alias"] == "[REDACTED_EMAIL]"
