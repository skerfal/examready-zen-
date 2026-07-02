import os
import argparse
import shutil
import sys

# Add parent directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.exam_importer import scan_input_folder, safe_extract_zip, process_exam_file

def main():
    parser = argparse.ArgumentParser(description="Ingest historical math exams from a folder or file.")
    parser.add_argument("--input", required=True, help="Path to input file or directory containing PDFs/ZIPs.")
    args = parser.parse_args()
    
    input_path = os.path.abspath(args.input)
    if not os.path.exists(input_path):
        print(f"Error: Input path '{input_path}' does not exist.")
        sys.exit(1)
        
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    imported_dir = os.path.join(base_dir, "data", "historical_exams", "imported")
    os.makedirs(imported_dir, exist_ok=True)
    
    # Setup temporary extraction directory within base workspace
    temp_dir = os.path.join(base_dir, "data", "historical_exams", "temp_extraction")
    os.makedirs(temp_dir, exist_ok=True)
    
    files_to_process = []
    
    if os.path.isdir(input_path):
        # Scan folder for PDFs and ZIPs
        scanned = scan_input_folder(input_path)
        files_to_process.extend(scanned)
    else:
        if input_path.lower().endswith(('.pdf', '.zip')):
            files_to_process.append(input_path)
        else:
            print(f"Error: Input file must be a PDF or ZIP archive.")
            shutil.rmtree(temp_dir, ignore_errors=True)
            sys.exit(1)
            
    print(f"Found {len(files_to_process)} file(s) to process.\n")
    
    metrics = {
        "files_found": len(files_to_process),
        "imported": 0,
        "skipped": 0,
        "scanned_needs_review": 0,
        "errors": 0
    }
    
    for fpath in files_to_process:
        print(f"Processing: {os.path.basename(fpath)}...")
        try:
            if fpath.lower().endswith('.zip'):
                print("  Zip archive detected. Extracting...")
                extracted_pdfs = safe_extract_zip(fpath, temp_dir)
                print(f"  Extracted {len(extracted_pdfs)} PDF(s).")
                for pdf_path in extracted_pdfs:
                    print(f"    Ingesting: {os.path.basename(pdf_path)}...")
                    res = process_exam_file(pdf_path, temp_dir, imported_dir)
                    if res["success"]:
                        if res["registry_updated"]:
                            metrics["imported"] += 1
                        else:
                            metrics["skipped"] += 1
                        if res["status"] == "scanned_pdf_needs_manual_review":
                            metrics["scanned_needs_review"] += 1
                    else:
                        print(f"    Failed: {res.get('error')}")
                        metrics["errors"] += 1
            else:
                res = process_exam_file(fpath, temp_dir, imported_dir)
                if res["success"]:
                    if res["registry_updated"]:
                        metrics["imported"] += 1
                    else:
                        metrics["skipped"] += 1
                    if res["status"] == "scanned_pdf_needs_manual_review":
                        metrics["scanned_needs_review"] += 1
                else:
                    print(f"  Failed: {res.get('error')}")
                    metrics["errors"] += 1
        except Exception as e:
            print(f"  Error processing '{os.path.basename(fpath)}': {str(e)}")
            metrics["errors"] += 1
            
    # Clean up temp folder
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    print("\n" + "="*30)
    print("Historical Exam Ingestion Report")
    print("="*30)
    print(f"Files found:                 {metrics['files_found']}")
    print(f"Exams imported:              {metrics['imported']}")
    print(f"Duplicates skipped:          {metrics['skipped']}")
    print(f"Scanned/manual review needed: {metrics['scanned_needs_review']}")
    print(f"Errors encountered:          {metrics['errors']}")
    print("="*30)
    
if __name__ == "__main__":
    main()
