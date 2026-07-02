import os
import re
import sys
import json
from datetime import datetime, timezone

def check_no_hardcoded_secrets() -> dict:
    patterns = [
        re.compile(r"AIza" + r"Sy[A-Za-z0-9_-]*"),  # Split pattern to avoid triggering scanner
        re.compile(r"GOOGLE_API_KEY\s*="),
        re.compile(r"GEMINI_API_KEY\s*="),
        re.compile(r"api_key\s*=\s*[\"'][^\"']+")
    ]
    
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = ["app", "tests"]
    findings = []
    
    for d in target_dirs:
        dir_path = os.path.join(workspace_dir, d)
        if not os.path.exists(dir_path):
            continue
        for root, _, files in os.walk(dir_path):
            for file in files:
                if not file.endswith(".py"):
                    continue
                file_path = os.path.join(root, file)
                if "readiness_checks.py" in file_path:
                    continue
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                    for idx, line in enumerate(lines, 1):
                        for pattern in patterns:
                            if pattern.search(line):
                                findings.append(f"{file}:{idx}")
                except Exception:
                    pass
    if findings:
        return {"status": "fail", "message": f"Hardcoded secrets patterns detected: {findings}"}
    return {"status": "pass", "message": "No hardcoded secrets detected."}

def check_demo_data_only() -> dict:
    email_pattern = r"\b[a-zA-Z0-9._%+-]+@(?!(?:example|mock|test)\.com\b)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b"
    findings = []
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = ["app", "tests", "data"]
    
    for d in target_dirs:
        dir_path = os.path.join(workspace_dir, d)
        if not os.path.exists(dir_path):
            continue
        for root, _, files in os.walk(dir_path):
            for file in files:
                if not (file.endswith(".py") or file.endswith(".json")):
                    continue
                file_path = os.path.join(root, file)
                if "readiness_checks.py" in file_path:
                    continue
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    matches = re.findall(email_pattern, content)
                    if matches:
                        findings.append(f"{file}: {matches}")
                except Exception:
                    pass
    if findings:
        return {"status": "fail", "message": f"Potential real student data (emails) detected: {findings}"}
    return {"status": "pass", "message": "No real student data patterns detected (demo data only)."}

def check_question_bank_exists() -> dict:
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(workspace_dir, "data", "demo_math_questions.json")
    if not os.path.exists(file_path):
        return {"status": "fail", "message": "data/demo_math_questions.json does not exist."}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if len(data) < 5:
            return {"status": "fail", "message": f"Question bank contains only {len(data)} questions, expected at least 5."}
    except Exception as e:
        return {"status": "fail", "message": f"Error parsing question bank: {e}"}
    return {"status": "pass", "message": f"Question bank exists and is valid with {len(data)} questions."}

def check_agent_importable() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.agent import diagnose_math_answer
        return {"status": "pass", "message": "diagnose_math_answer imported successfully."}
    except Exception as e:
        return {"status": "fail", "message": f"Failed to import agent: {e}"}

def check_safety_screen_available() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.safety import safety_screen
        res = safety_screen({"test": "hello"})
        if not res["safe"]:
            return {"status": "fail", "message": "Safety screen failed test run."}
        return {"status": "pass", "message": "Safety screen is available and working."}
    except Exception as e:
        return {"status": "fail", "message": f"Failed to load safety screen: {e}"}

def check_golden_diagnostic_passes() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.agent import diagnose_math_answer
        res = diagnose_math_answer(
            question="47.55 - 12.45",
            student_answer="35.1",
            expected_answer="35.10"
        )
        if res.get("status") == "diagnosed" and res.get("concept_mastery") == "correct" and res.get("diagnosis") == "formatting precision issue":
            return {"status": "pass", "message": "Golden diagnostic case passes successfully."}
        return {"status": "fail", "message": f"Golden diagnostic returned unexpected results: {res}"}
    except Exception as e:
        return {"status": "fail", "message": f"Failed to run golden diagnostic: {e}"}

# New Ingestion & Topic Bank Checks
def check_topic_map_available() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.topic_map import list_topics
        topics = list_topics()
        if topics and len(topics) >= 25:
            return {"status": "pass", "message": f"Topic map is available with {len(topics)} topics."}
        return {"status": "fail", "message": "Topic map is missing or has fewer than 25 topics."}
    except Exception as e:
        return {"status": "fail", "message": f"Error verifying topic map: {e}"}

def check_revision_notes_available() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.revision_notes import list_revision_notes
        notes = list_revision_notes()
        if notes and len(notes) >= 25:
            return {"status": "pass", "message": f"Revision notes are available with {len(notes)} notes."}
        return {"status": "fail", "message": "Revision notes are missing or insufficient."}
    except Exception as e:
        return {"status": "fail", "message": f"Error verifying revision notes: {e}"}

def check_historical_exam_bank_available() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.historical_exam_bank import list_historical_exams
        exams = list_historical_exams()
        if exams:
            return {"status": "pass", "message": f"Historical exam bank is available with exams: {[e['exam_id'] for e in exams]}."}
        return {"status": "fail", "message": "Historical exam bank has no exams."}
    except Exception as e:
        return {"status": "fail", "message": f"Error verifying historical exam bank: {e}"}

def check_historical_questions_link_to_valid_topics() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.historical_exam_bank import load_historical_exam
        from app.topic_map import list_topics
        exam = load_historical_exam("ifrane_2023_math")
        if not exam:
            return {"status": "fail", "message": "Failed to load Ifrane 2023 Math exam for link checks."}
        valid_topics = set(t["topic_id"] for t in list_topics())
        invalid_links = []
        for q in exam.get("questions", []):
            if q.get("topic_id") not in valid_topics:
                invalid_links.append(f"{q['question_id']} -> {q.get('topic_id')}")
        if invalid_links:
            return {"status": "fail", "message": f"Historical questions point to invalid topics: {invalid_links}"}
        return {"status": "pass", "message": "All historical exam questions point to valid topic IDs."}
    except Exception as e:
        return {"status": "fail", "message": f"Error checking question topic links: {e}"}

def check_photo_required_question_exists() -> dict:
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        from app.historical_exam_bank import list_questions_requiring_photo
        photo_qs = list_questions_requiring_photo()
        if photo_qs:
            return {"status": "pass", "message": f"Verified that {len(photo_qs)} photo-required drawing questions exist."}
        return {"status": "fail", "message": "No photo-required drawing questions exist in the database."}
    except Exception as e:
        return {"status": "fail", "message": f"Error checking photo questions: {e}"}

def run_all_readiness_checks() -> dict:
    checks = {
        "no_hardcoded_secrets": check_no_hardcoded_secrets(),
        "demo_data_only": check_demo_data_only(),
        "question_bank_exists": check_question_bank_exists(),
        "agent_importable": check_agent_importable(),
        "safety_screen_available": check_safety_screen_available(),
        "golden_diagnostic_passes": check_golden_diagnostic_passes(),
        "topic_map_available": check_topic_map_available(),
        "revision_notes_available": check_revision_notes_available(),
        "historical_exam_bank_available": check_historical_exam_bank_available(),
        "historical_questions_link_to_valid_topics": check_historical_questions_link_to_valid_topics(),
        "photo_required_question_exists": check_photo_required_question_exists()
    }
    
    failures = [k for k, v in checks.items() if v["status"] == "fail"]
    
    if failures:
        overall = "not_ready"
        summary = f"Readiness checks failed on: {failures}"
    else:
        overall = "ready"
        summary = "All readiness checks passed successfully."
        
    return {
        "overall_status": overall,
        "summary": summary,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": checks
    }
