from app.practice_selector import select_practice_questions

def create_practice_plan(diagnostic_result: dict) -> dict:
    weak_skills = diagnostic_result.get("weak_skills", [])
    practice_blocks = []
    
    if weak_skills:
        plan_title = "Plan de pratique ciblé - ExamReady Zen"
        recommended_skills = weak_skills.copy()
        
        # Create one block per weak skill
        for skill in weak_skills:
            # Select questions for this specific skill
            questions = select_practice_questions([skill], limit=3)
            # Create a user-friendly objective based on the skill
            objective = f"Consolider la compétence : {skill.replace('_', ' ').capitalize()}"
            remediation_hint = ""
            if questions:
                remediation_hint = questions[0].get("remediation_hint", "")
                
            practice_blocks.append({
                "skill_tag": skill,
                "objective": objective,
                "question_count": len(questions),
                "recommended_questions": questions,
                "remediation_hint": remediation_hint
            })
            
        estimated_time = len(weak_skills) * 15  # 15 minutes per skill
        success_criteria = "Obtenir au moins 80% de bonnes réponses sur chaque bloc d'entraînement."
    else:
        plan_title = "Plan de renforcement général - ExamReady Zen"
        recommended_skills = ["general_review"]
        
        # Create one mixed review block
        questions = select_practice_questions([], limit=5)
        practice_blocks.append({
            "skill_tag": "mixed_review",
            "objective": "S'entraîner sur un mélange de questions types examens pour maintenir ton niveau.",
            "question_count": len(questions),
            "recommended_questions": questions,
            "remediation_hint": "Prends ton temps pour bien lire chaque énoncé et vérifier tes calculs."
        })
        estimated_time = 20  # 20 minutes for general review
        success_criteria = "Compléter l'entraînement mixte sans faire d'erreur d'inattention."
        
    return {
        "plan_title": plan_title,
        "recommended_skills": recommended_skills,
        "practice_blocks": practice_blocks,
        "estimated_time_minutes": estimated_time,
        "success_criteria": success_criteria
    }
