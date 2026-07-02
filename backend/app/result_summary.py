def create_student_result_summary(diagnostic_result: dict) -> dict:
    score = diagnostic_result.get("score_percent", 0.0)
    weak_skills = diagnostic_result.get("weak_skills", [])
    strengths = diagnostic_result.get("strengths", [])
    
    # overall_level classification
    if score < 50.0:
        overall_level = "needs_support"
        student_message = "Ne te décourage pas ! Avec un peu d'entraînement et les bonnes explications, tu vas vite t'améliorer."
        parent_message = "Votre enfant a besoin d'un accompagnement renforcé sur ces notions de base. Nous lui conseillons de suivre le plan de pratique personnalisé."
        next_action = f"Réviser en priorité : {', '.join(weak_skills) if weak_skills else 'les bases des opérations'}"
    elif score < 80.0:
        overall_level = "progressing"
        student_message = "Bon travail ! Tu as de bonnes bases, mais quelques notions demandent encore un peu de pratique."
        parent_message = "Votre enfant progresse bien. Quelques ajustements ciblés lui permettront de consolider ses compétences avant l'examen."
        next_action = f"Pratiquer les compétences ciblées : {', '.join(weak_skills)}"
    else:
        overall_level = "strong"
        student_message = "Excellent travail ! Tu maîtrises très bien ces notions. Continue comme ça !"
        parent_message = "Félicitations ! Votre enfant montre une excellente maîtrise des compétences évaluées. Il est prêt pour des simulations d'examen."
        next_action = "Simulations d'examens régionaux complets / Révisions générales"
        
    # Check if any detailed result requested human review
    review_required = False
    detailed_results = diagnostic_result.get("detailed_results", [])
    for res in detailed_results:
        diagnosis = res.get("diagnosis", {})
        if diagnosis.get("human_review_required", False):
            review_required = True
            
    if score < 50.0:
        review_required = True
        
    return {
        "overall_level": overall_level,
        "score_percent": score,
        "main_weaknesses": weak_skills,
        "strengths": strengths,
        "student_message": student_message,
        "parent_message": parent_message,
        "next_action": next_action,
        "review_required": review_required
    }
