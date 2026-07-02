import pytest
from app.answer_matcher import match_answers_to_questions

def test_match_answers_by_question_number():
    questions = [
        {"question_id": "exam1_Q01", "detected_number": 1, "question_text": "Somme de 12 et 3"},
        {"question_id": "exam1_Q02", "detected_number": 2, "question_text": "Aire d'un rectangle"}
    ]
    solution_blocks = [
        {"proposed_number": 2, "text": "L'aire est 50 m².", "source_page": 1},
        {"proposed_number": 1, "text": "La réponse est 15.", "source_page": 1}
    ]
    
    matched = match_answers_to_questions(questions, solution_blocks)
    assert len(matched) == 2
    
    q1 = matched[0]
    assert q1["proposed_expected_answer"] == "15."
    assert q1["answer_matching_confidence"] == "high"
    assert q1["answer_status"] == "proposed"
    
    q2 = matched[1]
    assert q2["proposed_expected_answer"] == "50 m²."
    assert q2["answer_matching_confidence"] == "high"
    assert q2["answer_status"] == "proposed"

def test_match_answers_by_sequence():
    questions = [
        {"question_id": "exam1_Q01", "detected_number": 10, "question_text": "Somme de 12 et 3"},
        {"question_id": "exam1_Q02", "detected_number": 20, "question_text": "Aire d'un rectangle"}
    ]
    # No matches by question numbers (10 vs 9, 20 vs 11), but length matches
    solution_blocks = [
        {"proposed_number": 9, "text": "La réponse est 15.", "source_page": 1},
        {"proposed_number": 11, "text": "L'aire est 50 m².", "source_page": 1}
    ]
    
    matched = match_answers_to_questions(questions, solution_blocks)
    assert len(matched) == 2
    
    q1 = matched[0]
    assert q1["proposed_expected_answer"] == "15."
    assert q1["answer_matching_confidence"] == "medium"
    assert "séquentiel" in q1["answer_matching_reason"]
    
    q2 = matched[1]
    assert q2["proposed_expected_answer"] == "50 m²."
    assert q2["answer_matching_confidence"] == "medium"

def test_match_answers_by_keyword_overlap():
    questions = [
        {"question_id": "exam1_Q01", "detected_number": 10, "question_text": "Calculer la somme de la fraction et simplifier"},
    ]
    # No sequence length match, no number match. But "fraction" overlaps.
    solution_blocks = [
        {"proposed_number": 5, "text": "Une autre réponse.", "source_page": 1},
        {"proposed_number": 6, "text": "Correction: le résultat de la fraction à simplifier est 3/4.", "source_page": 1},
        {"proposed_number": 7, "text": "Troisième bloc de texte.", "source_page": 1}
    ]
    
    matched = match_answers_to_questions(questions, solution_blocks)
    assert len(matched) == 1
    
    q1 = matched[0]
    # "fraction" matches (words must be length > 3 and overlap)
    assert "3/4" in q1["proposed_expected_answer"]
    assert q1["answer_matching_confidence"] == "low"
    assert "mots-clés" in q1["answer_matching_reason"]

def test_protect_approved_answers():
    questions = [
        {
            "question_id": "exam1_Q01",
            "detected_number": 1,
            "question_text": "Somme de 12 et 3",
            "expected_answer": "15",
            "answer_status": "approved"
        }
    ]
    solution_blocks = [
        {"proposed_number": 1, "text": "Une nouvelle réponse: 99", "source_page": 1}
    ]
    
    matched = match_answers_to_questions(questions, solution_blocks)
    assert len(matched) == 1
    # Check that the approved answer was not overwritten
    assert matched[0]["expected_answer"] == "15"
    assert "proposed_expected_answer" not in matched[0]
