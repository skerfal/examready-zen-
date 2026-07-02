from app.agent import diagnose_math_answer

def score_diagnostic_answers(questions: list[dict], answers: list[dict]) -> dict:
    # Build maps for convenience
    questions_map = {q["question_id"]: q for q in questions}
    answers_map = {a["question_id"]: a["student_answer"] for a in answers}
    
    correct_count = 0
    detailed_results = []
    
    # Group results by skill tag to compute skill-specific scores
    skill_results = {}
    
    for q_id, q in questions_map.items():
        student_answer = answers_map.get(q_id, "")
        
        # Grading uses approved expected answers only (curated/demo exams are approved by default)
        exam_id = q.get("exam_id", "")
        is_approved_ans = (exam_id in ["ifrane_2023_math", "demo", "", None]) or (q.get("answer_status") == "approved")
        expected_answer = q.get("expected_answer", "") if is_approved_ans else ""
        
        question_text = q["question_text"]
        skill_tag = q.get("skill_tag", q.get("topic_id", ""))
        
        # Grade using diagnose_math_answer
        diagnosis = diagnose_math_answer(
            question=question_text,
            student_answer=student_answer,
            expected_answer=expected_answer
        )
        
        is_correct = (diagnosis.get("concept_mastery") == "correct")
        if is_correct:
            correct_count += 1
            
        if skill_tag not in skill_results:
            skill_results[skill_tag] = []
        skill_results[skill_tag].append(is_correct)
        
        detailed_results.append({
            "question_id": q_id,
            "question_text": question_text,
            "student_answer": student_answer,
            "expected_answer": expected_answer,
            "diagnosis": diagnosis
        })
        
    # Calculate percentages
    total_questions = len(questions)
    score_percent = (correct_count / total_questions * 100) if total_questions > 0 else 0.0
    
    # Compute skill scores
    skill_scores = {}
    weak_skills = []
    strengths = []
    
    for skill_tag, results in skill_results.items():
        total_skill_qs = len(results)
        correct_skill_qs = sum(1 for r in results if r)
        pct = (correct_skill_qs / total_skill_qs * 100) if total_skill_qs > 0 else 0.0
        skill_scores[skill_tag] = pct
        
        if pct < 70.0:
            weak_skills.append(skill_tag)
        else:
            strengths.append(skill_tag)
            
    return {
        "total_questions": total_questions,
        "correct_count": correct_count,
        "score_percent": round(score_percent, 2),
        "skill_scores": skill_scores,
        "weak_skills": weak_skills,
        "strengths": strengths,
        "detailed_results": detailed_results
    }
