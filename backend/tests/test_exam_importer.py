import os
import shutil
import tempfile
import pytest
from unittest.mock import patch

from app.exam_registry import load_registry, save_registry, add_or_update_exam
from app.exam_importer import (
    parse_filename_metadata,
    scan_input_folder,
    safe_extract_zip,
    process_exam_file
)

@pytest.fixture
def temp_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)

@pytest.fixture
def mock_registry(temp_dir):
    # Mock registry path to be inside temp dir
    reg_path = os.path.join(temp_dir, "exam_registry.json")
    with patch("app.exam_registry.get_registry_path", return_value=reg_path):
        # Initialize registry
        save_registry({})
        yield reg_path

def test_parse_filename_metadata():
    # Test typical names
    res1 = parse_filename_metadata("math_ifrane_2023.pdf")
    assert res1["subject"] == "math"
    assert res1["region"] == "Ifrane"
    assert res1["year"] == 2023
    assert res1["is_correction"] is False
    
    # Test correction in name
    res2 = parse_filename_metadata("rabat_2022_math_correction.pdf")
    assert res2["subject"] == "math"
    assert res2["region"] == "Rabat"
    assert res2["year"] == 2022
    assert res2["is_correction"] is True
    
    # Test missing metadata
    res3 = parse_filename_metadata("exam.pdf")
    assert res3["region"] is None
    assert res3["year"] is None
    
    # Test subjects
    assert parse_filename_metadata("arabic_casablanca_2020.pdf")["subject"] == "arabic"
    assert parse_filename_metadata("french_fez_2021.pdf")["subject"] == "french"

def test_scan_input_folder(temp_dir):
    # Create temp files
    pdf_path = os.path.join(temp_dir, "test1.pdf")
    zip_path = os.path.join(temp_dir, "test2.zip")
    txt_path = os.path.join(temp_dir, "test3.txt")
    
    for p in [pdf_path, zip_path, txt_path]:
        with open(p, "w") as f:
            f.write("dummy")
            
    scanned = scan_input_folder(temp_dir)
    assert pdf_path in scanned
    assert zip_path in scanned
    assert txt_path not in scanned

def test_safe_extract_zip(temp_dir):
    # Create a mock zip
    zip_path = os.path.join(temp_dir, "archive.zip")
    import zipfile
    with zipfile.ZipFile(zip_path, 'w') as z:
        z.writestr("ok.pdf", "pdf content")
        # Zip slip attempt
        z.writestr("../dangerous.pdf", "dangerous content")
        
    extract_target = os.path.join(temp_dir, "extracted")
    extracted = safe_extract_zip(zip_path, extract_target)
    
    # Check that normal file is extracted
    assert os.path.exists(os.path.join(extract_target, "ok.pdf"))
    assert os.path.join(extract_target, "ok.pdf") in extracted
    
    # Check that Zip Slip was blocked
    assert not os.path.exists(os.path.join(extract_target, "../dangerous.pdf"))
    assert not os.path.exists(os.path.join(temp_dir, "dangerous.pdf"))

def test_add_or_update_exam(mock_registry):
    record = {
        "exam_id": "math_ifrane_2023",
        "source_file": "math_ifrane_2023.pdf",
        "subject": "math",
        "region": "Ifrane",
        "year": 2023,
        "status": "text_extracted",
        "questions_count": 5,
        "needs_manual_verification": False
    }
    
    # First add should succeed
    assert add_or_update_exam(record) is True
    reg = load_registry()
    assert "math_ifrane_2023" in reg
    
    # Second add of the same exact record should skip (return False)
    assert add_or_update_exam(record) is False
    
    # Updating should succeed
    record["questions_count"] = 6
    assert add_or_update_exam(record) is True
    assert load_registry()["math_ifrane_2023"]["questions_count"] == 6
    
    # Duplicate source file check under different ID
    record2 = {
        "exam_id": "math_ifrane_2023_dup",
        "source_file": "math_ifrane_2023.pdf",
        "subject": "math"
    }
    assert add_or_update_exam(record2) is False

@patch("app.exam_importer.extract_pdf_text")
@patch("app.exam_importer.get_pdf_page_count")
def test_process_exam_file(mock_page_count, mock_pdf_text, temp_dir, mock_registry):
    mock_page_count.return_value = 2
    mock_pdf_text.return_value = "Question 1: Calculer 5 + 3. Q2: Resoudre l'equation. " + "x" * 150
    
    pdf_path = os.path.join(temp_dir, "math_ifrane_2023.pdf")
    with open(pdf_path, "w") as f:
        f.write("dummy pdf")
        
    output_dir = os.path.join(temp_dir, "imported")
    res = process_exam_file(pdf_path, temp_dir, output_dir)
    
    assert res["success"] is True
    assert res["exam_id"] == "math_ifrane_2023"
    assert res["status"] == "text_extracted"
    assert res["questions_count"] == 2
    assert res["needs_manual"] is False
    
    # Verify draft file was written
    draft_path = os.path.join(output_dir, "math_ifrane_2023.json")
    assert os.path.exists(draft_path)

@patch("app.exam_importer.extract_pdf_text")
def test_scanned_pdf_status(mock_pdf_text, temp_dir, mock_registry):
    mock_pdf_text.return_value = "   "
    
    pdf_path = os.path.join(temp_dir, "math_ifrane_2023.pdf")
    with open(pdf_path, "w") as f:
        f.write("dummy pdf")
        
    output_dir = os.path.join(temp_dir, "imported")
    res = process_exam_file(pdf_path, temp_dir, output_dir)
    
    assert res["success"] is True
    assert res["status"] == "scanned_pdf_needs_manual_review"
    assert res["questions_count"] == 0
    assert res["needs_manual"] is True
    
    # Verify no questions were invented
    import json
    draft_path = os.path.join(output_dir, "math_ifrane_2023.json")
    with open(draft_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        assert len(data["questions"]) == 0
