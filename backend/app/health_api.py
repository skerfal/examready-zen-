from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional, Union
from app.readiness_checks import run_all_readiness_checks
from app.agent import diagnose_math_answer
from app.question_bank import get_demo_questions
from app.session import start_diagnostic_session, submit_diagnostic_answers
from app.result_summary import create_student_result_summary
from app.practice_plan import create_practice_plan

# New module imports
from app.topic_map import list_topics, get_topic
from app.revision_notes import get_revision_note
from app.historical_exam_bank import (
    list_historical_exams,
    load_historical_exam,
    list_questions_by_topic,
    list_questions_requiring_photo
)

app = FastAPI(title="ExamReady Zen Math Diagnostic API Gateway")

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class DiagnosticRequest(BaseModel):
    question: str
    student_answer: str
    expected_answer: str

class StartRequest(BaseModel):
    student_alias: str = "demo_student"
    source: str = "historical_ifrane_2023"

class AnswerItem(BaseModel):
    question_id: str
    student_answer: str

class SubmitRequest(BaseModel):
    session_id: str
    answers: list[AnswerItem]

class ImportLocalRequest(BaseModel):
    input_path: str

class AnalyzeZipRequest(BaseModel):
    zip_path: str

class CheckAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    student_answer: str

class CheckAnswerResponse(BaseModel):
    question_id: str
    status: str
    friendly_message: str
    expected_answer_available: bool
    correct_answer_display: Optional[str] = None
    mistake_type: Optional[str] = None
    needs_visual_review: bool
    can_retry: bool

