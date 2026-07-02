import os
import zipfile
import tempfile
import shutil
import pytest
from unittest.mock import patch, MagicMock
from app.zip_exam_package import analyze_zip_package, parse_path_metadata, check_text_density

@pytest.fixture
def temp_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)

def test_parse_path_metadata():
    # Test standard subject mapping from folder structure
    meta1 = parse_path_metadata("French_Exams/Marrakech/2023/exam_draft.pdf")
    assert meta1["subject"] == "french"
    assert meta1["region"] == "Marrakech"
    assert meta1["year"] == 2023
    assert meta1["is_correction"] is False

    # Test correction detection in folders
    meta2 = parse_path_metadata("Correction_2021/math_oujda.pdf")
    assert meta2["subject"] == "math"
    assert meta2["region"] == "Oujda"
    assert meta2["year"] == 2021
    assert meta2["is_correction"] is True

    # Test subject mapping with islamic folders
    meta3 = parse_path_metadata("Islamic_Education/2022/tarbiya_rabat.pdf")
    assert meta3["subject"] == "islamic_education"
    assert meta3["region"] == "Rabat"
    assert meta3["year"] == 2022
    assert meta3["is_correction"] is False

def test_analyze_zip_package_logic(temp_dir):
    # Create a mock zip
    zip_path = os.path.join(temp_dir, "test_package.zip")
    with zipfile.ZipFile(zip_path, 'w') as z:
        z.writestr("Math_Rabat_2023.pdf", b"mock content 1")
        z.writestr("Math_Rabat_2023_cor.pdf", b"mock content 2")
        z.writestr("French_Casablanca_2022.pdf", b"mock content 3")
        # Insecure path to test Zip Slip protection
        z.writestr("../dangerous.pdf", b"dangerous content")

    # Mock text density check to return selectable for some, scanned for others
    def mock_density(zip_ref, member):
        if "cor.pdf" in member.filename or "Math" in member.filename:
            return "selectable"
        return "scanned_or_low_text"

    with patch("app.zip_exam_package.check_text_density", side_effect=mock_density):
        report = analyze_zip_package(zip_path)
        
        # Verify Zip Slip blocked dangerous path
        assert report["pdf_count"] == 3
        filenames = [it["internal_path"] for it in report["items"]]
        assert "../dangerous.pdf" not in filenames
        
        # Verify subject/role detection
        math_exam = next(it for it in report["items"] if it["internal_path"] == "Math_Rabat_2023.pdf")
        assert math_exam["detected_subject"] == "math"
        assert math_exam["file_role"] == "exam"
        assert math_exam["region"] == "Rabat"
        assert math_exam["year"] == 2023
        assert math_exam["text_density"] == "selectable"
        
        math_cor = next(it for it in report["items"] if it["internal_path"] == "Math_Rabat_2023_cor.pdf")
        assert math_cor["file_role"] == "correction"
        
        # Verify pairing
        assert len(report["pairs"]) == 1
        pair = report["pairs"][0]
        assert pair["exam_pdf"] == "Math_Rabat_2023.pdf"
        assert pair["solution_pdf"] == "Math_Rabat_2023_cor.pdf"
        assert pair["subject"] == "math"

        # Verify warnings
        assert "no_correction_found" in next(it for it in report["items"] if "French" in it["internal_path"])["warnings"]
        assert "scanned_pdf_needs_ocr" in next(it for it in report["items"] if "French" in it["internal_path"])["warnings"]

def test_analyze_zip_package_missing_file():
    report = analyze_zip_package("non_existent_file.zip")
    assert report["pdf_count"] == 0
    assert "n'existe pas" in report["warnings"][0]
