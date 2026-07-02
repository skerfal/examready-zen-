import re
from app.agent import parse_numeric_value, normalize_str

def check_answer(
    student_answer: str,
    expected_answer: str,
    requires_visual_support: bool = False,
    requires_image_upload: bool = False,
    answer_type: str = "text"
) -> dict:
    """
    Checks the student's answer against the expected answer.
    Returns a dictionary matching CheckAnswerResponse schema:
    {
        "status": "correct" | "incorrect" | "partial" | "manual_check_required",
        "friendly_message": "string",
        "expected_answer_available": bool,
        "correct_answer_display": "string | None",
        "mistake_type": "string | None",
        "needs_visual_review": bool,
        "can_retry": bool
    }
    """
    # 1. Geometry, drawing, or photo questions require visual check
    is_visual = (
        requires_visual_support
        or requires_image_upload
        or answer_type in ["photo", "geometry", "drawing"]
    )
    if is_visual:
        return {
            "status": "manual_check_required",
            "friendly_message": "Cette question demande un tracé géométrique ou une figure. Ton enseignant va vérifier ta réponse visuellement.",
            "expected_answer_available": expected_answer != "",
            "correct_answer_display": expected_answer if expected_answer else None,
            "mistake_type": None,
            "needs_visual_review": True,
            "can_retry": False
        }
        
    # 2. If expected answer is missing/empty, manual check is required
    if not expected_answer or not expected_answer.strip():
        return {
            "status": "manual_check_required",
            "friendly_message": "Pas de corrigé automatique disponible pour cette question. Ton enseignant vérifiera ta réponse.",
            "expected_answer_available": False,
            "correct_answer_display": None,
            "mistake_type": None,
            "needs_visual_review": False,
            "can_retry": False
        }
        
    student_clean = student_answer.strip()
    expected_clean = expected_answer.strip()
    
    # 3. Numeric comparison
    try:
        student_val = parse_numeric_value(student_clean)
        expected_val = parse_numeric_value(expected_clean)
        
        if abs(student_val - expected_val) < 1e-9:
            # Mathematical values are equivalent.
            # Check for decimal precision difference (e.g. 35.1 vs 35.10)
            norm_student = student_clean.replace(",", ".")
            norm_expected = expected_clean.replace(",", ".")
            
            # If string representations are different when normalized
            if norm_student != norm_expected:
                return {
                    "status": "partial",
                    "friendly_message": f"La valeur numérique est correcte, mais fais attention à la précision de l'écriture décimale demandée (ex: {expected_clean}).",
                    "expected_answer_available": True,
                    "correct_answer_display": expected_clean,
                    "mistake_type": "correct_value_precision_warning",
                    "needs_visual_review": False,
                    "can_retry": True
                }
            else:
                return {
                    "status": "correct",
                    "friendly_message": "Excellent ! Ta réponse est tout à fait correcte.",
                    "expected_answer_available": True,
                    "correct_answer_display": expected_clean,
                    "mistake_type": None,
                    "needs_visual_review": False,
                    "can_retry": False
                }
        else:
            return {
                "status": "incorrect",
                "friendly_message": "Ce n'est pas tout à fait correct. Prends ton temps, vérifie tes calculs et réessaie !",
                "expected_answer_available": True,
                "correct_answer_display": expected_clean,
                "mistake_type": "conceptual_error",
                "needs_visual_review": False,
                "can_retry": True
            }
    except ValueError:
        # 4. Fallback to text comparison
        norm_student = normalize_str(student_clean)
        norm_expected = normalize_str(expected_clean)
        
        if norm_student == norm_expected:
            return {
                "status": "correct",
                "friendly_message": "Excellent ! Ta réponse est tout à fait correcte.",
                "expected_answer_available": True,
                "correct_answer_display": expected_clean,
                "mistake_type": None,
                "needs_visual_review": False,
                "can_retry": False
            }
        else:
            return {
                "status": "incorrect",
                "friendly_message": "Ce n'est pas tout à fait la réponse attendue. Vérifie l'orthographe ou réessaie !",
                "expected_answer_available": True,
                "correct_answer_display": expected_clean,
                "mistake_type": "text_mismatch",
                "needs_visual_review": False,
                "can_retry": True
            }
