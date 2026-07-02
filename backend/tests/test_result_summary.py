import os
import sys
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.result_summary import create_student_result_summary
from app.practice_plan import create_practice_plan
from app.health_api import app

client = TestClient(app)

def test_summary_strong_score():
    res = create_student_result_summary({
        "score_percent": 100.0,
        "weak_skills": [],
        "strengths": ["decimal_subtraction"],
        "detailed_results": []
    })
    assert res["overall_level"] == "strong"
    assert "Félicitations" in res["parent_message"]
    assert len(res["main_weaknesses"]) == 0

def test_summary_progressing_with_weaknesses():
    res = create_student_result_summary({
        "score_percent": 60.0,
        "weak_skills": ["decimal_subtraction"],
        "strengths": ["decimal_addition"],
        "detailed_results": []
    })
    assert res["overall_level"] == "progressing"
    assert "decimal_subtraction" in res["main_weaknesses"]

def test_summary_needs_support():
    res = create_student_result_summary({
        "score_percent": 40.0,
        "weak_skills": ["decimal_subtraction", "decimal_addition"],
        "strengths": [],
        "detailed_results": []
    })
    assert res["overall_level"] == "needs_support"
    assert res["review_required"] is True

def test_practice_plan_with_weak_skills():
    plan = create_practice_plan({
        "weak_skills": ["decimal_subtraction"],
        "strengths": []
    })
    assert plan["plan_title"] == "Plan de pratique ciblé - ExamReady Zen"
    assert "decimal_subtraction" in plan["recommended_skills"]
    assert len(plan["practice_blocks"]) == 1
    assert plan["practice_blocks"][0]["skill_tag"] == "decimal_subtraction"
    assert plan["practice_blocks"][0]["question_count"] >= 1

def test_practice_plan_no_weak_skills():
    plan = create_practice_plan({
        "weak_skills": [],
        "strengths": ["decimal_subtraction"]
    })
    assert plan["plan_title"] == "Plan de renforcement général - ExamReady Zen"
    assert "general_review" in plan["recommended_skills"]
    assert len(plan["practice_blocks"]) == 1
    assert plan["practice_blocks"][0]["skill_tag"] == "mixed_review"

def test_api_submit_includes_summary_and_plan():
    # Start session
    start_resp = client.post("/diagnostic/start", json={"student_alias": "younes"})
    session_id = start_resp.json()["session_id"]
    questions = start_resp.json()["questions"]
    
    # Submit wrong answers to ensure weak skills are created
    answers = [{"question_id": q["question_id"], "student_answer": "999.99"} for q in questions]
    
    submit_resp = client.post("/diagnostic/submit", json={
        "session_id": session_id,
        "answers": answers
    })
    assert submit_resp.status_code == 200
    data = submit_resp.json()
    
    assert "result_summary" in data
    assert "practice_plan" in data
    assert data["result_summary"]["overall_level"] == "needs_support"
    assert len(data["practice_plan"]["practice_blocks"]) >= 1
