import uuid
from app.question_bank import get_demo_questions
from app.safety import redact_pii
from app.historical_exam_bank import load_historical_exam

# In-memory database of active sessions
SESSIONS = {}

def select_ifrane_questions() -> list:
    exam = load_historical_exam("ifrane_2023_math")
    if not exam:
        return []
    all_qs = exam.get("questions", [])
    for q in all_qs:
        q["exam_id"] = "ifrane_2023_math"
    
    # Priority diagnostic topics list
    from app.topic_map import get_diagnostic_priority_topics
    priority_topics = set(t["topic_id"] for t in get_diagnostic_priority_topics())
    
    # Group questions by domain to ensure diverse domain coverage
    by_domain = {}
    for q in all_qs:
        dom = q["domain"]
        if dom not in by_domain:
            by_domain[dom] = []
        by_domain[dom].append(q)
        
    selected = []
    # 1. Pick one high-priority question from each domain first
    for dom, qs in by_domain.items():
        priority_qs = [q for q in qs if q["topic_id"] in priority_topics]
        if priority_qs:
            selected.append(priority_qs[0])
        elif qs:
            selected.append(qs[0])
            
    # 2. Add other high-priority questions if we have less than 10
    remaining_priority = [q for q in all_qs if q["topic_id"] in priority_topics and q not in selected]
    for q in remaining_priority:
        if len(selected) >= 10:
            break
        selected.append(q)
        
    # 3. Fallback to fill up to at least 5 questions if needed
    if len(selected) < 5:
        for q in all_qs:
            if q not in selected:
                selected.append(q)
            if len(selected) >= 5:
                break
                
    # Sort selected questions by page and question_id
    selected.sort(key=lambda x: (x.get("page", 1), x.get("question_id", "")))
    return selected

def select_exam_questions(exam: dict) -> list:
    exam_id = exam.get("exam_id")
    raw_qs = exam.get("questions", [])
    if exam_id == "ifrane_2023_math":
        all_qs = raw_qs
    else:
        all_qs = [q for q in raw_qs if q.get("status") == "approved"]
        
    for q in all_qs:
        q["exam_id"] = exam_id
        
    if not all_qs:
        return []
        
    from app.topic_map import get_diagnostic_priority_topics
    priority_topics = set(t["topic_id"] for t in get_diagnostic_priority_topics())
    
    by_domain = {}
    for q in all_qs:
        dom = q.get("domain", "numbers_calculation")
        if dom not in by_domain:
            by_domain[dom] = []
        by_domain[dom].append(q)
        
    selected = []
    # 1. Pick one high-priority question from each domain first
    for dom, qs in by_domain.items():
        priority_qs = [q for q in qs if q.get("topic_id") in priority_topics]
        if priority_qs:
            selected.append(priority_qs[0])
        elif qs:
            selected.append(qs[0])
            
    # 2. Add other high-priority questions if we have less than 10
    remaining_priority = [q for q in all_qs if q.get("topic_id") in priority_topics and q not in selected]
    for q in remaining_priority:
        if len(selected) >= 10:
            break
        selected.append(q)
        
    # 3. Fallback to fill up to at least 5 questions if needed
    if len(selected) < 5:
        for q in all_qs:
            if q not in selected:
                selected.append(q)
            if len(selected) >= 5:
                break
                
    selected.sort(key=lambda x: (x.get("page", 1), x.get("question_id", "")))
    return selected

def start_diagnostic_session(student_alias: str = "demo_student", source: str = "historical_ifrane_2023") -> dict:
    session_id = str(uuid.uuid4())
    
    from app.exam_registry import load_registry
    registry = load_registry()
    
    # Try to resolve exam_id from source
    exam_id = source
    if source.startswith("historical_"):
        exam_id = source[len("historical_"):]
        if exam_id == "ifrane_2023":
            exam_id = "ifrane_2023_math"
            
    rec = registry.get(exam_id)
    exam = load_historical_exam(exam_id) if exam_id else None
    
    # Determine if it's eligible: curated Ifrane 2023 math exam is always eligible, otherwise must be status == "ready"
    is_eligible = (exam_id == "ifrane_2023_math") or (rec and rec.get("status") == "ready")
    
    if exam and is_eligible:
        questions = select_exam_questions(exam)
    elif source == "historical_ifrane_2023" or exam_id == "ifrane_2023_math":
        questions = select_ifrane_questions()
    else:
        # Fallback to demo question bank
        all_qs = get_demo_questions()
        questions = all_qs[:5]
    
    # Redact PII in student_alias
    clean_alias = redact_pii(student_alias)
    
    # Save session
    SESSIONS[session_id] = {
        "student_alias": clean_alias,
        "questions": questions,
        "status": "active"
    }
    
    # Return questions without expected answers or correction steps (safe for client)
    client_questions = []
    for q in questions:
        client_questions.append({
            "question_id": q["question_id"],
            "question_text": q["question_text"],
            "topic_id": q.get("topic_id", q.get("skill_tag", "")),
            "domain": q.get("domain", "numbers_calculation"),
            "difficulty": q.get("difficulty", "medium"),
            "answer_type": q.get("answer_type", "text"),
            "requires_image_upload": q.get("requires_image_upload", False),
            "requires_visual_support": q.get("requires_visual_support", False)
        })
        
    return {
        "session_id": session_id,
        "questions": client_questions
    }

def submit_diagnostic_answers(session_id: str, answers: list[dict]) -> dict:
    session = SESSIONS.get(session_id)
    if not session:
        raise ValueError("Invalid session_id")
        
    if session["status"] == "completed":
        raise ValueError("Session already completed")
        
    questions = session["questions"]
    
    # Score answers
    from app.scoring import score_diagnostic_answers
    from app.practice_selector import select_practice_questions
    from app.revision_notes import get_revision_notes_for_weak_skills
    from app.topic_map import get_topic
    
    scoring_result = score_diagnostic_answers(questions, answers)
    
    # Mark session as completed
    session["status"] = "completed"
    session["results"] = scoring_result
    
    # Recommend practice questions based on weak skills
    weak_skills = scoring_result["weak_skills"]
    recommended_practice = select_practice_questions(weak_skills)
    
    # Load exact revision notes for weak skills
    revision_notes = get_revision_notes_for_weak_skills(weak_skills)
    
    # Determine if visual support is needed or photo upload is recommended for any weak skill
    visual_support_needed = False
    photo_upload_recommended = False
    
    for skill in weak_skills:
        topic_info = get_topic(skill)
        if topic_info:
            if topic_info.get("requires_visual_support") is True:
                visual_support_needed = True
            if topic_info.get("supports_photo_answer") is True:
                photo_upload_recommended = True
                
    # Create practice plan (reinforcement_plan)
    from app.practice_plan import create_practice_plan
    reinforcement_plan = create_practice_plan(scoring_result)
    
    return {
        "session_id": session_id,
        "score_percent": scoring_result["score_percent"],
        "weak_skills": scoring_result["weak_skills"],
        "strengths": scoring_result["strengths"],
        "recommended_practice": recommended_practice,
        "detailed_results": scoring_result["detailed_results"],
        "revision_notes_for_weak_skills": revision_notes,
        "reinforcement_plan": reinforcement_plan,
        "visual_support_needed": visual_support_needed,
        "photo_upload_recommended": photo_upload_recommended
    }
