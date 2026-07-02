const API_BASE_URL = process.env.NEXT_PUBLIC_EXAMREADY_API_URL || "http://127.0.0.1:8030";

export interface Question {
  question_id: string;
  question_text: string;
  topic_id: string;
  domain: string;
  difficulty: string;
  answer_type: string;
  requires_image_upload: boolean;
  requires_visual_support: boolean;
}

export interface StartSessionResponse {
  session_id: string;
  questions: Question[];
}

export interface AnswerItem {
  question_id: string;
  student_answer: string;
}

export interface DetailedResult {
  question_id: string;
  question_text: string;
  student_answer: string;
  expected_answer: string;
  diagnosis: {
    status: string;
    concept_mastery: string;
    diagnosis: string;
    skill_tag: string;
    feedback: string;
    human_review_required: boolean;
  };
}

export interface RevisionNote {
  topic_id: string;
  title_for_student: string;
  very_easy_explanation: string;
  all_rules_to_remember: string;
  worked_examples: string;
  common_traps: string;
  mini_practice_questions: string;
  answer_key: string;
  remediation_hint: string;
  visual_description: string;
  when_to_upload_photo: string;
}

export interface PracticeBlock {
  skill_tag: string;
  objective: string;
  question_count: number;
  recommended_questions: any[];
  remediation_hint: string;
}

export interface PracticePlan {
  plan_title: string;
  recommended_skills: string[];
  practice_blocks: PracticeBlock[];
  estimated_time_minutes: number;
  success_criteria: string;
}

export interface ResultSummary {
  overall_level: string;
  student_message: string;
  parent_message: string;
  main_weaknesses: string[];
  strengths: string[];
  next_action: string;
  review_required: boolean;
}

export interface SubmitSessionResponse {
  session_id: string;
  score_percent: number;
  weak_skills: string[];
  strengths: string[];
  visual_support_needed: boolean;
  photo_upload_recommended: boolean;
  revision_notes_for_weak_skills: RevisionNote[];
  reinforcement_plan: PracticePlan;
  result_summary?: ResultSummary;
  practice_plan?: PracticePlan;
}

// 1. Check readiness of backend
export async function checkReadiness(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/readyz`);
  if (!response.ok) {
    throw new Error("Backend readyz check failed");
  }
  return response.json();
}

// 2. Start a diagnostic session
export async function startDiagnostic(
  student_alias: string = "demo_student",
  source: string = "historical_ifrane_2023"
): Promise<StartSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnostic/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ student_alias, source }),
  });
  if (!response.ok) {
    throw new Error("Failed to start diagnostic session");
  }
  return response.json();
}

// 3. Submit diagnostic answers
export async function submitDiagnostic(
  session_id: string,
  answers: AnswerItem[]
): Promise<SubmitSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnostic/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id, answers }),
  });
  if (!response.ok) {
    throw new Error("Failed to submit diagnostic answers");
  }
  return response.json();
}

// 4. Fetch details for a specific topic
export async function getTopic(topic_id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/topics/${topic_id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch topic details for ${topic_id}`);
  }
  return response.json();
}

// 5. Fetch a specific revision note
export async function getRevisionNote(topic_id: string): Promise<RevisionNote> {
  const response = await fetch(`${API_BASE_URL}/revision-notes/${topic_id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch revision note for ${topic_id}`);
  }
  return response.json();
}

// 6. Fetch questions requiring photo uploads
export async function getPhotoRequiredQuestions(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/historical-questions/photo-required`);
  if (!response.ok) {
    throw new Error("Failed to fetch photo-required questions");
  }
  return response.json();
}

export interface DiagnoseResponse {
  status: string;
  concept_mastery: string;
  diagnosis: string;
  feedback: string;
}

// 7. Check answer immediately via backend agent
export async function diagnoseAnswer(
  question: string,
  studentAnswer: string,
  expectedAnswer: string
): Promise<DiagnoseResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question,
      student_answer: studentAnswer,
      expected_answer: expectedAnswer
    })
  });
  if (!response.ok) {
    throw new Error("Diagnose call failed");
  }
  return response.json();
}

export interface ExamBankExam {
  exam_id: string;
  title: string;
  region: string;
  year: number | null;
  subject: string;
  questions_count: number;
  topic_count: number;
  topics: string[];
  status: string;
  needs_manual_verification: boolean;
  has_solution: boolean;
}

export interface TopicCoverage {
  topic_id: string;
  topic_title: string;
  question_count: number;
  exam_count: number;
  exam_ids: string[];
}

export interface ExamBankResponse {
  total_exams: number;
  total_questions: number;
  subjects: string[];
  exams_needing_review: number;
  exams: ExamBankExam[];
  topic_coverage: TopicCoverage[];
}

export interface ImportLocalResponse {
  files_found: number;
  exams_imported: number;
  duplicates_skipped: number;
  scanned_manual_review_needed: number;
  errors: number;
  imported_exam_ids: string[];
}

// 8. Fetch exam bank overview details
export async function getExamBank(): Promise<ExamBankResponse> {
  const response = await fetch(`${API_BASE_URL}/exam-bank`);
  if (!response.ok) {
    throw new Error("Failed to fetch exam bank details");
  }
  return response.json();
}

// 9. Import local exam folder
export async function importLocalExamFolder(inputPath: string): Promise<ImportLocalResponse> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/import-local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input_path: inputPath })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to import local folder");
  }
  return response.json();
}

// 10. Fetch a single exam's detail
export async function getExamBankExam(examId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch exam details for ${examId}`);
  }
  return response.json();
}

