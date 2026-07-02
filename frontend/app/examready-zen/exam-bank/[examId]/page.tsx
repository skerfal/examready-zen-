"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  getExamBankExam,
  reviewExam,
  extractExamQuestions,
  getExamQuestions,
  updateExamQuestion,
  getTopics,
  extractExamSolutions,
  getExamAnswers,
  updateExamQuestionAnswer,
  generateExamPreviews,
  getExamPreviews,
  runExamOcr
} from "@/lib/examreadyZenApi";

interface ExamDetail {
  exam_id: string;
  metadata: {
    region: string;
    year: number;
    subject: string;
    grade: string;
    imported_at?: string;
    updated_at?: string;
    review_notes?: string;
    reviewed_by?: string;
  };
  source_file: string;
  questions: any[];
  topics: string[];
  status: string;
  needs_manual_verification: boolean;
  extraction_warnings: string[];
  package_metadata?: {
    package_id: string;
    zip_filename: string;
    internal_pdf_path: string;
    paired_solution_internal_path: string;
    paired_solution_file_path: string;
    package_warnings: string[];
  } | null;
  extraction_quality_summary?: {
    total_text_length: number;
    page_text_length: Record<string, number>;
    question_blocks_detected: number;
    average_question_length: number;
    suspected_scanned_pdf: boolean;
    suspected_layout_issue: boolean;
    extraction_confidence: string;
    extraction_warnings: string[];
  } | null;
  ocr_summary?: any;
}

