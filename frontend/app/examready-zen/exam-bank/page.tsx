"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getExamBank,
  importLocalExamFolder,
  uploadExamFile,
  analyzeZipExamPackage,
  ExamBankResponse,
  ImportLocalResponse,
  ZipPackageAnalysis
} from "@/lib/examreadyZenApi";

export default function ExamBankDashboard() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bankData, setBankData] = useState<ExamBankResponse | null>(null);
  
  // Import form states
  const [importPath, setImportPath] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportLocalResponse | null>(null);

  // Upload form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportLocalResponse | null>(null);

  // ZIP Analysis states
  const [zipAnalysisPath, setZipAnalysisPath] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [zipAnalysisResult, setZipAnalysisResult] = useState<any | null>(null);

  // Search & Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterVerification, setFilterVerification] = useState("All");
  const [filterCorrection, setFilterCorrection] = useState("All");

  const fetchBankData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getExamBank();
      setBankData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Impossible de charger la banque d'examens. Assurez-vous que le backend local tourne sur le port 8030.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, []);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importPath.trim()) return;

    setImportLoading(true);
    setErrorMsg(null);
    setImportResult(null);
    setUploadResult(null);

    try {
      const res = await importLocalExamFolder(importPath);
      setImportResult(res);
      setImportPath("");
      await fetchBankData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'importation locale. Vérifiez le chemin spécifié.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadLoading(true);
    setErrorMsg(null);
    setImportResult(null);
    setUploadResult(null);
    setZipAnalysisResult(null);

    try {
      const res = await uploadExamFile(selectedFile);
      if (selectedFile.name.toLowerCase().endsWith(".zip")) {
        setZipAnalysisResult(res);
      } else {
        setUploadResult(res);
      }
      setSelectedFile(null);
      
      const fileInput = document.getElementById("examFile") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      await fetchBankData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'upload. Vérifiez le format (PDF/ZIP) et la taille (max 10Mo).");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleZipAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipAnalysisPath.trim()) return;

    setAnalysisLoading(true);
    setErrorMsg(null);
    setZipAnalysisResult(null);

    try {
      const res = await analyzeZipExamPackage(zipAnalysisPath);
      setZipAnalysisResult(res);
      setZipAnalysisPath("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'analyse du ZIP. Vérifiez le chemin spécifié.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Helper to determine exam priority
  const getExamPriority = (exam: any) => {
    if (
      exam.status === "scanned_pdf_needs_review" ||
      exam.status === "scanned_pdf_needs_manual_review"
    ) {
      return { level: 1, label: "P1: OCR requis 📷", className: "bg-rose-50 border-rose-200 text-rose-700" };
    }
    if (exam.status === "missing_metadata") {
      return { level: 2, label: "P2: Métadonnées 📝", className: "bg-orange-50 border-orange-200 text-orange-700" };
    }
    if (exam.questions_count === 0) {
      return { level: 3, label: "P3: Sans questions ❓", className: "bg-amber-50 border-amber-200 text-amber-700" };
    }
    if (!exam.has_solution) {
      return { level: 4, label: "P4: Sans corrigé ❌", className: "bg-blue-50 border-blue-200 text-blue-700" };
    }
    return { level: 5, label: "Prêt ✓", className: "bg-emerald-50 border-emerald-200 text-emerald-700" };
  };

  // Quick Action Filters
  const applyQuickFilter = (type: "to_verify" | "math" | "ready") => {
    setSearchQuery("");
    setFilterSubject("All");
    setFilterStatus("All");
    setFilterVerification("All");
    setFilterCorrection("All");
    
    if (type === "to_verify") {
      setFilterVerification("verify");
    } else if (type === "math") {
      setFilterSubject("math");
    } else if (type === "ready") {
      setFilterStatus("ready");
    }
  };

  const getCoverageBadge = (count: number) => {
    if (count === 0) {
      return (
        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-red-200">
          Aucune couverture (0)
        </span>
      );
    } else if (count === 1) {
      return (
        <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
          Couverture faible (1)
        </span>
      );
    } else if (count >= 2 && count <= 4) {
      return (
        <span className="bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-sky-200">
          Couverture moyenne ({count})
        </span>
      );
    } else {
      return (
        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
          Couverture forte ({count})
        </span>
      );
    }
  };

  // Compute coverage stats
  const totalTopics = bankData?.topic_coverage.length || 0;
  const coveredTopics = bankData?.topic_coverage.filter((t) => t.question_count > 0).length || 0;
  const weakTopics = bankData?.topic_coverage.filter((t) => t.question_count === 1).length || 0;
  const missingTopics = bankData?.topic_coverage.filter((t) => t.question_count === 0).length || 0;

  // Filter exams
  const filteredExams = bankData
    ? bankData.exams.filter((exam) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesId = exam.exam_id.toLowerCase().includes(query);
          const matchesRegion = exam.region.toLowerCase().includes(query);
          const matchesYear = exam.year ? String(exam.year).includes(query) : false;
          const matchesSubject = exam.subject.toLowerCase().includes(query);
          if (!matchesId && !matchesRegion && !matchesYear && !matchesSubject) {
            return false;
          }
        }
        
        if (filterSubject !== "All" && exam.subject !== filterSubject) {
          return false;
        }
        
        if (filterStatus !== "All" && exam.status !== filterStatus) {
          return false;
        }
        
        if (filterVerification !== "All") {
          const needsVerify = exam.needs_manual_verification;
          if (filterVerification === "verify" && !needsVerify) return false;
          if (filterVerification === "validated" && needsVerify) return false;
        }
        
        if (filterCorrection !== "All") {
          const hasSolution = exam.has_solution;
          if (filterCorrection === "with" && !hasSolution) return false;
          if (filterCorrection === "without" && hasSolution) return false;
        }
        
        return true;
      })
    : [];

  return (
    <main className="min-h-screen bg-paper py-10 px-4 md:px-8 max-w-6xl mx-auto font-sans text-ink">
      {/* Back button and title */}
      <header className="mb-8">
        <Link
          href="/examready-zen/math-diagnostic"
          className="text-xs font-bold text-blue hover:text-blue/80 flex items-center gap-1.5 mb-3 transition-colors"
        >
          ⬅️ Retour au Diagnostic
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-accent tracking-tight mb-2">
          Banque d’examens historiques
        </h1>
        <p className="text-sm text-ink-2 leading-relaxed max-w-2xl">
          Importe, vérifie et organise les examens régionaux pour alimenter le diagnostic intelligent.
        </p>
        <div className="w-16 h-1 bg-accent rounded-full mt-4" />
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-semibold mt-4 shadow-sm max-w-2xl flex items-center gap-2">
          <span>⚠️</span>
          <span><strong>Règle de sécurité :</strong> Un examen importé doit être validé et marqué comme <em>"Ready"</em> avant d’être utilisé dans le diagnostic.</span>
        </div>
      </header>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm font-semibold mb-6 flex items-start gap-2 shadow-sm">
          <span className="text-base">⚠️</span>
          <div>
            <p className="font-bold">Erreur rencontrée</p>
            <p className="font-medium text-xs text-red-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {loading && !bankData ? (
        <div className="text-center py-12 text-sm font-semibold text-ink-2 flex items-center justify-center gap-2">
          <span className="animate-spin text-xl">⏳</span> Chargement de la banque d'examens...
        </div>
      ) : (
        bankData && (
          <div className="flex flex-col gap-10">
            {/* 1. Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl border border-paper-3 p-5 shadow-sm flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-ink-2 uppercase tracking-wider">
                  Total Examens
                </span>
                <span className="text-3xl font-extrabold text-ink font-display">
                  {bankData.total_exams}
                </span>
                <span className="text-[10px] font-medium text-ink-2">
                  Actifs dans le diagnostic
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-paper-3 p-5 shadow-sm flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-ink-2 uppercase tracking-wider">
                  Total Questions
                </span>
                <span className="text-3xl font-extrabold text-ink font-display">
                  {bankData.total_questions}
                </span>
                <span className="text-[10px] font-medium text-ink-2">
                  Gradées dynamiquement
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-paper-3 p-5 shadow-sm flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-ink-2 uppercase tracking-wider">
                  Matières Ingestion
                </span>
                <span className="text-xl font-extrabold text-ink font-display capitalize truncate">
                  {bankData.subjects.join(", ") || "Aucune"}
                </span>
                <span className="text-[10px] font-medium text-ink-2">
                  Filtres de matières
                </span>
              </div>

              <div className={`rounded-2xl border p-5 shadow-sm flex flex-col gap-1 ${
                bankData.exams_needing_review > 0
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-white border-paper-3"
              }`}>
                <span className="text-[10px] font-extrabold text-ink-2 uppercase tracking-wider">
                  À Vérifier / Curater
                </span>
                <span className={`text-3xl font-extrabold font-display ${
                  bankData.exams_needing_review > 0 ? "text-amber-700" : "text-ink"
                }`}>
                  {bankData.exams_needing_review}
                </span>
                <span className="text-[10px] font-medium text-ink-2">
                  PDF scannés ou sans métadonnées
                </span>
              </div>

              {/* Topic Coverage Summary Card */}
              <div className="bg-white rounded-2xl border border-paper-3 p-5 shadow-sm flex flex-col gap-1.5 justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-ink-2 uppercase tracking-wider">
                    Couverture Notions
                  </span>
                  <div className="flex justify-between text-xs font-semibold mt-1">
                    <span className="text-emerald-700 font-bold">Couvertes: {coveredTopics}/{totalTopics}</span>
                    <span className="text-amber-700 font-bold">Faibles: {weakTopics}</span>
                  </div>
                  <div className="text-[10px] font-bold text-red-600 mt-0.5">
                    Manquantes: {missingTopics}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById("notions-coverage")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full text-center bg-blue/5 hover:bg-blue/10 text-blue font-bold text-[10px] py-1.5 rounded-lg border border-blue/15 transition-all mt-1 cursor-pointer"
                >
                  Couverture des notions ➡️
                </button>
              </div>
            </section>

            {/* 2. Ingestion Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card A: Folder Import */}
              <div className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-extrabold font-display text-ink mb-1 flex items-center gap-1.5">
                    <span>📂</span> Ingestion de dossier local
                  </h3>
                  <p className="text-[11px] text-ink-2">
                    Spécifie un chemin de dossier local absolu contenant des fichiers PDF/ZIP d'examens régionaux.
                  </p>
                </div>

                <form onSubmit={handleImportSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="importPath" className="text-[10px] font-bold text-ink uppercase tracking-wider">
                      Chemin absolu du dossier ou fichier
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="importPath"
                        required
                        value={importPath}
                        onChange={(e) => setImportPath(e.target.value)}
                        className="flex-1 bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs outline-none transition-colors font-mono"
                        placeholder="Ex: C:\Users\Nom\Documents\examens"
                      />
                      <button
                        type="submit"
                        disabled={importLoading || !importPath.trim()}
                        className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 text-xs tracking-wide shrink-0"
                      >
                        {importLoading ? "Ingestion..." : "Importer"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Card B: Direct File Upload */}
              <div className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-extrabold font-display text-ink mb-1 flex items-center gap-1.5">
                    <span>📤</span> Uploader un examen PDF/ZIP
                  </h3>
                  <p className="text-[11px] text-ink-2">
                    Choisis un fichier d'examen sur ton ordinateur (.pdf ou .zip, max 10 Mo) pour l'importer directement.
                  </p>
                </div>

                <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="examFile" className="text-[10px] font-bold text-ink uppercase tracking-wider">
                      Sélectionner le fichier d'examen
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="examFile"
                        required
                        accept=".pdf,.zip"
                        onChange={(e) => {
                           if (e.target.files && e.target.files.length > 0) {
                             setSelectedFile(e.target.files[0]);
                           }
                        }}
                        className="flex-1 bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-1.5 text-xs outline-none transition-colors file:bg-paper-3 file:border-0 file:text-[10px] file:font-bold file:px-2.5 file:py-1 file:rounded-lg file:cursor-pointer"
                      />
                      <button
                        type="submit"
                        disabled={uploadLoading || !selectedFile}
                        className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 text-xs tracking-wide shrink-0"
                      >
                        {uploadLoading ? "Upload..." : "Uploader"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Card C: ZIP Pre-Analysis */}
              <div className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-extrabold font-display text-ink mb-1 flex items-center gap-1.5">
                    <span>🔍</span> Analyser un ZIP local
                  </h3>
                  <p className="text-[11px] text-ink-2">
                    Spécifie un chemin de ZIP local pour l'analyser en tant que package d'examens (sujets, corrigés, densité).
                  </p>
                </div>

                <form onSubmit={handleZipAnalysisSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="zipAnalysisPath" className="text-[10px] font-bold text-ink uppercase tracking-wider">
                      Chemin absolu du fichier ZIP
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="zipAnalysisPath"
                        required
                        value={zipAnalysisPath}
                        onChange={(e) => setZipAnalysisPath(e.target.value)}
                        className="flex-1 bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-3 py-2 text-xs outline-none transition-colors font-mono"
                        placeholder="Ex: C:\Users\Nom\exams.zip"
                      />
                      <button
                        type="submit"
                        disabled={analysisLoading || !zipAnalysisPath.trim()}
                        className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 text-xs tracking-wide shrink-0"
                      >
                        {analysisLoading ? "Analyse..." : "Analyser"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </section>

            {/* Ingestion results banner */}
            {(importResult || uploadResult) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm text-emerald-950 flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <span className="text-sm font-extrabold uppercase tracking-wide">
                    {importResult ? "Importation locale" : "Upload direct"} terminé avec succès !
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-1 bg-white/60 p-4 rounded-xl border border-emerald-100 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="opacity-80 uppercase tracking-wider font-bold text-[9px]">Fichiers Trouvés</span>
                    <span className="text-base font-extrabold">{(importResult || uploadResult)!.files_found}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="opacity-80 uppercase tracking-wider font-bold text-[9px]">Examens Importés</span>
                    <span className="text-base font-extrabold">{(importResult || uploadResult)!.exams_imported}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="opacity-80 uppercase tracking-wider font-bold text-[9px]">Doublons Ignorés</span>
                    <span className="text-base font-extrabold">{(importResult || uploadResult)!.duplicates_skipped}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="opacity-80 uppercase tracking-wider font-bold text-[9px]">Scannés à Curater</span>
                    <span className="text-base font-extrabold text-amber-700">{(importResult || uploadResult)!.scanned_manual_review_needed}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="opacity-80 uppercase tracking-wider font-bold text-[9px]">Erreurs Ingestion</span>
                    <span className="text-base font-extrabold text-red-700">{(importResult || uploadResult)!.errors}</span>
                  </div>
                </div>
                {(importResult || uploadResult)!.imported_exam_ids.length > 0 && (
                  <div className="text-xs flex flex-wrap items-center gap-2">
                    <span className="font-bold">Accéder à la révision : </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(importResult || uploadResult)!.imported_exam_ids.map((exId) => (
                        <Link
                           key={exId}
                           href={`/examready-zen/exam-bank/${exId}`}
                           className="font-mono bg-blue text-white px-2 py-1 rounded hover:bg-blue/80 transition-colors text-[10px] font-bold"
                        >
                          Réviser {exId} ➡️
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ZIP Package Analysis Report Panel */}
            {zipAnalysisResult && (
              <section className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col gap-6 animate-fade-in">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="bg-blue/15 text-blue text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border border-blue/20">
                      📦 Analyse de Package ZIP
                    </span>
                    <h3 className="text-xl font-extrabold font-display mt-2 text-white">
                      Archive : <span className="font-mono text-slate-300">{zipAnalysisResult.zip_filename}</span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZipAnalysisResult(null)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Fermer ✕
                  </button>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/60 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Fichiers PDF détectés</span>
                    <span className="text-lg font-extrabold text-white">{zipAnalysisResult.pdf_count}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Matières détectées</span>
                    <span className="text-lg font-extrabold text-sky-400 capitalize">{zipAnalysisResult.subjects_detected.join(", ") || "Aucune"}</span>
                  </div>
                  {zipAnalysisResult.package_id && (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Package ID</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 truncate">{zipAnalysisResult.package_id}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Examens Importés</span>
                        <span className="text-lg font-extrabold text-emerald-400">{zipAnalysisResult.exams_imported}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Warnings Panel */}
                {zipAnalysisResult.warnings && zipAnalysisResult.warnings.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 text-xs font-medium flex flex-col gap-1.5">
                    <div className="font-extrabold uppercase tracking-wide flex items-center gap-1.5 text-amber-400">
                      <span>⚠️</span> Avertissements globaux du package ({zipAnalysisResult.warnings.length})
                    </div>
                    <ul className="list-disc pl-5 flex flex-col gap-0.5 opacity-90">
                      {zipAnalysisResult.warnings.map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detected Pairs Table */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <span>🔗</span> Paires d'examens et solutions détectées ({zipAnalysisResult.pairs?.length || 0})
                  </h4>
                  {zipAnalysisResult.pairs && zipAnalysisResult.pairs.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Examen PDF</th>
                            <th className="py-2.5 px-3">Correction PDF</th>
                            <th className="py-2.5 px-3">Matière</th>
                            <th className="py-2.5 px-3 text-center">Confiance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zipAnalysisResult.pairs.map((pair: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                              <td className="py-2.5 px-3 font-mono text-slate-300">{pair.exam_pdf}</td>
                              <td className="py-2.5 px-3 font-mono text-emerald-400">{pair.solution_pdf}</td>
                              <td className="py-2.5 px-3 capitalize text-sky-400">{pair.subject}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  pair.confidence === "high" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                                }`}>
                                  {pair.confidence}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs italic bg-slate-950/40 p-4 rounded-xl text-center border border-slate-800/45">
                      Aucune paire examen/solution n'a pu être automatiquement associée.
                    </div>
                  )}
                </div>

                {/* ZIP File Inventory Table */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <span>📋</span> Inventaire complet des fichiers PDF ({zipAnalysisResult.items?.length || 0})
                  </h4>
                  {zipAnalysisResult.items && zipAnalysisResult.items.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Chemin Interne</th>
                            <th className="py-2.5 px-3">Matière</th>
                            <th className="py-2.5 px-3">Région</th>
                            <th className="py-2.5 px-3">Année</th>
                            <th className="py-2.5 px-3">Rôle</th>
                            <th className="py-2.5 px-3 text-center">Text Density</th>
                            <th className="py-2.5 px-3">Avertissements</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zipAnalysisResult.items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                              <td className="py-2.5 px-3 font-mono text-slate-300 truncate max-w-xs">{item.internal_path}</td>
                              <td className="py-2.5 px-3 capitalize text-sky-400">{item.detected_subject}</td>
                              <td className="py-2.5 px-3">{item.region}</td>
                              <td className="py-2.5 px-3">{item.year || "-"}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  item.file_role === "exam" ? "bg-blue-500/20 text-blue-300" :
                                  item.file_role === "correction" ? "bg-emerald-500/20 text-emerald-300" :
                                  "bg-slate-700 text-slate-400"
                                }`}>
                                  {item.file_role}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  item.text_density === "selectable" ? "bg-teal-500/20 text-teal-300" : "bg-rose-500/20 text-rose-300"
                                }`}>
                                  {item.text_density}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {item.warnings && item.warnings.map((w: string, wIdx: number) => (
                                    <span key={wIdx} className="bg-red-950 border border-red-800/60 text-red-300 text-[8px] font-bold px-1.5 py-0.5 rounded">
                                      {w}
                                    </span>
                                  ))}
                                  {(!item.warnings || item.warnings.length === 0) && (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs italic bg-slate-950/40 p-4 rounded-xl text-center border border-slate-800/45">
                      Aucun fichier trouvé dans ce package.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. Exam Registry Table */}
            <section className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-5 overflow-hidden font-sans">
              <h3 className="text-lg font-extrabold font-display text-ink flex items-center gap-1.5">
                <span>📋</span> Liste des examens dans le système
              </h3>

              {/* Filters Panel */}
              <div className="flex flex-col gap-4 bg-paper/50 border border-paper-3 p-4 rounded-2xl shadow-inner">
                {/* Row 1: Search & Quick actions */}
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-xs opacity-60">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-paper-3 focus:border-accent rounded-xl pl-8 pr-4 py-2 text-xs outline-none transition-colors shadow-sm"
                      placeholder="Rechercher par région, année, matière ou ID..."
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] font-extrabold text-ink-2 uppercase tracking-wider whitespace-nowrap mr-1">Filtres rapides:</span>
                    <button
                      type="button"
                      onClick={() => applyQuickFilter("to_verify")}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                        filterVerification === "verify" && searchQuery === "" && filterSubject === "All" && filterStatus === "All" && filterCorrection === "All"
                          ? "bg-blue text-white border-blue shadow-sm cursor-pointer"
                          : "bg-white hover:bg-paper-3 border-paper-3 text-ink-2 cursor-pointer"
                      }`}
                    >
                      À vérifier
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickFilter("math")}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                        filterSubject === "math" && searchQuery === "" && filterStatus === "All" && filterVerification === "All" && filterCorrection === "All"
                          ? "bg-blue text-white border-blue shadow-sm cursor-pointer"
                          : "bg-white hover:bg-paper-3 border-paper-3 text-ink-2 cursor-pointer"
                      }`}
                    >
                      Math
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickFilter("ready")}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                        filterStatus === "ready" && searchQuery === "" && filterSubject === "All" && filterVerification === "All" && filterCorrection === "All"
                          ? "bg-blue text-white border-blue shadow-sm cursor-pointer"
                          : "bg-white hover:bg-paper-3 border-paper-3 text-ink-2 cursor-pointer"
                      }`}
                    >
                      Prêts à valider
                    </button>
                    {(searchQuery || filterSubject !== "All" || filterStatus !== "All" || filterVerification !== "All" || filterCorrection !== "All") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterSubject("All");
                          setFilterStatus("All");
                          setFilterVerification("All");
                          setFilterCorrection("All");
                        }}
                        className="text-[10px] font-bold text-red-600 hover:text-red-700 px-2.5 py-1.5 cursor-pointer"
                      >
                        Réinitialiser 🔄
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Select Filters Dropdowns */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-ink-2 uppercase tracking-wider">Matière</label>
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="bg-white border border-paper-3 focus:border-accent rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors shadow-sm cursor-pointer"
                    >
                      <option value="All">Toutes ({bankData.subjects.length})</option>
                      {bankData.subjects.map((sub) => (
                        <option key={sub} value={sub}>{sub.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-ink-2 uppercase tracking-wider">Statut Ingestion</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-white border border-paper-3 focus:border-accent rounded-lg px-2 py-1.5 text-xs outline-none transition-colors shadow-sm cursor-pointer"
                    >
                      <option value="All">Tous les statuts</option>
                      <option value="ready">ready (Prêt)</option>
                      <option value="imported_draft">imported_draft (Draft)</option>
                      <option value="missing_metadata">missing_metadata</option>
                      <option value="scanned_pdf_needs_review">scanned_pdf_needs_review</option>
                      <option value="needs_manual_review">needs_manual_review</option>
                      <option value="rejected">rejected (Rejeté)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-ink-2 uppercase tracking-wider">Vérification</label>
                    <select
                      value={filterVerification}
                      onChange={(e) => setFilterVerification(e.target.value)}
                      className="bg-white border border-paper-3 focus:border-accent rounded-lg px-2 py-1.5 text-xs outline-none transition-colors shadow-sm cursor-pointer"
                    >
                      <option value="All">Toutes</option>
                      <option value="verify">À vérifier (Revue requise)</option>
                      <option value="validated">Validé</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-ink-2 uppercase tracking-wider">Correction / Corrigé</label>
                    <select
                      value={filterCorrection}
                      onChange={(e) => setFilterCorrection(e.target.value)}
                      className="bg-white border border-paper-3 focus:border-accent rounded-lg px-2 py-1.5 text-xs outline-none transition-colors shadow-sm cursor-pointer"
                    >
                      <option value="All">Toutes</option>
                      <option value="with">Avec correction</option>
                      <option value="without">Sans correction</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-paper-3 bg-paper-2 text-ink-2 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3.5 px-4 rounded-l-xl">Exam ID / Nom</th>
                      <th className="py-3.5 px-4">Région</th>
                      <th className="py-3.5 px-4">Année</th>
                      <th className="py-3.5 px-4">Matière</th>
                      <th className="py-3.5 px-4 text-center">Questions</th>
                      <th className="py-3.5 px-4 text-center">Notions</th>
                      <th className="py-3.5 px-4 text-center">Corrigé</th>
                      <th className="py-3.5 px-4">Priorité</th>
                      <th className="py-3.5 px-4">Statut Ingestion</th>
                      <th className="py-3.5 px-4">Vérification</th>
                      <th className="py-3.5 px-4 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam) => {
                      const priority = getExamPriority(exam);
                      return (
                        <tr key={exam.exam_id} className="border-b border-paper-3/40 hover:bg-paper/30 font-medium">
                          <td className="py-3.5 px-4 font-mono font-bold text-accent-dark text-xs">{exam.exam_id}</td>
                          <td className="py-3.5 px-4">{exam.region}</td>
                          <td className="py-3.5 px-4">{exam.year || "-"}</td>
                          <td className="py-3.5 px-4 capitalize">{exam.subject}</td>
                          <td className="py-3.5 px-4 text-center font-bold">{exam.questions_count}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-blue">{exam.topic_count}</td>
                          <td className="py-3.5 px-4 text-center">
                            {exam.has_solution ? (
                              <span className="text-green text-lg">✅</span>
                            ) : (
                              <span className="text-red-400 text-lg">❌</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wide whitespace-nowrap ${priority.className}`}>
                              {priority.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              exam.status === "ready" ? "bg-emerald-100 border border-emerald-300 text-emerald-800" :
                              exam.status === "imported_draft" ? "bg-indigo-50 border border-indigo-200 text-indigo-700" :
                              exam.status === "missing_metadata" ? "bg-amber-100 border border-amber-300 text-amber-800" :
                              exam.status === "scanned_pdf_needs_review" || exam.status === "scanned_pdf_needs_manual_review" ? "bg-rose-100 border border-rose-300 text-rose-800" :
                              exam.status === "rejected" ? "bg-neutral-100 border border-neutral-300 text-neutral-800" :
                              exam.status === "needs_manual_review" ? "bg-purple-100 border border-purple-300 text-purple-800" :
                              "bg-paper-3 border border-paper-4 text-ink-2"
                            }`}>
                              {exam.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {exam.needs_manual_verification ? (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-amber-200 uppercase tracking-wide whitespace-nowrap">
                                ⚠️ Revue requise
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-green-200 uppercase tracking-wide whitespace-nowrap">
                                ✓ Validé
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/examready-zen/exam-bank/${exam.exam_id}`}
                              className="bg-blue hover:bg-blue/80 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap"
                            >
                              Réviser ⚙️
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-ink-2 border-t border-paper-3 pt-3 gap-2 px-1">
                <span>Affichage de {filteredExams.length} sur {bankData.exams.length} examen(s)</span>
                {filteredExams.length === 0 && (
                  <span className="text-red-600 italic">Aucun examen ne correspond aux critères de filtrage.</span>
                )}
              </div>
            </section>

            {/* 4. Topic Coverage Table */}
            <section id="notions-coverage" className="bg-white rounded-3xl border border-paper-3 p-6 shadow-sm flex flex-col gap-4 overflow-hidden">
              <h3 className="text-lg font-extrabold font-display text-ink flex items-center gap-1.5">
                <span>🎯</span> Couverture des 38 notions clés mathématiques
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-paper-3 bg-paper-2 text-ink-2 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3.5 px-4 rounded-l-xl">Notion clé</th>
                      <th className="py-3.5 px-4 text-center">Questions</th>
                      <th className="py-3.5 px-4 text-center">Examens distincts</th>
                      <th className="py-3.5 px-4">Couverture Status</th>
                      <th className="py-3.5 px-4 rounded-r-xl">Examens associés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankData.topic_coverage.map((coverage) => (
                      <tr key={coverage.topic_id} className="border-b border-paper-3/40 hover:bg-paper/30 font-medium">
                        <td className="py-3.5 px-4 flex flex-col gap-0.5">
                          <span className="font-bold text-ink">{coverage.topic_title}</span>
                          <span className="font-mono text-[9px] text-ink-2 uppercase">{coverage.topic_id}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">{coverage.question_count}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-blue">{coverage.exam_count}</td>
                        <td className="py-3.5 px-4">
                          {getCoverageBadge(coverage.question_count)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {coverage.exam_ids.map((exId) => (
                              <span key={exId} className="bg-paper-2 border border-paper-3 text-[10px] px-1.5 py-0.5 rounded font-mono text-ink-2">
                                {exId}
                              </span>
                            ))}
                            {coverage.exam_ids.length === 0 && <span className="text-ink-3 text-xs italic">-</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )
      )}
    </main>
  );
}
