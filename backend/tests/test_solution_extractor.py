import os
import pytest
from unittest.mock import MagicMock, patch
from app.solution_extractor import extract_solution_blocks_from_pdf

def test_extract_scanned_solution_empty_text():
    # If the file exists but has no text (or < 100 characters), it should return scanned_solution_needs_ocr
    with patch("os.path.exists", return_value=True):
        with patch("fitz.open") as mock_open:
            mock_doc = MagicMock()
            mock_page = MagicMock()
            mock_page.get_text.return_value = "Correction: court"  # only 17 characters
            mock_doc.__iter__.return_value = [mock_page]
            mock_open.return_value = mock_doc
            
            res = extract_solution_blocks_from_pdf("dummy_corr.pdf")
            assert res["status"] == "scanned_solution_needs_ocr"
            assert len(res["blocks"]) == 0
            assert "scan" in res["warnings"][0]

def test_extract_selectable_solution_success():
    # Mock fitz to return pages with selectable solution text
    page1_text = """
    Correction 1:
    La réponse est 168.6.
    
    Q2:
    Le résultat de la multiplication des fractions est 7/8.
    """
    page2_text = """
    Correction 3.
    Tracer un angle de 120 degrés à l'aide du rapporteur et de la règle, puis diviser en deux angles de 60 degrés.
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
            
            res = extract_solution_blocks_from_pdf("dummy_corr.pdf")
            assert res["status"] == "solution_extracted"
            assert len(res["blocks"]) == 3
            
            b1 = res["blocks"][0]
            assert b1["proposed_number"] == 1
            assert "168.6" in b1["text"]
            assert b1["source_page"] == 1
            
            b2 = res["blocks"][1]
            assert b2["proposed_number"] == 2
            assert "7/8" in b2["text"]
            assert b2["source_page"] == 1
            
            b3 = res["blocks"][2]
            assert b3["proposed_number"] == 3
            assert "120" in b3["text"]
            assert b3["source_page"] == 2
