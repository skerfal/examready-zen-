import os
import pytest
from unittest.mock import MagicMock, patch
from app.question_extractor import extract_questions_from_pdf

def test_extract_scanned_pdf_empty_text():
    # If the file exists but has no text (or < 100 characters), it should return scanned_needs_ocr
    with patch("os.path.exists", return_value=True):
        with patch("fitz.open") as mock_open:
            mock_doc = MagicMock()
            mock_page = MagicMock()
            mock_page.get_text.return_value = "Short"  # only 5 characters
            mock_doc.__iter__.return_value = [mock_page]
            mock_open.return_value = mock_doc
            
            res = extract_questions_from_pdf("dummy.pdf", "math_casa_2026")
            assert res["status"] == "scanned_needs_ocr"
            assert len(res["questions"]) == 0
            assert "scan" in res["warnings"][0]

def test_extract_selectable_pdf_success():
    # Mock fitz to return pages with selectable text including question headers
    page1_text = """
    Ex 1: Calcule la somme de 123 et 45.6
    Question 2: Calcule et simplifie la fraction suivante : 3/4 * (1/2 + 2/3)
    """
    page2_text = """
    3) Construis un angle de 120 degrés et trace sa bissectrice.
    """
    
    with patch("os.path.exists", return_value=True):
        with patch("fitz.open") as mock_open:
            mock_doc = MagicMock()
            mock_page1 = MagicMock()
            mock_page1.get_text.return_value = page1_text
            mock_page2 = MagicMock()
            mock_page2.get_text.return_value = page2_text
            
            mock_doc.__iter__.return_value = [mock_page1, mock_page2]
            mock_open.return_value = mock_doc
            
            res = extract_questions_from_pdf("dummy.pdf", "math_casa_2026")
            assert res["status"] == "text_extracted"
            assert len(res["questions"]) == 3
            
            # Check first question
            q1 = res["questions"][0]
            assert q1["question_id"] == "math_casa_2026_Q01"
            assert q1["detected_number"] == 1
            assert "somme" in q1["question_text"]
            assert q1["topic_id"] == "decimal_addition"
            assert q1["source_page"] == 1
            assert q1["status"] == "draft"
            assert q1["needs_manual_verification"] is True
            
            # Check third question
            q3 = res["questions"][2]
            assert q3["question_id"] == "math_casa_2026_Q03"
            assert q3["detected_number"] == 3
            assert "angle" in q3["question_text"]
            assert q3["topic_id"] == "angle_construction"
            assert q3["source_page"] == 2
            assert q3["requires_image_upload"] is True
            assert q3["requires_visual_support"] is True
            assert q3["answer_type"] == "drawing_photo"