// 11. Review / Crate an exam
export async function reviewExam(examId: string, payload: {
  status: string;
  review_notes: string;
  reviewed_by: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/review`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to submit review for ${examId}`);
  }
  return response.json();
}

// 12. Upload an exam file (.pdf or .zip)
export async function uploadExamFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/exam-bank/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload exam file");
  }
  return response.json();
}

// 13. Extract questions from PDF
export async function extractExamQuestions(examId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/extract-questions`, {
    method: "POST"
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to extract questions for ${examId}`);
  }
  return response.json();
}

// 14. Fetch all questions for review
export async function getExamQuestions(examId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/questions`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch questions list for ${examId}`);
  }
  return response.json();
}

// 15. Update an individual question
export async function updateExamQuestion(
  examId: string,
  questionId: string,
  payload: any
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/questions/${questionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update question ${questionId}`);
  }
  return response.json();
}

// 16. Fetch all curriculum topics
export async function getTopics(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/topics`);
  if (!response.ok) {
    throw new Error("Failed to fetch topics list");
  }
  return response.json();
}

// 17. Extract solutions from a local PDF file
export async function extractExamSolutions(examId: string, solutionFilePath: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/extract-solutions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ solution_file_path: solutionFilePath })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to extract solutions for ${examId}`);
  }
  return response.json();
}

// 18. Fetch all answers and proposals for an exam
export async function getExamAnswers(examId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/answers`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch answers list for ${examId}`);
  }
  return response.json();
}

// 19. Update expected answer / review status for an individual question
export async function updateExamQuestionAnswer(
  examId: string,
  questionId: string,
  payload: {
    expected_answer?: string;
    proposed_expected_answer?: string;
    answer_status?: string;
  }
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/questions/${questionId}/answer`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update answer for question ${questionId}`);
  }
  return response.json();
}

export interface CheckAnswerResponse {
  question_id: string;
  status: "correct" | "incorrect" | "partial" | "manual_check_required";
  friendly_message: string;
  expected_answer_available: boolean;
  correct_answer_display: string | null;
  mistake_type: string | null;
  needs_visual_review: boolean;
  can_retry: boolean;
}

// 20. Check answer immediately in active diagnostic session
export async function checkDiagnosticAnswer(
  sessionId: string,
  questionId: string,
  studentAnswer: string
): Promise<CheckAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnostic/check-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
      student_answer: studentAnswer,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to check diagnostic answer");
  }
  return response.json();
}

export interface ZipItem {
  internal_path: string;
  detected_subject: string;
  file_role: "exam" | "correction" | "unknown";
  region: string;
  year: number;
  text_density: "selectable" | "scanned_or_low_text";
  paired_with: string | null;
  warnings: string[];
}

export interface ZipPair {
  exam_pdf: string;
  solution_pdf: string;
  subject: string;
  confidence: "high" | "medium";
}

export interface ZipPackageAnalysis {
  zip_filename: string;
  pdf_count: number;
  subjects_detected: string[];
  items: ZipItem[];
  pairs: ZipPair[];
  warnings: string[];
  package_id?: string;
  exams_imported?: number;
  duplicates_skipped?: number;
  scanned_manual_review_needed?: number;
  errors?: number;
  imported_exam_ids?: string[];
}

// 21. Analyze local ZIP package
export async function analyzeZipExamPackage(zipPath: string): Promise<ZipPackageAnalysis> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/analyze-zip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ zip_path: zipPath })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze ZIP package");
  }
  return response.json();
}

// 22. Generate PDF Page Previews
export async function generateExamPreviews(examId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/generate-previews`, {
    method: "POST"
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to generate previews for ${examId}`);
  }
  return response.json();
}

// 23. Get PDF Page Previews list
export async function getExamPreviews(examId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/previews`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch previews for ${examId}`);
  }
  return response.json();
}
// 24. Run OCR for Scanned PDFs
export async function runExamOcr(examId: string, pages: string | number[] = "all"): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/exam-bank/${examId}/run-ocr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pages })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to run OCR for ${examId}`);
  }
  return response.json();
}
