import os
import json
import zipfile
import tempfile
import shutil
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.health_api import app
from app.exam_registry import load_registry, save_registry
from app.exam_importer import process_zip_package_file

@pytest.fixture
def temp_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)

@pytest.fixture
def mock_registry(temp_dir):
    reg_path = os.path.join(temp_dir, "exam_registry.json")
    with patch("app.exam_registry.get_registry_path", return_value=reg_path):
        save_registry({})
        yield reg_path

@pytest.fixture
def client():
    return TestClient(app)

@patch("app.exam_importer.extract_pdf_text", return_value="Question 1: calcul 2+2. Q2: resoudre equation. " + "x" * 150)
@patch("app.exam_importer.get_pdf_page_count", return_value=2)
@patch("app.zip_exam_package.check_text_density", return_value="selectable")
def test_process_zip_package_file(mock_density, mock_page_count, mock_pdf_text, temp_dir, mock_registry):
    # 1. Create a mock zip package
    zip_path = os.path.join(temp_dir, "rabat_package.zip")
    with zipfile.ZipFile(zip_path, 'w') as z:
        z.writestr("Math_Rabat_2023.pdf", b"pdf content exam")
        z.writestr("Math_Rabat_2023_cor.pdf", b"pdf content solution")
        
    output_dir = os.path.join(temp_dir, "imported")
    
    # Run ZIP package processor
    report = process_zip_package_file(zip_path, temp_dir, output_dir)
    
    # Check package_id exists
    package_id = report["package_id"]
    assert package_id is not None
    assert report["exams_imported"] == 2
    assert "math_rabat_2023" in report["imported_exam_ids"]
    assert "math_rabat_2023_correction" in report["imported_exam_ids"]
    
    # Verify that files were extracted to data/historical_exams/imported/extracted_packages/{package_id}/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    extracted_pkg_dir = os.path.join(base_dir, "data", "historical_exams", "imported", "extracted_packages", package_id)
    assert os.path.exists(os.path.join(extracted_pkg_dir, "Math_Rabat_2023.pdf"))
    assert os.path.exists(os.path.join(extracted_pkg_dir, "Math_Rabat_2023_cor.pdf"))
    
    # Load registry and verify package metadata
    reg = load_registry()
    exam_rec = reg.get("math_rabat_2023")
    assert exam_rec is not None
    assert "package_metadata" in exam_rec
    pkg_meta = exam_rec["package_metadata"]
    assert pkg_meta["package_id"] == package_id
    assert pkg_meta["zip_filename"] == "rabat_package.zip"
    assert pkg_meta["internal_pdf_path"] == "Math_Rabat_2023.pdf"
    assert pkg_meta["paired_solution_internal_path"] == "Math_Rabat_2023_cor.pdf"
    assert pkg_meta["paired_solution_file_path"].endswith("Math_Rabat_2023_cor.pdf")

    # Clean up created extraction directory
    shutil.rmtree(extracted_pkg_dir, ignore_errors=True)

@patch("app.exam_importer.extract_pdf_text", return_value="Question 1: calcul 2+2. Q2: resoudre equation. " + "x" * 150)
@patch("app.exam_importer.get_pdf_page_count", return_value=2)
@patch("app.zip_exam_package.check_text_density", return_value="selectable")
def test_upload_zip_api(mock_density, mock_page_count, mock_pdf_text, temp_dir, mock_registry, client):
    # Create mock zip file
    zip_path = os.path.join(temp_dir, "upload_package.zip")
    with zipfile.ZipFile(zip_path, 'w') as z:
        z.writestr("Math_Rabat_2023.pdf", b"pdf content exam")
        
    with open(zip_path, "rb") as f:
        response = client.post(
            "/exam-bank/upload",
            files={"file": ("upload_package.zip", f, "application/zip")}
        )
        
    assert response.status_code == 200
    res_data = response.json()
    assert "package_id" in res_data
    assert "imported_exam_ids" in res_data
    assert "math_rabat_2023" in res_data["imported_exam_ids"]

    # Verify status in registry is imported_draft and needs_manual_verification is True
    reg = load_registry()
    exam_rec = reg.get("math_rabat_2023")
    assert exam_rec["status"] == "imported_draft"
    assert exam_rec["needs_manual_verification"] is True

    # Test GET /exam-bank/{exam_id} includes package_metadata
    detail_res = client.get("/exam-bank/math_rabat_2023")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert "package_metadata" in detail_data
    assert detail_data["package_metadata"]["zip_filename"].startswith("upload_package")
    assert detail_data["package_metadata"]["zip_filename"].endswith(".zip")

    # Test POST /exam-bank/analyze-zip
    analyze_res = client.post(
        "/exam-bank/analyze-zip",
        json={"zip_path": zip_path}
    )
    assert analyze_res.status_code == 200
    analyze_data = analyze_res.json()
    assert analyze_data["zip_filename"] == "upload_package.zip"
    assert len(analyze_data["items"]) == 1

    # Clean up created extraction directory
    package_id = res_data["package_id"]
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    extracted_pkg_dir = os.path.join(base_dir, "data", "historical_exams", "imported", "extracted_packages", package_id)
    shutil.rmtree(extracted_pkg_dir, ignore_errors=True)
