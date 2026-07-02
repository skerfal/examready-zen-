import os
import shutil
import pytest
from unittest.mock import patch, MagicMock
from app.ocr_extractor import check_ocr_availability, run_ocr_extraction

def test_ocr_availability_and_fallback():
    # Mocking pytesseract module not present
    with patch.dict("sys.modules", {"pytesseract": None}):
        is_avail, eng, msg = check_ocr_availability()
        assert is_avail is False
        assert eng == "none"
        assert "pytesseract" in msg

    # Mocking get_tesseract_version raising exception
    mock_pytesseract = MagicMock()
    mock_pytesseract.get_tesseract_version.side_effect = Exception("binary missing")
    with patch.dict("sys.modules", {"pytesseract": mock_pytesseract}):
        is_avail, eng, msg = check_ocr_availability()
        assert is_avail is False
        assert eng == "tesseract_binary_missing"
        assert "Tesseract-OCR" in msg

def test_run_ocr_extraction_graceful_fallback(tmp_path):
    exam_id = "test_scanned_exam_fallback"
    pdf_path = os.path.join(tmp_path, "scanned_exam.pdf")
    with open(pdf_path, "w") as f:
        f.write("%PDF-1.4 mock scanned file")
        
    with patch("app.ocr_extractor.check_ocr_availability", return_value=(False, "tesseract_binary_missing", "Mocked binary missing warning")):
        res = run_ocr_extraction(exam_id, pdf_path)
        assert res["ocr_status"] == "ocr_engine_unavailable"
        assert res["ocr_engine"] == "tesseract_binary_missing"
        assert "Mocked binary missing warning" in res["warnings"]
        assert res["draft_text_by_page"] == {}
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        summary_path = os.path.join(base_dir, "data", "ocr", exam_id, "ocr_summary.json")
        assert os.path.exists(summary_path)
        
        shutil.rmtree(os.path.join(base_dir, "data", "ocr", exam_id), ignore_errors=True)

def test_ocr_extraction_traversal_protection():
    res = run_ocr_extraction("../traversal_exam", "dummy.pdf")
    assert res["ocr_status"] == "error"
    assert "ID d'examen invalide." in res["warnings"]
