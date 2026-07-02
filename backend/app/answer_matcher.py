import re

def match_answers_to_questions(questions: list, solution_blocks: list) -> list:
    """
    Matches extracted solution blocks to existing exam questions.
    Returns the updated questions list with matching proposals.
    Each matched question will contain:
      - proposed_expected_answer: string
      - answer_matching_confidence: "high" | "medium" | "low" | "needs_manual_answer_review"
      - answer_matching_reason: string
      - answer_status: "proposed" | "needs_manual_answer_review" | "missing"
    """
    # Create copies of questions to avoid modifying inplace (though we modify copies)
    updated_questions = [dict(q) for q in questions]

    # Map blocks by proposed number for quick lookup
    blocks_by_num = {}
    for block in solution_blocks:
        num = block.get("proposed_number")
        if num is not None:
            blocks_by_num[int(num)] = block

    for idx, question in enumerate(updated_questions):
        question_id = question.get("question_id", "")
        # Keep existing fields or set defaults
        if "expected_answer" not in question:
            question["expected_answer"] = ""
        if "answer_status" not in question:
            question["answer_status"] = "missing"
            
        # Protect already approved expected answers!
        if question.get("answer_status") == "approved" and question.get("expected_answer"):
            continue

        # Try to find a match
        detected_num = question.get("detected_number")
        
        # Also try to parse number from question_id (e.g. *_Q03 -> 3)
        id_num = None
        id_match = re.search(r"_Q(\d+)", question_id)
        if id_match:
            id_num = int(id_match.group(1))

        match_block = None
        match_reason = ""
        confidence = "low"

        # 1. Match by detected number or ID number
        if detected_num is not None and int(detected_num) in blocks_by_num:
            match_block = blocks_by_num[int(detected_num)]
            match_reason = f"Correspondance exacte par numéro de question ({detected_num})."
            confidence = "high"
        elif id_num is not None and id_num in blocks_by_num:
            match_block = blocks_by_num[id_num]
            match_reason = f"Correspondance par numéro extrait de l'ID ({id_num})."
            confidence = "high"

        # 2. Match by index sequence fallback if the number of questions and blocks matches
        if not match_block and len(questions) == len(solution_blocks):
            match_block = solution_blocks[idx]
            match_reason = f"Correspondance par ordre séquentiel (index {idx + 1})."
            confidence = "medium"

        # 3. Simple text keyword overlap fallback
        if not match_block:
            q_text = question.get("question_text", "").lower()
            best_overlap = 0
            best_block = None
            
            for block in solution_blocks:
                b_text = block.get("text", "").lower()
                # Find common words of length > 3
                q_words = set(w for w in re.findall(r"\w+", q_text) if len(w) > 3)
                b_words = set(w for w in re.findall(r"\w+", b_text) if len(w) > 3)
                overlap = len(q_words.intersection(b_words))
                if overlap > best_overlap and overlap >= 2:
                    best_overlap = overlap
                    best_block = block
            
            if best_block:
                match_block = best_block
                match_reason = f"Correspondance par recoupement de mots-clés ({best_overlap} mots en commun)."
                confidence = "low"

        if match_block:
            # Clean and sanitize the expected answer
            # We look for a short expected answer inside the text.
            # E.g. "La réponse est 25" -> proposed answer should clean the prefix if possible,
            # but for now we proposed the snippet or a refined version.
            full_text = match_block.get("text", "").strip()
            
            # Simple heuristic: if the block starts with "la réponse est..." or "correction...", we clean it.
            clean_text = full_text
            clean_match = re.search(r"(?:la réponse est|réponse\s*:|égal\s*à\s*:?|trouve\s*:?|est\s*de\s*|est\s+|:\s*)(.*)", full_text, re.IGNORECASE)
            if clean_match:
                candidate = clean_match.group(1).strip()
                if candidate:
                    clean_text = candidate

            question["proposed_expected_answer"] = clean_text
            question["answer_matching_confidence"] = confidence
            question["answer_matching_reason"] = match_reason
            question["answer_status"] = "proposed"
        else:
            question["proposed_expected_answer"] = ""
            question["answer_matching_confidence"] = "needs_manual_answer_review"
            question["answer_matching_reason"] = "Aucune correction correspondante n'a été identifiée de manière fiable."
            question["answer_status"] = "needs_manual_answer_review"

    return updated_questions