# Core Endpoints
@app.get("/healthz")
def healthz():
    return {
        "status": "alive",
        "service": "examready-zen-math-mvp",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/readyz")
def readyz():
    return run_all_readiness_checks()

@app.post("/diagnose")
def diagnose(request: DiagnosticRequest):
    result = diagnose_math_answer(
        question=request.question,
        student_answer=request.student_answer,
        expected_answer=request.expected_answer
    )
    return result

@app.get("/demo-questions")
def demo_questions():
    return get_demo_questions()

@app.post("/diagnostic/start")
def diagnostic_start(request: StartRequest):
    result = start_diagnostic_session(request.student_alias, request.source)
    return result

@app.post("/diagnostic/submit")
def diagnostic_submit(request: SubmitRequest):
    try:
        answers_list = [{"question_id": a.question_id, "student_answer": a.student_answer} for a in request.answers]
        result = submit_diagnostic_answers(request.session_id, answers_list)
        
        # Calculate summary and practice plan
        summary = create_student_result_summary(result)
        plan = create_practice_plan(result)
        
        # Include result_summary and practice_plan in final response
        result["result_summary"] = summary
        result["practice_plan"] = plan
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/diagnostic/check-answer", response_model=CheckAnswerResponse)
def diagnostic_check_answer(request: CheckAnswerRequest):
    from app.session import SESSIONS
    from app.answer_checker import check_answer
    
    session = SESSIONS.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid session_id")
        
    questions = session.get("questions", [])
    question = next((q for q in questions if q.get("question_id") == request.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in this session")
        
    # Get approved expected_answer only (curated/demo exams are approved by default)
    exam_id = question.get("exam_id", "")
    is_approved_ans = (exam_id in ["ifrane_2023_math", "demo", "", None]) or (question.get("answer_status") == "approved")
    expected_answer = question.get("expected_answer", "") if is_approved_ans else ""
    
    res = check_answer(
        student_answer=request.student_answer,
        expected_answer=expected_answer,
        requires_visual_support=question.get("requires_visual_support", False),
        requires_image_upload=question.get("requires_image_upload", False),
        answer_type=question.get("answer_type", "text")
    )
    res["question_id"] = request.question_id
    return res

# New Topic Map, Revision Notes, and Exam Bank Endpoints
@app.get("/topics")
def get_topics_list():
    return list_topics()

@app.get("/topics/{topic_id}")
def get_topic_details(topic_id: str):
    topic = get_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic

@app.get("/revision-notes/{topic_id}")
def get_revision_note_details(topic_id: str):
    note = get_revision_note(topic_id)
    if not note:
        raise HTTPException(status_code=404, detail="Revision note not found")
    return note

@app.get("/historical-exams")
def get_historical_exams_list():
    return list_historical_exams()

@app.get("/historical-exams/registry")
def get_historical_exams_registry():
    from app.exam_registry import load_registry
    return load_registry()

@app.get("/historical-exams/ifrane_2023_math")
def get_ifrane_exam_details():
    exam = load_historical_exam("ifrane_2023_math")
    if not exam:
        raise HTTPException(status_code=404, detail="Ifrane 2023 Math exam not found")
    return exam

@app.get("/historical-questions/topic/{topic_id}")
def get_questions_by_topic_id(topic_id: str):
    return list_questions_by_topic(topic_id)

@app.get("/historical-questions/photo-required")
def get_photo_questions():
    return list_questions_requiring_photo()

@app.get("/exam-bank")
def get_exam_bank():
    from app.exam_registry import load_registry
    from app.historical_exam_bank import load_historical_exam
    from app.topic_map import list_topics
    import json
    
    registry = load_registry()
    exams_list = []
    
    total_questions = 0
    subjects_set = set()
    exams_needing_review = 0
    
    topic_questions = {}
    
    for exam_id, rec in registry.items():
        exam_data = load_historical_exam(exam_id)
        
        region = rec.get("region", "Unknown")
        year = rec.get("year", 0)
        subject = rec.get("subject", "math")
        subjects_set.add(subject)
        
        questions_count = rec.get("questions_count", 0)
        needs_manual = rec.get("needs_manual_verification", False)
        status = rec.get("status", "unknown")
        
        if needs_manual:
            exams_needing_review += 1
            
        topics = []
        has_solution = status == "solution_file_detected"
        
        if exam_data:
            questions = exam_data.get("questions", [])
            questions_count = len(questions)
            topics_seen = set()
            for q in questions:
                t_id = q.get("topic_id")
                if t_id and t_id != "unknown":
                    topics_seen.add(t_id)
                    if t_id not in topic_questions:
                        topic_questions[t_id] = []
                    topic_questions[t_id].append(exam_id)
                    
                if q.get("expected_answer") or q.get("correction_needed"):
                    has_solution = True
                    
            topics = sorted(list(topics_seen))
            
        total_questions += questions_count
        
        title = f"{subject.capitalize()} - {region} {year if year else ''}".strip()
        
        exams_list.append({
            "exam_id": exam_id,
            "title": title,
            "region": region,
            "year": year if year else None,
            "subject": subject,
            "questions_count": questions_count,
            "topic_count": len(topics),
            "topics": topics,
            "status": status,
            "needs_manual_verification": needs_manual,
            "has_solution": has_solution
        })
        
    topics_map = list_topics()
    topic_coverage = []
    
    for t in topics_map:
        t_id = t.get("topic_id")
        t_title = t.get("title_for_student") or t.get("topic_id").replace("_", " ").capitalize()
        
        exam_ids = topic_questions.get(t_id, [])
        question_count = len(exam_ids)
        unique_exam_ids = sorted(list(set(exam_ids)))
        
        topic_coverage.append({
            "topic_id": t_id,
            "topic_title": t_title,
            "question_count": question_count,
            "exam_count": len(unique_exam_ids),
            "exam_ids": unique_exam_ids
        })
        
    topic_coverage.sort(key=lambda x: (-x["question_count"], x["topic_id"]))
    
    return {
        "total_exams": len(exams_list),
        "total_questions": total_questions,
        "subjects": sorted(list(subjects_set)),
        "exams_needing_review": exams_needing_review,
        "exams": exams_list,
        "topic_coverage": topic_coverage
    }

@app.post("/exam-bank/analyze-zip")
def analyze_zip_endpoint(request: AnalyzeZipRequest):
    from app.zip_exam_package import analyze_zip_package
    res = analyze_zip_package(request.zip_path)
    return res

@app.post("/exam-bank/import-local")
def import_local_exam_folder(request: ImportLocalRequest):
    import os
    import shutil
    from app.exam_importer import scan_input_folder, safe_extract_zip, process_exam_file
    
    input_path = os.path.abspath(request.input_path)
    if not os.path.exists(input_path):
        raise HTTPException(status_code=400, detail=f"Path '{request.input_path}' does not exist.")
        
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    imported_dir = os.path.join(base_dir, "data", "historical_exams", "imported")
    temp_dir = os.path.join(base_dir, "data", "historical_exams", "temp_extraction")
    
    os.makedirs(imported_dir, exist_ok=True)
    os.makedirs(temp_dir, exist_ok=True)
    
    files_to_process = []
    if os.path.isdir(input_path):
        files_to_process = scan_input_folder(input_path)
    elif input_path.lower().endswith(('.pdf', '.zip')):
        files_to_process = [input_path]
    else:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail="Input must be a PDF or ZIP file or a directory.")
        
    metrics = {
        "files_found": len(files_to_process),
        "exams_imported": 0,
        "duplicates_skipped": 0,
        "scanned_manual_review_needed": 0,
        "errors": 0,
        "imported_exam_ids": []
    }
    
    for fpath in files_to_process:
        try:
            if fpath.lower().endswith('.zip'):
                extracted = safe_extract_zip(fpath, temp_dir)
                for pdf_path in extracted:
                    res = process_exam_file(pdf_path, temp_dir, imported_dir)
                    if res["success"]:
                        if res["registry_updated"]:
                            metrics["exams_imported"] += 1
                            metrics["imported_exam_ids"].append(res["exam_id"])
                        else:
                            metrics["duplicates_skipped"] += 1
                        if res["status"] == "scanned_pdf_needs_manual_review":
                            metrics["scanned_manual_review_needed"] += 1
                    else:
                        metrics["errors"] += 1
            else:
                res = process_exam_file(fpath, temp_dir, imported_dir)
                if res["success"]:
                    if res["registry_updated"]:
                        metrics["exams_imported"] += 1
                        metrics["imported_exam_ids"].append(res["exam_id"])
                    else:
                        metrics["duplicates_skipped"] += 1
                    if res["status"] == "scanned_pdf_needs_manual_review":
                        metrics["scanned_manual_review_needed"] += 1
                else:
                    metrics["errors"] += 1
        except Exception:
            metrics["errors"] += 1
            
    shutil.rmtree(temp_dir, ignore_errors=True)
    return metrics

class ReviewRequest(BaseModel):
    status: str
    review_notes: str = ""
    reviewed_by: str = "local_admin"

@app.get("/exam-bank/{exam_id}")
def get_exam_bank_detail(exam_id: str):
    import os
    import json
    from app.exam_registry import load_registry
    from app.historical_exam_bank import load_historical_exam
    
    registry = load_registry()
    rec = registry.get(exam_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Exam not found in registry")
        
    exam_data = load_historical_exam(exam_id)
    
    questions = []
    topics = []
    if exam_data:
        questions = exam_data.get("questions", [])
        topics_seen = set()
        for q in questions:
            t_id = q.get("topic_id")
            if t_id and t_id != "unknown":
                topics_seen.add(t_id)
        topics = sorted(list(topics_seen))
        
    status = rec.get("status", "unknown")
    
    # Compile warnings
    warnings = []
    if status == "scanned_pdf_needs_manual_review" or status == "scanned_pdf_needs_review":
        warnings.append("Le document PDF est un scan (OCR non disponible ou insuffisant). Une transcription manuelle est requise.")
    if status == "missing_metadata":
        warnings.append("Des métadonnées importantes (année, région) manquent dans le nom du fichier.")
    if not questions:
        warnings.append("Aucune question n'a été extraite. La structure du document doit être vérifiée.")
    if exam_id != "ifrane_2023_math":
        if not any(q.get("expected_answer") for q in questions):
            warnings.append("Cet examen n'a pas de corrigé ou de réponses attendues enregistrées.")
        else:
            # Check for missing answers for auto-checkable approved questions
            approved_qs = [q for q in questions if q.get("status") == "approved"]
            missing_answers = False
            for q in approved_qs:
                answer_type = q.get("answer_type", "text")
                if answer_type in ["numeric", "text", "chart_interpretation"]:
                    expected = q.get("expected_answer", "").strip()
                    ans_status = q.get("answer_status", "missing")
                    if not expected or ans_status != "approved":
                        missing_answers = True
                        break
            if missing_answers:
                warnings.append("ready_with_missing_answers_warning")
                
    # Load ocr_summary if available
    ocr_summary = None
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ocr_summary_path = os.path.join(base_dir, "data", "ocr", exam_id, "ocr_summary.json")
    if os.path.exists(ocr_summary_path):
        try:
            with open(ocr_summary_path, "r", encoding="utf-8") as f:
                ocr_summary = json.load(f)
        except Exception:
            pass
        
    return {
        "exam_id": exam_id,
        "metadata": {
            "region": rec.get("region", "Unknown"),
            "year": rec.get("year", 0),
            "subject": rec.get("subject", "math"),
            "grade": rec.get("grade", "6AEP"),
            "imported_at": rec.get("imported_at"),
            "updated_at": rec.get("updated_at"),
            "review_notes": rec.get("review_notes"),
            "reviewed_by": rec.get("reviewed_by")
        },
        "source_file": rec.get("source_file"),
        "questions": questions,
        "topics": topics,
        "status": status,
        "needs_manual_verification": rec.get("needs_manual_verification", False),
        "extraction_warnings": warnings,
        "package_metadata": rec.get("package_metadata"),
        "extraction_quality_summary": exam_data.get("extraction_quality_summary") if exam_data else None,
        "ocr_summary": ocr_summary
    }

@app.patch("/exam-bank/{exam_id}/review")
def review_exam_endpoint(exam_id: str, request: ReviewRequest):
    from app.exam_registry import load_registry, save_registry, ALLOWED_STATUSES
    from app.topic_map import load_topic_map
    
    if request.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {request.status}")
        
    registry = load_registry()
    rec = registry.get(exam_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Exam not found in registry")
        
    warning = None
    # Enforce approval validation if status is set to "ready"
    if request.status == "ready":
        # Load questions to validate
        from app.historical_exam_bank import load_historical_exam
        exam_data = load_historical_exam(exam_id)
        if not exam_data:
            raise HTTPException(status_code=400, detail="Cannot review an exam that has no JSON file on disk.")
            
        questions = exam_data.get("questions", [])
        approved_qs = [q for q in questions if q.get("status") == "approved"]
        
        if not approved_qs:
            raise HTTPException(
                status_code=400,
                detail="L'examen doit avoir au moins une question approuvée (status='approved') pour être publié."
            )
            
        # Get valid topic IDs
        valid_topics = {t["topic_id"] for t in load_topic_map()}
        
        for q in approved_qs:
            t_id = q.get("topic_id")
            if not t_id or t_id == "needs_manual_classification":
                raise HTTPException(
                    status_code=400,
                    detail=f"La question {q.get('question_id')} a besoin d'une notion classifiée valide."
                )
            if t_id not in valid_topics:
                raise HTTPException(
                    status_code=400,
                    detail=f"La notion '{t_id}' de la question {q.get('question_id')} n'existe pas dans le programme de 6AEP."
                )
        
        # Check for missing answers for auto-checkable questions
        missing_answers = False
        for q in approved_qs:
            answer_type = q.get("answer_type", "text")
            if answer_type in ["numeric", "text", "chart_interpretation"]:
                expected = q.get("expected_answer", "").strip()
                ans_status = q.get("answer_status", "missing")
                if not expected or ans_status != "approved":
                    missing_answers = True
                    break
        if missing_answers:
            warning = "ready_with_missing_answers_warning"
                
    # Update registry record
    rec["status"] = request.status
    rec["review_notes"] = request.review_notes
    rec["reviewed_by"] = request.reviewed_by
    rec["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Determine needs_manual_verification based on new status
    if request.status == "ready":
        rec["needs_manual_verification"] = False
    elif request.status == "rejected":
        rec["needs_manual_verification"] = False
    else:
        rec["needs_manual_verification"] = True
        
    registry[exam_id] = rec
    save_registry(registry)
    
    res = dict(rec)
    if warning:
        res["warning"] = warning
    return res

@app.post("/exam-bank/upload")
async def upload_exam_bank_file(file: UploadFile = File(...)):
    import os
    import re
    import shutil
    from app.exam_importer import process_exam_file, safe_extract_zip, process_zip_package_file
    from app.exam_registry import load_registry, save_registry
    
    # 1. Extension check
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".zip"]:
        raise HTTPException(status_code=400, detail="Only .pdf and .zip files are allowed.")
        
    # 2. Read and validate size (Max 10MB)
    contents = await file.read()
    file_size = len(contents)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max allowed size is 10MB.")
        
    # 3. Create upload directory and sanitize filename
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_dir = os.path.join(base_dir, "data", "uploads", "exams")
    os.makedirs(upload_dir, exist_ok=True)
    
    clean_name = "".join(c for c in file.filename if c.isalnum() or c in "._- ").strip()
    if not clean_name:
        clean_name = "uploaded_exam" + ext
        
    # Avoid overwriting
    base_name, file_ext = os.path.splitext(clean_name)
    counter = 1
    target_path = os.path.join(upload_dir, clean_name)
    while os.path.exists(target_path):
        clean_name = f"{base_name}_{counter}{file_ext}"
        target_path = os.path.join(upload_dir, clean_name)
        counter += 1
        
    # 4. Save file to disk
    with open(target_path, "wb") as f:
        f.write(contents)
        
    # 5. Process through importer
    imported_dir = os.path.join(base_dir, "data", "historical_exams", "imported")
    temp_dir = os.path.join(base_dir, "data", "historical_exams", "temp_extraction")
    os.makedirs(imported_dir, exist_ok=True)
    os.makedirs(temp_dir, exist_ok=True)
    
    if ext == ".zip":
        try:
            res = process_zip_package_file(target_path, temp_dir, imported_dir)
            
            # Enforce draft/review status
            registry = load_registry()
            for exam_id in res.get("imported_exam_ids", []):
                rec = registry.get(exam_id)
                if rec:
                    cur_status = rec.get("status")
                    if cur_status in ["scanned_pdf_needs_manual_review", "scanned_pdf_needs_review"]:
                        rec["status"] = "scanned_pdf_needs_review"
                    else:
                        rec["status"] = "imported_draft"
                    
                    rec["needs_manual_verification"] = True
                    registry[exam_id] = rec
            save_registry(registry)
            
            return res
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
            
    metrics = {
        "filename": clean_name,
        "saved_path": target_path,
        "files_found": 1,
        "exams_imported": 0,
        "duplicates_skipped": 0,
        "scanned_manual_review_needed": 0,
        "errors": 0,
        "imported_exam_ids": []
    }
    
    try:
        res = process_exam_file(target_path, temp_dir, imported_dir)
        if res["success"]:
            exam_id = res["exam_id"]
            if res["registry_updated"]:
                metrics["exams_imported"] += 1
                metrics["imported_exam_ids"].append(exam_id)
            else:
                metrics["duplicates_skipped"] += 1
                
            # Enforce draft/review status
            registry = load_registry()
            rec = registry.get(exam_id)
            if rec:
                cur_status = rec.get("status")
                if cur_status in ["scanned_pdf_needs_manual_review", "scanned_pdf_needs_review"]:
                    rec["status"] = "scanned_pdf_needs_review"
                else:
                    rec["status"] = "imported_draft"
                
                # Ensure it is flagged for manual review
                rec["needs_manual_verification"] = True
                registry[exam_id] = rec
                save_registry(registry)
                
            if res["status"] in ["scanned_pdf_needs_manual_review", "scanned_pdf_needs_review"]:
                metrics["scanned_manual_review_needed"] += 1
        else:
            metrics["errors"] += 1
    except Exception:
        metrics["errors"] += 1
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
        
    return metrics

class QuestionEditRequest(BaseModel):
    question_text: str = None
    topic_id: str = None
    answer_type: str = None
    difficulty: str = None
    expected_answer: str = None
    proposed_expected_answer: str = None
    requires_visual_support: bool = None
    requires_image_upload: bool = None
    status: str = None
    answer_status: str = None
    answer_matching_confidence: str = None

class SolutionExtractRequest(BaseModel):
    solution_file_path: str

class QuestionAnswerEditRequest(BaseModel):
    expected_answer: str = None
    proposed_expected_answer: str = None
    answer_status: str = None

def get_exam_filepath(exam_id: str) -> str:
    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    curated_path = os.path.join(base_dir, "data", "historical_exams", f"{exam_id}.json")
    if os.path.exists(curated_path):
        return curated_path
    return os.path.join(base_dir, "data", "historical_exams", "imported", f"{exam_id}.json")

@app.post("/exam-bank/{exam_id}/extract-questions")
def extract_exam_questions_endpoint(exam_id: str):
    import os
    import json
    from app.exam_registry import load_registry, save_registry
    from app.question_extractor import extract_questions_from_pdf
    from app.historical_exam_bank import load_historical_exam
    
    registry = load_registry()
    rec = registry.get(exam_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Exam not found in registry")
        
    source_file = rec.get("source_file")
    if not source_file:
        raise HTTPException(status_code=400, detail="No source file registered for this exam.")
        
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pdf_path = os.path.join(base_dir, "data", "uploads", "exams", source_file)
    
    if not os.path.exists(pdf_path):
        # Fallback to direct historical exams path
        pdf_path = os.path.join(base_dir, "data", "historical_exams", source_file)
        if not os.path.exists(pdf_path):
            pdf_path = source_file
            if not os.path.exists(pdf_path):
                raise HTTPException(status_code=400, detail=f"Source PDF file '{source_file}' not found.")
                
    # Run extractor
    res = extract_questions_from_pdf(pdf_path, exam_id)
    
    # Load existing or create new JSON structure
    exam_data = load_historical_exam(exam_id)
    if not exam_data:
        exam_data = {
            "exam_id": exam_id,
            "region": rec.get("region", "Unknown"),
            "year": rec.get("year", 0),
            "subject": rec.get("subject", "math"),
            "grade": "6AEP",
            "source_file": source_file,
            "total_pages": rec.get("total_pages", 1),
            "questions": []
        }
        
    exam_data["questions"] = res["questions"]
    exam_data["extraction_quality_summary"] = res.get("extraction_quality_summary")
    
    # Write back to JSON
    filepath = get_exam_filepath(exam_id)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(exam_data, f, indent=2, ensure_ascii=False)
        
    # Update registry counts and status
    rec["questions_count"] = len(res["questions"])
    if res["status"] == "scanned_needs_ocr":
        rec["status"] = "scanned_pdf_needs_review"
    else:
        rec["status"] = "imported_draft"
    rec["needs_manual_verification"] = True
    
    registry[exam_id] = rec
    save_registry(registry)
    
    questions_needing_review = sum(1 for q in res["questions"] if q.get("status") != "approved")
    
    # Compile page quality metadata
    page_quality = {}
    for p_str, length in res.get("extraction_quality_summary", {}).get("page_text_length", {}).items():
        page_quality[p_str] = {
            "text_length": length,
            "scanned": length < 50,
            "warnings": ["low_text_density"] if length < 50 else []
        }
        
    needs_manual_verification_count = sum(1 for q in res["questions"] if q.get("needs_manual_verification", True))
    
    return {
        "exam_id": exam_id,
        "questions_detected": len(res["questions"]),
        "questions_needing_review": questions_needing_review,
        "extraction_warnings": res["warnings"],
        "draft_questions": res["questions"],
        "extraction_quality_summary": res.get("extraction_quality_summary"),
        "page_quality": page_quality,
        "warnings": res["warnings"],
        "needs_manual_verification_count": needs_manual_verification_count
    }

@app.get("/exam-bank/{exam_id}/questions")
def get_exam_questions_endpoint(exam_id: str):
    import re
    from app.historical_exam_bank import load_historical_exam
    exam_data = load_historical_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    questions = exam_data.get("questions", [])
    
    # Standardize questions to have all required keys
    for q in questions:
        if "status" not in q:
            q["status"] = "approved" if exam_id == "ifrane_2023_math" else "draft"
        if "needs_manual_verification" not in q:
            q["needs_manual_verification"] = False if exam_id == "ifrane_2023_math" else True
        if "topic_confidence" not in q:
            q["topic_confidence"] = "high" if exam_id == "ifrane_2023_math" else "low"
        if "extraction_confidence" not in q:
            q["extraction_confidence"] = "high"
        if "detected_number" not in q:
            match = re.search(r"Q0*(\d+)", q.get("question_id", ""))
            q["detected_number"] = int(match.group(1)) if match else 1
            
        # Answer key properties
        if "expected_answer" not in q:
            q["expected_answer"] = ""
        if "proposed_expected_answer" not in q:
            q["proposed_expected_answer"] = ""
        if "answer_matching_confidence" not in q:
            q["answer_matching_confidence"] = "high" if exam_id == "ifrane_2023_math" else "needs_manual_answer_review"
        if "answer_matching_reason" not in q:
            q["answer_matching_reason"] = "Curated standard" if exam_id == "ifrane_2023_math" else "Aucune correction extraite."
        if "answer_status" not in q:
            q["answer_status"] = "approved" if (exam_id == "ifrane_2023_math" and q.get("expected_answer")) else "missing"
        if "answer_source_file" not in q:
            q["answer_source_file"] = ""
            
    return questions

@app.patch("/exam-bank/{exam_id}/questions/{question_id}")
def update_exam_question_endpoint(exam_id: str, question_id: str, request: QuestionEditRequest):
    import json
    from app.historical_exam_bank import load_historical_exam
    from app.exam_registry import load_registry
    
    exam_data = load_historical_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    questions = exam_data.get("questions", [])
    target_q = None
    for q in questions:
        if q.get("question_id") == question_id:
            target_q = q
            break
            
    if not target_q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Update fields
    if request.question_text is not None:
        target_q["question_text"] = request.question_text
    if request.topic_id is not None:
        target_q["topic_id"] = request.topic_id
        target_q["linked_revision_note_topic_id"] = request.topic_id
        target_q["skill_tag"] = request.topic_id
        
        # update domain from topic_map
        from app.topic_map import get_topic
        t_info = get_topic(request.topic_id)
        if t_info:
            target_q["domain"] = t_info.get("domain", target_q.get("domain", "numbers_calculation"))
            
    if request.answer_type is not None:
        target_q["answer_type"] = request.answer_type
    if request.difficulty is not None:
        target_q["difficulty"] = request.difficulty
    if request.expected_answer is not None:
        target_q["expected_answer"] = request.expected_answer
    if request.proposed_expected_answer is not None:
        target_q["proposed_expected_answer"] = request.proposed_expected_answer
    if request.answer_status is not None:
        if request.answer_status not in ["missing", "proposed", "approved", "rejected", "needs_manual_answer_review"]:
            raise HTTPException(status_code=400, detail=f"Invalid answer status: {request.answer_status}")
        target_q["answer_status"] = request.answer_status
    if request.answer_matching_confidence is not None:
        target_q["answer_matching_confidence"] = request.answer_matching_confidence
        
    if request.requires_visual_support is not None:
        target_q["requires_visual_support"] = request.requires_visual_support
    if request.requires_image_upload is not None:
        target_q["requires_image_upload"] = request.requires_image_upload
    if request.status is not None:
        if request.status not in ["draft", "needs_review", "approved", "rejected"]:
            raise HTTPException(status_code=400, detail=f"Invalid question status: {request.status}")
        target_q["status"] = request.status
        
    # Write back to JSON
    filepath = get_exam_filepath(exam_id)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(exam_data, f, indent=2, ensure_ascii=False)
        
    return target_q

@app.post("/exam-bank/{exam_id}/extract-solutions")
def extract_solutions_endpoint(exam_id: str, request: SolutionExtractRequest):
    import os
    import json
    from app.historical_exam_bank import load_historical_exam
    from app.solution_extractor import extract_solution_blocks_from_pdf
    from app.answer_matcher import match_answers_to_questions
    
    exam_data = load_historical_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    res = extract_solution_blocks_from_pdf(request.solution_file_path)
    if res["status"] == "scanned_solution_needs_ocr":
        return {
            "status": "scanned_solution_needs_ocr",
            "extracted_blocks_count": 0,
            "warnings": res["warnings"],
            "questions": []
        }
    if res["status"] == "error":
        raise HTTPException(status_code=400, detail=res["warnings"][0])
        
    # Match solutions to questions
    questions = exam_data.get("questions", [])
    matched_questions = match_answers_to_questions(questions, res["blocks"])
    
    # Store source filename
    source_filename = os.path.basename(request.solution_file_path)
    for q in matched_questions:
        if q.get("answer_status") == "proposed":
            q["answer_source_file"] = source_filename
            
    exam_data["questions"] = matched_questions
    
    # Write back to JSON
    filepath = get_exam_filepath(exam_id)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(exam_data, f, indent=2, ensure_ascii=False)
        
    return {
        "status": "success",
        "extracted_blocks_count": len(res["blocks"]),
        "questions": matched_questions
    }

@app.get("/exam-bank/{exam_id}/answers")
def get_exam_answers_endpoint(exam_id: str):
    from app.historical_exam_bank import load_historical_exam
    exam_data = load_historical_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    questions = exam_data.get("questions", [])
    answers = []
    for q in questions:
        expected = q.get("expected_answer", "")
        proposed = q.get("proposed_expected_answer", "")
        confidence = q.get("answer_matching_confidence", "high" if exam_id == "ifrane_2023_math" else "needs_manual_answer_review")
        reason = q.get("answer_matching_reason", "Curated standard" if exam_id == "ifrane_2023_math" else "Aucune correction extraite.")
        status = "approved" if (exam_id == "ifrane_2023_math" and expected) else q.get("answer_status", "missing")
        source_file = q.get("answer_source_file", "")
        
        answers.append({
            "question_id": q.get("question_id"),
            "question_text": q.get("question_text"),
            "expected_answer": expected,
            "proposed_expected_answer": proposed,
            "answer_matching_confidence": confidence,
            "answer_matching_reason": reason,
            "answer_status": status,
            "answer_source_file": source_file
        })
    return answers

@app.patch("/exam-bank/{exam_id}/questions/{question_id}/answer")
def update_exam_question_answer_endpoint(exam_id: str, question_id: str, request: QuestionAnswerEditRequest):
    import json
    from app.historical_exam_bank import load_historical_exam
    
    exam_data = load_historical_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    questions = exam_data.get("questions", [])
    target_q = None
    for q in questions:
        if q.get("question_id") == question_id:
            target_q = q
            break
            
    if not target_q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Update expected answer / answer_status
    if request.expected_answer is not None:
        target_q["expected_answer"] = request.expected_answer
    if request.proposed_expected_answer is not None:
        target_q["proposed_expected_answer"] = request.proposed_expected_answer
    if request.answer_status is not None:
        if request.answer_status not in ["missing", "proposed", "approved", "rejected", "needs_manual_answer_review"]:
            raise HTTPException(status_code=400, detail=f"Invalid answer status: {request.answer_status}")
        target_q["answer_status"] = request.answer_status
        
        # Sync expected_answer if status was set to approved
        if request.answer_status == "approved" and request.expected_answer is None:
            if not target_q.get("expected_answer") and target_q.get("proposed_expected_answer"):
                target_q["expected_answer"] = target_q["proposed_expected_answer"]
                
    # Write back to JSON
    filepath = get_exam_filepath(exam_id)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(exam_data, f, indent=2, ensure_ascii=False)
        
    return target_q


def find_source_pdf(source_file: str, package_metadata: Optional[dict] = None) -> Optional[str]:
    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Try standard uploads
    p = os.path.join(base_dir, "data", "uploads", "exams", source_file)
    if os.path.exists(p):
        return p
        
    # 2. Try standard historical path
    p = os.path.join(base_dir, "data", "historical_exams", source_file)
    if os.path.exists(p):
        return p
        
    # 3. Try package metadata path
    if package_metadata:
        pkg_id = package_metadata.get("package_id")
        internal_path = package_metadata.get("internal_pdf_path")
        if pkg_id and internal_path:
            p = os.path.join(base_dir, "data", "historical_exams", "imported", "extracted_packages", pkg_id, internal_path)
            if os.path.exists(p):
                return p
            p = os.path.join(base_dir, "data", "historical_exams", "imported", "extracted_packages", pkg_id, os.path.basename(internal_path))
            if os.path.exists(p):
                return p
                
    # 4. Try current working directory
    if os.path.exists(source_file):
        return os.path.abspath(source_file)
        
    # 5. Search recursively in standard user directories (Desktop and workspaces)
    search_roots = [
        r"C:\Users\lenovo\OneDrive\Desktop\IqraaNow5.0",
        r"C:\Users\lenovo\OneDrive\Desktop\exam-ready-zen",
        r"C:\Users\lenovo\OneDrive\Desktop\examready-zen-capstone-submit"
    ]
    for root in search_roots:
        if os.path.exists(root):
            for dirpath, _, filenames in os.walk(root):
                if source_file in filenames:
                    return os.path.join(dirpath, source_file)
                    
    return None

@app.post("/exam-bank/{exam_id}/generate-previews")
def generate_exam_previews_endpoint(exam_id: str):
    import os
    from app.exam_registry import load_registry
    from app.pdf_preview import generate_pdf_previews
    
    registry = load_registry()
    rec = registry.get(exam_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Exam not found in registry")
        
    source_file = rec.get("source_file")
    if not source_file:
        raise HTTPException(status_code=400, detail="No source file registered for this exam.")
        
    pdf_path = find_source_pdf(source_file, rec.get("package_metadata"))
    if not pdf_path:
        raise HTTPException(status_code=400, detail=f"Source PDF file '{source_file}' not found.")
                
    result = generate_pdf_previews(pdf_path, exam_id)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["warnings"][0] if result["warnings"] else "Génération échouée")
    return result

@app.get("/exam-bank/{exam_id}/previews")
def get_exam_previews_list_endpoint(exam_id: str):
    import os
    import re
    from app.exam_registry import load_registry
    
    # Secure validation
    if not re.match(r"^[a-zA-Z0-9_-]+$", exam_id):
        raise HTTPException(status_code=400, detail="ID d'examen invalide.")
        
    registry = load_registry()
    if exam_id not in registry:
        raise HTTPException(status_code=404, detail="Exam not found in registry")
        
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    preview_dir = os.path.join(base_dir, "data", "previews", exam_id)
    
    previews = []
    if os.path.exists(preview_dir):
        for fname in sorted(os.listdir(preview_dir)):
            match = re.match(r"^page_(\d+)\.png$", fname)
            if match:
                page_number = int(match.group(1))
                previews.append({
                    "page_number": page_number,
                    "filename": fname,
                    "url": f"/exam-bank/{exam_id}/previews/{page_number}"
                })
    return previews

@app.get("/exam-bank/{exam_id}/previews/{page_number}")
def get_exam_preview_image_endpoint(exam_id: str, page_number: int):
    from fastapi.responses import FileResponse
    from app.pdf_preview import get_preview_file_path
    
    file_path = get_preview_file_path(exam_id, page_number)
    if not file_path:
        raise HTTPException(status_code=404, detail="Aperçu non trouvé ou accès refusé.")
        
    return FileResponse(file_path, media_type="image/png")


class OcrRequest(BaseModel):
    pages: Union[str, list[int]] = "all"

@app.post("/exam-bank/{exam_id}/run-ocr")
def run_exam_ocr_endpoint(exam_id: str, request: OcrRequest):
    import os
    from app.exam_registry import load_registry
    from app.ocr_extractor import run_ocr_extraction
    
    registry = load_registry()
    rec = registry.get(exam_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Exam not found in registry")
        
    source_file = rec.get("source_file")
    if not source_file:
        raise HTTPException(status_code=400, detail="No source file registered for this exam.")
        
    pdf_path = find_source_pdf(source_file, rec.get("package_metadata"))
    if not pdf_path:
        raise HTTPException(status_code=400, detail=f"Source PDF file '{source_file}' not found.")
                 
    res = run_ocr_extraction(exam_id, pdf_path, request.pages)
    return res