export default function ExamReviewPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.examId;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exam, setExam] = useState<ExamDetail | null>(null);

  // Form states
  const [status, setStatus] = useState("needs_manual_review");
  const [reviewNotes, setReviewNotes] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New question/extraction/topics states
  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [extractLoading, setExtractLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  
  // Solution / Answer key states
  const [solutionPath, setSolutionPath] = useState("");
  const [extractSolLoading, setExtractSolLoading] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);

  // Preview states
  const [previews, setPreviews] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [editForm, setEditForm] = useState<any>({
    question_text: "",
    topic_id: "",
    answer_type: "",
    difficulty: "",
    expected_answer: "",
    proposed_expected_answer: "",
    requires_visual_support: false,
    requires_image_upload: false,
    status: "",
    answer_status: "",
    answer_matching_confidence: ""
  });

  const fetchExamDetail = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getExamBankExam(examId);
      setExam(data);
      setStatus(data.status);
      setReviewNotes(data.metadata.review_notes || "");
      
      const qs = await getExamQuestions(examId);
      setQuestions(qs);

      const ans = await getExamAnswers(examId);
      setAnswers(ans);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Impossible de charger les détails de l'examen.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviews = async () => {
    try {
      const plist = await getExamPreviews(examId);
      setPreviews(plist);
    } catch (err) {
      console.error("No previews found or error:", err);
    }
  };

  useEffect(() => {
    fetchExamDetail();
    fetchPreviews();
    
    // Fetch all curriculum topics once on mount
    getTopics()
      .then((data) => setTopics(data))
      .catch((err) => console.error("Error loading curriculum topics:", err));
  }, [examId]);

  const handleExtractQuestions = async () => {
    setExtractLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await extractExamQuestions(examId);
      setSuccessMsg(`Extraction réussie : ${res.questions_detected} questions détectées.`);
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'extraction des questions.");
    } finally {
      setExtractLoading(false);
    }
  };

  const handleGeneratePreviews = async () => {
    setPreviewLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await generateExamPreviews(examId);
      setSuccessMsg(`Aperçus générés avec succès : ${res.pages_rendered} pages rendues.`);
      await fetchPreviews();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de la génération des aperçus PDF.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRunOcr = async () => {
    setOcrLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await runExamOcr(examId, "all");
      if (res.ocr_status === "ocr_engine_unavailable") {
        setErrorMsg(`Moteur OCR non disponible : ${res.warnings[0] || "pytesseract/Tesseract n'est pas installé."}`);
      } else {
        setSuccessMsg(`OCR exécuté avec succès. ${res.pages_processed.length} pages traitées.`);
      }
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'exécution de l'OCR.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleApproveQuestion = async (qId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateExamQuestion(examId, qId, { status: "approved" });
      setSuccessMsg(`La question ${qId} a été approuvée.`);
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'approbation de la question.");
    }
  };

  const handleRejectQuestion = async (qId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateExamQuestion(examId, qId, { status: "rejected" });
      setSuccessMsg(`La question ${qId} a été rejetée.`);
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors du rejet de la question.");
    }
  };

  const startEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setEditForm({
      question_text: q.question_text,
      topic_id: q.topic_id,
      answer_type: q.answer_type,
      difficulty: q.difficulty,
      expected_answer: q.expected_answer || "",
      proposed_expected_answer: q.proposed_expected_answer || "",
      requires_visual_support: !!q.requires_visual_support,
      requires_image_upload: !!q.requires_image_upload,
      status: q.status,
      answer_status: q.answer_status || "missing",
      answer_matching_confidence: q.answer_matching_confidence || "needs_manual_answer_review"
    });
  };

  const handleSaveQuestionEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateExamQuestion(examId, editingQuestion.question_id, editForm);
      setEditingQuestion(null);
      setSuccessMsg(`La question ${editingQuestion.question_id} a été mise à jour avec succès.`);
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de la modification de la question.");
    }
  };

  const handleExtractSolutions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionPath) {
      setErrorMsg("Veuillez saisir le chemin local du fichier de correction.");
      return;
    }
    setExtractSolLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await extractExamSolutions(examId, solutionPath);
      if (res.status === "scanned_solution_needs_ocr") {
        setErrorMsg("Le document de correction semble être un scan (OCR requis).");
      } else {
        setSuccessMsg(`Extraction des corrections réussie : ${res.extracted_blocks_count} réponses extraites.`);
        await fetchExamDetail();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'extraction des corrections.");
    } finally {
      setExtractSolLoading(false);
    }
  };

  const handleExtractPairedSolution = async () => {
    if (!exam?.package_metadata?.paired_solution_file_path) return;
    setExtractSolLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await extractExamSolutions(examId, exam.package_metadata.paired_solution_file_path);
      if (res.status === "scanned_solution_needs_ocr") {
        setErrorMsg("Le document de correction détecté semble être un scan (OCR requis).");
      } else {
        setSuccessMsg(`Extraction des corrections réussie : ${res.extracted_blocks_count} réponses extraites de la correction détectée !`);
        await fetchExamDetail();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'extraction de la correction détectée.");
    } finally {
      setExtractSolLoading(false);
    }
  };

  const handleApproveAnswer = async (qId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateExamQuestionAnswer(examId, qId, { answer_status: "approved" });
      setSuccessMsg(`La réponse de la question ${qId} a été approuvée.`);
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'approbation de la réponse.");
    }
  };

  const handleRejectAnswer = async (qId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateExamQuestionAnswer(examId, qId, { answer_status: "rejected" });
      setSuccessMsg(`La réponse de la question ${qId} a été rejetée.`);
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors du rejet de la réponse.");
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await reviewExam(examId, {
        status,
        review_notes: reviewNotes,
        reviewed_by: "local_admin",
      });
      if (res.warning === "ready_with_missing_answers_warning") {
        setSuccessMsg("La révision a été enregistrée avec succès, mais attention : certaines questions auto-correctibles n'ont pas de réponse attendue approuvée.");
      } else {
        setSuccessMsg("La révision a été enregistrée avec succès !");
      }
      await fetchExamDetail();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'enregistrement de la révision.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper py-10 px-4 md:px-8 max-w-5xl mx-auto font-sans text-ink">
      <header className="mb-8">
        <Link
          href="/examready-zen/exam-bank"
          className="text-xs font-bold text-blue hover:text-blue/80 flex items-center gap-1.5 mb-3 transition-colors"
        >
          ⬅️ Retour à la banque d'examens
        </Link>
        <h1 className="text-3xl font-extrabold font-display text-accent tracking-tight mb-2">
          Révision de l’examen
        </h1>
        <p className="text-sm font-mono text-ink-2 bg-paper-2 px-3 py-1.5 rounded-lg inline-block border border-paper-3">
          ID: {examId}
        </p>
      </header>

      {/* Safety warnings */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-semibold mb-6 flex items-center gap-2 shadow-sm">
        <span>⚠️</span>
        <span><strong>Règle de sécurité :</strong> Un examen importé doit être validé et marqué comme <em>"Ready"</em> avant d’être utilisé dans le diagnostic.</span>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm font-semibold mb-6 flex items-start gap-2 shadow-sm">
          <span className="text-base">⚠️</span>
          <div>
            <p className="font-bold">Erreur rencontrée</p>
            <p className="font-medium text-xs text-red-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm font-semibold mb-6 flex items-center gap-2 shadow-sm">
          <span className="text-base">✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {loading && !exam ? (
        <div className="text-center py-12 text-sm font-semibold text-ink-2 flex items-center justify-center gap-2">
          <span className="animate-spin text-xl">⏳</span> Chargement des détails...
        </div>
      ) : (
        exam && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Metadata & Questions */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* 1. Exam Info Card */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide border-b border-paper-3 pb-2.5">
                  📁 Informations d'ingestion
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                  <div>
                    <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[10px]">Région</span>
                    <span className="font-bold">{exam.metadata.region}</span>
                  </div>
                  <div>
                    <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[10px]">Année</span>
                    <span className="font-bold">{exam.metadata.year || "Inconnue"}</span>
                  </div>
                  <div>
                    <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[10px]">Matière</span>
                    <span className="font-bold capitalize">{exam.metadata.subject}</span>
                  </div>
                  <div>
                    <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[10px]">Niveau</span>
                    <span className="font-bold">{exam.metadata.grade}</span>
                  </div>
                  <div className="col-span-2 border-t border-paper-3 pt-3">
                    <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[10px]">Fichier Source</span>
                    <span className="font-mono text-xs font-bold text-ink-2">{exam.source_file}</span>
                  </div>
                </div>
              </section>

              {/* Qualité d'extraction Card */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide border-b border-paper-3 pb-2.5 flex justify-between items-center">
                  <span>📊 Qualité d’extraction</span>
                  {exam.extraction_quality_summary ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      exam.extraction_quality_summary.extraction_confidence === 'high' ? 'bg-emerald-100 text-emerald-800' :
                      exam.extraction_quality_summary.extraction_confidence === 'medium' ? 'bg-sky-100 text-sky-800' :
                      exam.extraction_quality_summary.extraction_confidence === 'low' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      Confiance : {exam.extraction_quality_summary.extraction_confidence}
                    </span>
                  ) : (
                    <span className="text-[10px] text-ink-3 italic">Non disponible</span>
                  )}
                </h3>

                {exam.extraction_quality_summary ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs md:text-sm">
                      <div>
                        <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[9px]">Longueur Totale du Texte</span>
                        <span className="font-bold">{exam.extraction_quality_summary.total_text_length} caractères</span>
                      </div>
                      <div>
                        <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[9px]">Questions Détectées</span>
                        <span className="font-bold">{exam.extraction_quality_summary.question_blocks_detected}</span>
                      </div>
                      <div>
                        <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[9px]">Longueur Moyenne</span>
                        <span className="font-bold">{Math.round(exam.extraction_quality_summary.average_question_length)} caractères</span>
                      </div>
                      <div>
                        <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[9px]">Alerte Scan PDF</span>
                        <span className="font-bold">{exam.extraction_quality_summary.suspected_scanned_pdf ? "⚠️ Oui (Scan)" : "✅ Non"}</span>
                      </div>
                    </div>

                    {exam.extraction_quality_summary.extraction_warnings && exam.extraction_quality_summary.extraction_warnings.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-[11px] flex flex-col gap-1">
                        <span className="font-bold uppercase tracking-wider text-[8px] text-amber-800">Avertissements d'Extraction</span>
                        <ul className="list-disc pl-4 flex flex-col gap-0.5">
                          {exam.extraction_quality_summary.extraction_warnings.map((w: string, idx: number) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-ink-2 italic">
                    Lancez l'extraction pour calculer la qualité et les alertes.
                  </p>
                )}

                <div className="border-t border-paper-3 pt-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-2">Aperçus des pages PDF</span>
                    <span className="text-xs text-ink-2 font-bold">
                      {previews.length > 0 ? `✅ ${previews.length} page(s) générée(s)` : "Aperçus non générés"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePreviews}
                    disabled={previewLoading}
                    className="bg-blue hover:bg-blue-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>🖼️</span> {previewLoading ? "Génération..." : "Générer les aperçus PDF"}
                  </button>
                </div>
              </section>

              {/* ZIP Package Metadata Box */}
              {exam.package_metadata && (
                <section className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-sm flex flex-col gap-4 font-sans">
                  <h3 className="text-base font-extrabold font-display text-white uppercase tracking-wide border-b border-slate-800 pb-2.5 flex items-center gap-2">
                    <span>📦</span> Package ZIP Associé
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase tracking-wide text-[9px]">Archive ZIP d'origine</span>
                      <span className="font-bold text-slate-200">{exam.package_metadata.zip_filename}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase tracking-wide text-[9px]">ID du Package</span>
                      <span className="font-mono font-bold text-slate-300 truncate block">{exam.package_metadata.package_id}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-semibold block uppercase tracking-wide text-[9px]">Chemin interne du document</span>
                      <span className="font-mono text-slate-300 text-xs block">{exam.package_metadata.internal_pdf_path}</span>
                    </div>
                    {exam.package_metadata.paired_solution_internal_path && (
                      <div className="col-span-2 border-t border-slate-800 pt-3 flex flex-col gap-2">
                        <div>
                          <span className="text-emerald-400 font-semibold block uppercase tracking-wide text-[9px]">Correction Détectée Associée</span>
                          <span className="font-mono text-emerald-300 text-xs block truncate">{exam.package_metadata.paired_solution_internal_path}</span>
                        </div>
                        {exam.package_metadata.paired_solution_file_path && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={handleExtractPairedSolution}
                              disabled={extractSolLoading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <span>🔑</span> {extractSolLoading ? "Extraction..." : "Extraire la correction détectée"}
                            </button>
                            <p className="text-[10px] text-slate-400 mt-1.5 italic">
                              Une fois extraite, vous devrez approuver manuellement chaque réponse ci-dessous.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {exam.package_metadata.package_warnings && exam.package_metadata.package_warnings.length > 0 && (
                    <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 text-[11px] flex flex-col gap-1 text-red-300">
                      <span className="font-bold uppercase tracking-wider text-[8px] text-red-400">⚠️ Alertes du Package</span>
                      <ul className="list-disc pl-4 flex flex-col gap-0.5 opacity-90">
                        {exam.package_metadata.package_warnings.map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* 2. Extraction Warnings */}
              {exam.extraction_warnings.length > 0 && (
                <section className="bg-rose-50 border border-rose-200 text-rose-950 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
                  <h3 className="text-sm font-extrabold font-display uppercase tracking-wide text-rose-800 flex items-center gap-1.5">
                    <span>🚨</span> Alertes d'extraction ({exam.extraction_warnings.length})
                  </h3>
                  <ul className="list-disc pl-5 text-xs font-medium flex flex-col gap-1.5">
                    {exam.extraction_warnings.map((warn, i) => (
                      <li key={i} className="leading-relaxed">{warn}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 3. Topics Coverage */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-3">
                <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide border-b border-paper-3 pb-2.5">
                  🎯 Notions clés associées ({exam.topics.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {exam.topics.map((t) => (
                    <span key={t} className="bg-paper-2 border border-paper-3 font-mono text-[10px] px-2.5 py-1 rounded-lg text-ink font-bold">
                      {t.replace(/_/g, " ").toUpperCase()}
                    </span>
                  ))}
                  {exam.topics.length === 0 && (
                    <span className="text-xs text-ink-3 italic">Aucune notion identifiée dans cet examen.</span>
                  )}
                </div>
              </section>

              {/* 4. Extraction Controls Card */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide border-b border-paper-3 pb-2.5 flex justify-between items-center">
                  <span>🤖 Extraction & Analyse Automatique</span>
                  <span className="text-[10px] text-ink-3">OCR Local (Étape 1)</span>
                </h3>
                <p className="text-xs text-ink-2 leading-relaxed">
                  Découpez le texte du document PDF en questions structurées et lancez la classification automatique sur le programme de 6AEP.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleExtractQuestions}
                    disabled={extractLoading}
                    className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 rounded-xl cursor-pointer shadow-sm text-xs tracking-wider transition-all disabled:opacity-50 shrink-0"
                  >
                    {extractLoading ? "Extraction..." : "Extraire les questions"}
                  </button>
                  <button
                    onClick={fetchExamDetail}
                    className="bg-paper-2 hover:bg-paper-3 border border-paper-3 text-ink font-bold px-4 py-2 rounded-xl cursor-pointer text-xs tracking-wider transition-all"
                  >
                    Recharger les questions
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl p-4 text-xs font-semibold shadow-sm flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>“Les questions extraites doivent être vérifiées avant utilisation par les élèves.”</span>
                </div>
              </section>

              {/* Reconnaissance OCR Card */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide border-b border-paper-3 pb-2.5 flex justify-between items-center">
                  <span>📷 Reconnaissance OCR</span>
                  {exam.ocr_summary ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      exam.ocr_summary.ocr_status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                      exam.ocr_summary.ocr_status === 'ocr_engine_unavailable' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      Statut : {exam.ocr_summary.ocr_status}
                    </span>
                  ) : (
                    <span className="text-[10px] text-ink-3 italic">Non exécuté</span>
                  )}
                </h3>

                <div className="text-xs md:text-sm flex flex-col gap-3">
                  <p className="text-xs text-ink-2 leading-relaxed">
                    L’OCR aide à lire les scans, mais le résultat doit être vérifié.
                  </p>
                  
                  {exam.ocr_summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-paper-2 p-4 rounded-2xl border border-paper-3 text-xs">
                      <div>
                        <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[9px]">Moteur OCR</span>
                        <span className="font-bold">{exam.ocr_summary.ocr_engine}</span>
                      </div>
                      <div>
                        <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[9px]">Pages Traitées</span>
                        <span className="font-bold">
                          {exam.ocr_summary.pages_processed && exam.ocr_summary.pages_processed.length > 0
                            ? exam.ocr_summary.pages_processed.join(", ")
                            : "Aucune"}
                        </span>
                      </div>
                      {exam.ocr_summary.draft_questions_detected > 0 && (
                        <div className="col-span-1 md:col-span-2 border-t border-paper-3 pt-2 mt-1">
                          <span className="text-ink-2 font-semibold block uppercase tracking-wide text-[9px]">Questions Détectées dans le Draft</span>
                          <span className="font-bold text-accent">{exam.ocr_summary.draft_questions_detected} question(s)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {exam.ocr_summary?.warnings && exam.ocr_summary.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-[11px] flex flex-col gap-1">
                      <span className="font-bold uppercase tracking-wider text-[8px] text-amber-800">Avertissements OCR</span>
                      <ul className="list-disc pl-4 flex flex-col gap-0.5">
                        {exam.ocr_summary.warnings.map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="border-t border-paper-3 pt-4 flex items-center justify-between gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={handleRunOcr}
                    disabled={ocrLoading}
                    className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>📷</span> {ocrLoading ? "Exécution de l'OCR..." : "Lancer l’OCR"}
                  </button>
                  <span className="text-[10px] text-ink-3 italic">OCR Local Uniquement</span>
                </div>
              </section>

              {/* 5. Correction / Réponses attendues Section */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide border-b border-paper-3 pb-2.5 flex justify-between items-center">
                  <span>🔑 Correction & Réponses Attendues</span>
                  <span className="text-[10px] text-ink-3">Corrigé PDF</span>
                </h3>
                <p className="text-xs text-ink-2 leading-relaxed">
                  Fournissez le chemin d'accès local du fichier PDF de correction pour extraire les réponses attendues et les faire correspondre automatiquement aux questions.
                </p>
                <form onSubmit={handleExtractSolutions} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                      Chemin du fichier PDF de correction
                    </label>
                    <input
                      type="text"
                      value={solutionPath}
                      onChange={(e) => setSolutionPath(e.target.value)}
                      placeholder="Ex: C:\Users\lenovo\Desktop\correction_ifrane_2023.pdf"
                      className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={extractSolLoading}
                      className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 rounded-xl cursor-pointer shadow-sm text-xs tracking-wider transition-all disabled:opacity-50"
                    >
                      {extractSolLoading ? "Extraction..." : "Extraire les corrections"}
                    </button>
                  </div>
                </form>
                <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl p-4 text-xs font-semibold shadow-sm flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>“Les réponses proposées doivent être vérifiées avant d’être utilisées pour corriger les élèves.”</span>
                </div>
              </section>

              {/* 6. Question Curation / Review Grid */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide border-b border-paper-3 pb-2.5">
                  📋 Validation et Curation des Questions ({questions.length})
                </h3>
                <div className="flex flex-col gap-4">
                  {questions.map((q) => (
                    <div key={q.question_id} className={`border p-4 rounded-2xl transition-all ${
                      q.status === "approved" ? "border-emerald-200 bg-emerald-50/10" :
                      q.status === "rejected" ? "border-rose-200 bg-rose-50/10 opacity-70" :
                      "border-paper-3 bg-white"
                    }`}>
                      <div className="flex justify-between items-start gap-4 flex-wrap mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-accent-dark text-xs">{q.question_id}</span>
                          <span className="text-[10px] text-ink-3">Page {q.source_page}</span>
                          {q.topic_confidence === "high" && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">Confiance Haute</span>
                          )}
                          {q.topic_confidence === "medium" && (
                            <span className="bg-sky-100 text-sky-800 text-[9px] px-2 py-0.5 rounded-full font-bold">Confiance Moyenne</span>
                          )}
                          {q.topic_confidence === "low" && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold">Confiance Faible</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            q.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                            q.status === "rejected" ? "bg-rose-100 text-rose-800" :
                            q.status === "needs_review" ? "bg-amber-100 text-amber-800" :
                            "bg-paper-3 text-ink-2"
                          }`}>
                            {q.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm font-bold text-ink leading-relaxed mb-3">
                        {q.question_text}
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-ink-2 font-semibold mb-3.5 bg-paper-2 p-2.5 rounded-xl border border-paper-3/40">
                        <div>
                          <span>Notion : </span>
                          <strong className="text-ink font-mono text-[9px] truncate block">{q.topic_id}</strong>
                        </div>
                        <div>
                          <span>Type : </span>
                          <strong className="text-ink block truncate">{q.answer_type}</strong>
                        </div>
                        <div>
                          <span>Difficulté : </span>
                          <strong className="text-ink capitalize block truncate">{q.difficulty}</strong>
                        </div>
                        <div>
                          <span>Réponse : </span>
                          <strong className="text-emerald-700 font-mono block truncate">{q.expected_answer || "-"}</strong>
                        </div>
                        <div className="col-span-2">
                          <span>Visuel : </span>
                          <strong className="text-ink">{q.requires_visual_support ? "✅ Oui" : "❌ Non"}</strong>
                        </div>
                        <div className="col-span-2">
                          <span>Photo Élève : </span>
                          <strong className="text-ink">{q.requires_image_upload ? "📷 Requis" : "❌ Non"}</strong>
                        </div>
                      </div>

                      {/* Answer Matching Details Box */}
                      {(q.proposed_expected_answer || q.answer_status) && (
                        <div className="mt-3 bg-paper-3/20 border border-paper-3/40 rounded-xl p-3 text-[11px] flex flex-col gap-2">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="font-bold text-ink uppercase tracking-wider text-[9px] text-accent-dark">
                              🔑 Correction / Réponse attendue
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              q.answer_status === "approved" ? "bg-emerald-100 text-emerald-800" :
                              q.answer_status === "rejected" ? "bg-rose-100 text-rose-800" :
                              q.answer_status === "proposed" ? "bg-sky-100 text-sky-800" :
                              "bg-paper-3 text-ink-2"
                            }`}>
                              Réponse : {q.answer_status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-ink-2 font-semibold text-[10px] block">PROPOSITION EXTRAITE</span>
                              <strong className="text-sky-800 font-mono block">{q.proposed_expected_answer || "Aucune"}</strong>
                            </div>
                            <div>
                              <span className="text-ink-2 font-semibold text-[10px] block">CONFIANCE & RAISON</span>
                              <span className="text-ink font-semibold block text-[10px] font-mono leading-tight">
                                [{q.answer_matching_confidence}] {q.answer_matching_reason}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-paper-3/30">
                            {q.answer_status !== "approved" && q.proposed_expected_answer && (
                              <button
                                onClick={() => handleApproveAnswer(q.question_id)}
                                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer"
                              >
                                Approuver la réponse ✅
                              </button>
                            )}
                            {q.answer_status !== "rejected" && q.proposed_expected_answer && (
                              <button
                                onClick={() => handleRejectAnswer(q.question_id)}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer"
                              >
                                Rejeter la réponse ❌
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end mt-4">
                        <button
                          onClick={() => startEditQuestion(q)}
                          className="bg-blue hover:bg-blue-dark text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Voir la page originale 📄
                        </button>
                        <button
                          onClick={() => startEditQuestion(q)}
                          className="bg-paper-2 hover:bg-paper-3 border border-paper-3 text-ink font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Modifier ⚙️
                        </button>
                        {q.status !== "approved" && (
                          <button
                            onClick={() => handleApproveQuestion(q.question_id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer"
                          >
                            Approuver ✅
                          </button>
                        )}
                        {q.status !== "rejected" && (
                          <button
                            onClick={() => handleRejectQuestion(q.question_id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer"
                          >
                            Rejeter ❌
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="text-center py-10 text-xs text-ink-3 italic bg-paper-2 rounded-2xl border border-paper-3 border-dashed">
                      Aucune question extraite. Cliquez sur "Extraire les questions" ci-dessus pour lancer l'analyse.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Review Form */}
            <div className="flex flex-col gap-6">
              {/* Review Workspace Card */}
              <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-5 sticky top-6">
                <div>
                  <h3 className="text-base font-extrabold font-display text-ink uppercase tracking-wide mb-1">
                    🖋️ Espace Curation Admin
                  </h3>
                  <p className="text-[11px] text-ink-2">
                    Cure les erreurs, ajoute des remarques, puis approuve ou rejette cet examen.
                  </p>
                </div>

                <form onSubmit={handleSaveReview} className="flex flex-col gap-4 text-xs md:text-sm">
                  {/* Status Badge display */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                      Statut d'approbation
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors"
                    >
                      <option value="imported_draft">imported_draft (Brouillon)</option>
                      <option value="ready">ready (Approuvé pour les élèves ✅)</option>
                      <option value="needs_manual_review">needs_manual_review (Revue requise)</option>
                      <option value="scanned_pdf_needs_review">scanned_pdf_needs_review (Scan PDF à corriger)</option>
                      <option value="missing_metadata">missing_metadata (Métadonnées manquantes)</option>
                      <option value="rejected">rejected (Rejeté / Masqué ❌)</option>
                    </select>
                  </div>

                  {/* Textarea for review notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                      Notes de curation / Historique
                    </label>
                    <textarea
                      rows={6}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Indiquez ici les corrections apportées ou les raisons du rejet..."
                      className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl p-3 text-xs outline-none transition-colors font-sans leading-relaxed resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-sm text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {saveLoading ? (
                      <>
                        <span className="animate-spin text-sm">⏳</span> Enregistrement...
                      </>
                    ) : (
                      <>
                        <span>💾</span> Enregistrer la révision
                      </>
                    )}
                  </button>
                </form>

                {/* History stamp */}
                {(exam.metadata.updated_at || exam.metadata.imported_at) && (
                  <div className="border-t border-paper-3 pt-3.5 flex flex-col gap-1 text-[9px] text-ink-3 font-semibold font-mono">
                    {exam.metadata.reviewed_by && (
                      <span>Réviseur : {exam.metadata.reviewed_by}</span>
                    )}
                    {exam.metadata.updated_at && (
                      <span>Modifié : {new Date(exam.metadata.updated_at).toLocaleString()}</span>
                    )}
                    {exam.metadata.imported_at && (
                      <span>Importé : {new Date(exam.metadata.imported_at).toLocaleString()}</span>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )
      )}

      {/* Editing Dialog Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl border border-paper-3 p-6 max-w-5xl w-full shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-paper-3 pb-3">
              <div>
                <h3 className="text-lg font-extrabold font-display text-ink flex items-center gap-1.5">
                  <span>⚙️</span> Curation de Question & Visualisation Side-by-Side
                </h3>
                <p className="text-xs text-ink-2 font-mono mt-0.5">{editingQuestion.question_id}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingQuestion(null)}
                className="text-ink-3 hover:text-ink text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Warning block */}
            <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>L’extraction automatique doit être comparée à la page originale avant validation.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Original PDF Page Preview */}
              <div className="flex flex-col gap-3 bg-paper-2 border border-paper-3 rounded-2xl p-4 sticky top-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">Page originale : {editingQuestion.source_page || "Inconnue"}</span>
                  {editingQuestion.source_page && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_EXAMREADY_API_URL || "http://127.0.0.1:8030"}/exam-bank/${examId}/previews/${editingQuestion.source_page}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue hover:underline font-bold"
                    >
                      Ouvrir dans un nouvel onglet ↗️
                    </a>
                  )}
                </div>

                <div className="border border-paper-3 bg-white rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center relative shadow-inner min-h-[300px]">
                  {editingQuestion.source_page && previews.some(p => p.page_number === editingQuestion.source_page) ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_EXAMREADY_API_URL || "http://127.0.0.1:8030"}/exam-bank/${examId}/previews/${editingQuestion.source_page}`}
                      alt={`Page original PDF ${editingQuestion.source_page}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 flex flex-col gap-2 items-center">
                      <span className="text-3xl">🖼️</span>
                      <span className="text-xs font-semibold text-ink-3">Aperçu non généré pour cette page.</span>
                      <button
                        type="button"
                        onClick={handleGeneratePreviews}
                        disabled={previewLoading}
                        className="bg-blue hover:bg-blue-dark text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer mt-1 disabled:opacity-50"
                      >
                        {previewLoading ? "Génération..." : "Générer les aperçus"}
                      </button>
                    </div>
                  )}
                </div>

                {/* OCR Draft Text box */}
                <div className="mt-4 border-t border-paper-3 pt-4 flex flex-col gap-2">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                    <span>📝</span> Texte OCR brut (Draft)
                  </span>
                  
                  {exam?.ocr_summary?.draft_text_by_page?.[editingQuestion.source_page?.toString()] ? (
                    <div className="flex flex-col gap-2">
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[10px] font-semibold">
                        ⚠️ Le texte OCR peut contenir des erreurs. Il doit être corrigé avant validation.
                      </div>
                      <textarea
                        readOnly
                        rows={6}
                        value={exam?.ocr_summary?.draft_text_by_page?.[editingQuestion.source_page.toString()] || ""}
                        className="w-full bg-paper-3/40 border border-paper-3 rounded-xl p-2.5 text-xs outline-none font-mono resize-none leading-relaxed text-ink-2"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] text-ink-3 italic">
                      Aucun texte OCR disponible pour cette page. Lancez l'OCR sur l'examen si nécessaire.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Question Edit Form */}
              <form onSubmit={handleSaveQuestionEdit} className="flex flex-col gap-4 text-xs md:text-sm">
                {/* Question Text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                    Texte de la question
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.question_text}
                    onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                    className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl p-2.5 text-xs outline-none transition-colors leading-relaxed resize-none font-sans"
                    required
                  />
                </div>

                {/* Topic Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                    Notion clé (Programme 6AEP)
                  </label>
                  <select
                    value={editForm.topic_id}
                    onChange={(e) => setEditForm({ ...editForm, topic_id: e.target.value })}
                    className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors"
                  >
                    <option value="needs_manual_classification">needs_manual_classification (Non classifié)</option>
                    {topics.map((t) => (
                      <option key={t.topic_id} value={t.topic_id}>
                        {t.topic_id} - {t.student_friendly_title || t.display_name_fr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Answer Type & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                      Type de réponse
                    </label>
                    <select
                      value={editForm.answer_type}
                      onChange={(e) => setEditForm({ ...editForm, answer_type: e.target.value })}
                      className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors"
                    >
                      <option value="text">Texte</option>
                      <option value="numeric">Numérique (Calcul)</option>
                      <option value="drawing_photo">Dessin / Photo</option>
                      <option value="chart_interpretation">Interprétation de graphique</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                      Difficulté
                    </label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                      className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors"
                    >
                      <option value="easy">Facile</option>
                      <option value="medium">Moyen</option>
                      <option value="hard">Difficile</option>
                    </select>
                  </div>
                </div>

                {/* Expected Answer */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                    Réponse attendue (Corrigé)
                  </label>
                  <input
                    type="text"
                    value={editForm.expected_answer}
                    onChange={(e) => setEditForm({ ...editForm, expected_answer: e.target.value })}
                    placeholder="Ex: 5/24, 295, football, etc."
                    className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                  />
                </div>

                {/* Proposed Answer Key (Read Only) */}
                {editForm.proposed_expected_answer && (
                  <div className="flex flex-col gap-1.5 bg-paper-2 border border-paper-3/40 rounded-xl p-3">
                    <span className="text-[10px] font-extrabold text-ink uppercase tracking-wider text-accent-dark">
                      Proposition automatique de correction
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-800">{editForm.proposed_expected_answer}</span>
                    <span className="text-[9px] font-mono text-ink-3">
                      Confiance : {editForm.answer_matching_confidence}
                    </span>
                  </div>
                )}

                {/* Answer Status Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                    Statut de la correction
                  </label>
                  <select
                    value={editForm.answer_status}
                    onChange={(e) => setEditForm({ ...editForm, answer_status: e.target.value })}
                    className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors"
                  >
                    <option value="missing">missing (Manquante)</option>
                    <option value="proposed">proposed (Proposée par match)</option>
                    <option value="approved">approved (Approuvée ✅)</option>
                    <option value="rejected">rejected (Rejetée ❌)</option>
                    <option value="needs_manual_answer_review">needs_manual_answer_review (À réviser)</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col gap-2 pt-1 border-t border-paper-3/50">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editForm.requires_visual_support}
                      onChange={(e) => setEditForm({ ...editForm, requires_visual_support: e.target.checked })}
                      className="rounded border-paper-3 text-accent focus:ring-accent"
                    />
                    <span className="text-[11px] font-bold text-ink">Nécessite un support visuel (Graphique/Figure)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editForm.requires_image_upload}
                      onChange={(e) => setEditForm({ ...editForm, requires_image_upload: e.target.checked })}
                      className="rounded border-paper-3 text-accent focus:ring-accent"
                    />
                    <span className="text-[11px] font-bold text-ink">Nécessite que l'élève uploade son tracé (Photo)</span>
                  </label>
                </div>

                {/* Status Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-ink uppercase tracking-wider">
                    Statut d'approbation de la question
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors"
                  >
                    <option value="draft">Brouillon (draft)</option>
                    <option value="needs_review">À réviser (needs_review)</option>
                    <option value="approved">Approuvé (approved)</option>
                    <option value="rejected">Rejeté (rejected)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-2 border-t border-paper-3">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="bg-paper-2 hover:bg-paper-3 border border-paper-3 text-ink font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-dark text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
