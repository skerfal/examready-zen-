from app.question_bank import get_demo_questions

def select_practice_questions(weak_skills: list[str], limit: int = 5) -> list[dict]:
    from app.historical_exam_bank import list_questions_by_topic, load_historical_exam
    
    recommended = []
    
    if weak_skills:
        # 1. Query historical exam questions first
        for skill in weak_skills:
            hist_qs = list_questions_by_topic(skill)
            if hist_qs:
                recommended.extend(hist_qs)
                
        # 2. Fallback to demo question bank if no historical questions were found for these weak skills
        if not recommended:
            demo_qs = get_demo_questions()
            for q in demo_qs:
                if q["skill_tag"] in weak_skills:
                    recommended.append(q)
    else:
        # No weak skills exist. Let's return mixed review questions.
        # Pull from Ifrane 2023 first
        exam = load_historical_exam("ifrane_2023_math")
        if exam:
            recommended.extend(exam.get("questions", []))
        # Add demo questions
        recommended.extend(get_demo_questions())
        
    # Deduplicate questions based on question_id
    seen_ids = set()
    deduped = []
    for q in recommended:
        q_id = q["question_id"]
        if q_id not in seen_ids:
            seen_ids.add(q_id)
            deduped.append(q)
            
    return deduped[:limit]
