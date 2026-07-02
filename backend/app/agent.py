import sys
import os

# Helper to clean and parse float value (including fractions and commas)
def parse_numeric_value(val: str) -> float:
    if not val:
        raise ValueError("Empty value")
    # Clean spaces and replace French decimal comma with dot
    cleaned = val.strip().replace(",", ".")
    # Check for fraction syntax
    if "/" in cleaned:
        parts = cleaned.split("/")
        if len(parts) == 2:
            return float(parts[0].strip()) / float(parts[1].strip())
    # Check for boolean strings
    if cleaned.lower() == "true":
        return 1.0
    if cleaned.lower() == "false":
        return 0.0
    return float(cleaned)

def normalize_str(s: str) -> str:
    return "".join(s.split()).lower().replace(",", ".")

def diagnose_math_answer(question: str, student_answer: str, expected_answer: str) -> dict:
    from app.safety import safety_screen
    
    # 1. Safety Screen first
    screen = safety_screen({
        "question": question,
        "student_answer": student_answer,
        "expected_answer": expected_answer
    })
    
    if not screen["safe"]:
        return {
            "status": "blocked_security_risk",
            "concept_mastery": "unknown",
            "diagnosis": "Prompt Injection detected",
            "skill_tag": "unknown",
            "human_review_required": True,
            "confidence": 0.0,
            "feedback": "Sécurité : Entrée bloquée suite à une détection de risque de sécurité."
        }
        
    clean_question = screen["payload"]["question"]
    clean_student = screen["payload"]["student_answer"]
    clean_expected = screen["payload"]["expected_answer"]
    
    # Detect skill tag from question or default
    skill_tag = "decimal_subtraction"
    if "addition" in clean_question.lower() or "+" in clean_question:
        skill_tag = "decimal_addition"
    elif "multipl" in clean_question.lower() or "*" in clean_question or "×" in clean_question:
        skill_tag = "decimal_multiplication"
    elif "/" in clean_question or "fraction" in clean_question.lower():
        skill_tag = "fraction_comparison"
    elif "problème" in clean_question.lower() or "spent" in clean_question.lower() or "dirham" in clean_question.lower():
        skill_tag = "word_problem"
        
    # 2. Match evaluation logic
    try:
        student_val = parse_numeric_value(clean_student)
        expected_val = parse_numeric_value(clean_expected)
        
        # Check if mathematically equivalent
        if abs(student_val - expected_val) < 1e-9:
            # Numeric values match. Check if string representations differ.
            if clean_student.strip() != clean_expected.strip():
                return {
                    "status": "diagnosed",
                    "concept_mastery": "correct",
                    "diagnosis": "formatting precision issue",
                    "skill_tag": skill_tag,
                    "human_review_required": False,
                    "confidence": 1.0,
                    "feedback": "Excellent travail ! La valeur est correcte, bien que le format diffère légèrement."
                }
            else:
                return {
                    "status": "diagnosed",
                    "concept_mastery": "correct",
                    "diagnosis": "perfect match",
                    "skill_tag": skill_tag,
                    "human_review_required": False,
                    "confidence": 1.0,
                    "feedback": "Excellent ! Ta réponse est parfaitement correcte."
                }
        else:
            return {
                "status": "diagnosed",
                "concept_mastery": "needs_practice",
                "diagnosis": "conceptual math error",
                "skill_tag": skill_tag,
                "human_review_required": False,
                "confidence": 1.0,
                "feedback": "La réponse n'est pas tout à fait correcte. Prends le temps de revoir les étapes du calcul."
            }
    except ValueError:
        # Fallback to normalized string comparison for comparisons (like True/False, >, <)
        norm_student = normalize_str(clean_student)
        norm_expected = normalize_str(clean_expected)
        
        if norm_student == norm_expected:
            return {
                "status": "diagnosed",
                "concept_mastery": "correct",
                "diagnosis": "perfect match",
                "skill_tag": skill_tag,
                "human_review_required": False,
                "confidence": 1.0,
                "feedback": "Excellent ! Ta réponse est correcte."
            }
        else:
            # Check if student answer is non-numeric text, which might require human review
            is_student_numeric = False
            try:
                parse_numeric_value(clean_student)
                is_student_numeric = True
            except ValueError:
                pass
                
            if not is_student_numeric:
                return {
                    "status": "diagnosed",
                    "concept_mastery": "unknown",
                    "diagnosis": "parsing error: student answer is not a valid number",
                    "skill_tag": skill_tag,
                    "human_review_required": True,
                    "confidence": 0.5,
                    "feedback": "Désolé, nous n'avons pas pu lire ta réponse. Un enseignant va la vérifier."
                }
            else:
                return {
                    "status": "diagnosed",
                    "concept_mastery": "needs_practice",
                    "diagnosis": "conceptual math error",
                    "skill_tag": skill_tag,
                    "human_review_required": False,
                    "confidence": 0.9,
                    "feedback": "La réponse n'est pas tout à fait correcte. Prends le temps de revoir les étapes du calcul."
                }
