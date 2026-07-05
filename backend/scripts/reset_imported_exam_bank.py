import os
import shutil
import json
import stat

def remove_readonly(func, path, _):
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception:
        pass

def delete_path(path):
    if not os.path.exists(path):
        return
    try:
        if os.path.isfile(path):
            os.chmod(path, stat.S_IWRITE)
            os.remove(path)
            print(f"Removed file: {path}")
        elif os.path.isdir(path):
            shutil.rmtree(path, onexc=remove_readonly)
            if os.path.exists(path):
                # Fallback if still exists
                shutil.rmtree(path, ignore_errors=True)
            print(f"Removed directory: {path}")
    except Exception as e:
        print(f"Error removing {path}: {e}")

def reset_imported_exam_bank():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"Base Directory: {base_dir}")

    # 1. Reset exam_registry.json
    registry_path = os.path.join(base_dir, "data", "historical_exams", "exam_registry.json")
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry = json.load(f)
        except Exception:
            registry = {}
            
        new_registry = {}
        # Keep only curated exam
        if "ifrane_2023_math" in registry:
            new_registry["ifrane_2023_math"] = registry["ifrane_2023_math"]
            
        with open(registry_path, "w", encoding="utf-8") as f:
            json.dump(new_registry, f, indent=2, ensure_ascii=False)
        print(f"Reset {registry_path} to only keep 'ifrane_2023_math'.")

    # 2. Clean data/historical_exams/ directly (keep only ifrane_2023_math.json, math_test_curation.json, exam_registry.json, and imported folder)
    hist_dir = os.path.join(base_dir, "data", "historical_exams")
    if os.path.exists(hist_dir):
        for fname in os.listdir(hist_dir):
            if fname in ["ifrane_2023_math.json", "math_test_curation.json", "exam_registry.json", "imported"]:
                continue
            path = os.path.join(hist_dir, fname)
            delete_path(path)

    # 3. Clean data/historical_exams/imported/
    imported_dir = os.path.join(base_dir, "data", "historical_exams", "imported")
    if os.path.exists(imported_dir):
        for fname in os.listdir(imported_dir):
            path = os.path.join(imported_dir, fname)
            delete_path(path)

    # 4. Clean data/uploads/
    uploads_dir = os.path.join(base_dir, "data", "uploads")
    if os.path.exists(uploads_dir):
        for fname in os.listdir(uploads_dir):
            path = os.path.join(uploads_dir, fname)
            delete_path(path)

    # 5. Clean data/previews/ (except ifrane_2023_math)
    previews_dir = os.path.join(base_dir, "data", "previews")
    if os.path.exists(previews_dir):
        for fname in os.listdir(previews_dir):
            if fname == "ifrane_2023_math":
                continue
            path = os.path.join(previews_dir, fname)
            delete_path(path)

    # 6. Clean data/ocr/ (except ifrane_2023_math)
    ocr_dir = os.path.join(base_dir, "data", "ocr")
    if os.path.exists(ocr_dir):
        for fname in os.listdir(ocr_dir):
            if fname == "ifrane_2023_math":
                continue
            path = os.path.join(ocr_dir, fname)
            delete_path(path)

    print("Exam Bank Reset Completed Successfully!")

if __name__ == "__main__":
    reset_imported_exam_bank()
