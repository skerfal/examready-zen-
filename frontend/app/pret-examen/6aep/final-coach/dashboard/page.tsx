"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dashboardOverview as initialOverview, younesProfile } from "../lib/testData";

interface DayProgress {
  day: number;
  date: string;
  attemptsCount: number;
  bestScore: string;
  latestScore: string;
  weakTopics: string[];
  status: "improved" | "still weak";
  signoff: string;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DayProgress[]>([]);
  const [detailedAttempts, setDetailedAttempts] = useState<any[]>([]);

  useEffect(() => {
    // Load attempts for all 8 days from localStorage
    const dayProgressList: DayProgress[] = [];
    const allAttempts: any[] = [];

    for (let day = 1; day <= 8; day++) {
      const saved = localStorage.getItem(`iqraa_day_${day}_attempts`);
      const dateStr = `${17 + day} Juin`;
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // Add to all attempts list for detailed ledger
          parsed.forEach((att: any) => {
            allAttempts.push({
              ...att,
              day
            });
          });

          // Calculate metrics for this day
          const attemptsCount = parsed.length;
          const latest = parsed[parsed.length - 1];
          const best = parsed.reduce((prevBest: any, curr: any) => {
            const prevRatio = prevBest.correctCount / prevBest.totalQuestions;
            const currRatio = curr.correctCount / curr.totalQuestions;
            return currRatio > prevRatio ? curr : prevBest;
          }, parsed[0]);

          const hasWeaknesses = latest.weakTopics.length > 0;

          dayProgressList.push({
            day,
            date: dateStr,
            attemptsCount,
            bestScore: best.score,
            latestScore: latest.score,
            weakTopics: latest.weakTopics,
            status: hasWeaknesses ? "still weak" : "improved",
            signoff: localStorage.getItem(`iqraa_day_${day}_signoff`) || "Non signé"
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback to static mock for Day 1 and 2 if no interactive data is set yet
        if (day === 1) {
          dayProgressList.push({
            day: 1,
            date: "18 Juin",
            attemptsCount: 1,
            bestScore: "7/9",
            latestScore: "7/9",
            weakTopics: ["Decimal brackets (Math)", "Quran spelling (Islamic Ed)"],
            status: "still weak",
            signoff: "Signé"
          });
        } else if (day === 2) {
          dayProgressList.push({
            day: 2,
            date: "19 Juin",
            attemptsCount: 0,
            bestScore: "---",
            latestScore: "---",
            weakTopics: [],
            status: "still weak",
            signoff: "Non signé"
          });
        } else {
          dayProgressList.push({
            day,
            date: dateStr,
            attemptsCount: 0,
            bestScore: "---",
            latestScore: "---",
            weakTopics: [],
            status: "still weak",
            signoff: "Non signé"
          });
        }
      }
    }

    setOverview(dayProgressList);
    setDetailedAttempts(allAttempts);
  }, []);

  const handleToggleSignoff = (day: number) => {
    setOverview((prev) =>
      prev.map((row) => {
        if (row.day === day) {
          const nextSign = row.signoff === "Signé" ? "Non signé" : "Signé";
          localStorage.setItem(`iqraa_day_${day}_signoff`, nextSign);
          return {
            ...row,
            signoff: nextSign
          };
        }
        return row;
      })
    );
  };

  // Aggregated Stats
  const completedDaysCount = overview.filter((o) => o.attemptsCount > 0).length;
  
  // Calculate average score ratio from all attempts
  const allAttemptsWithScores = overview.filter((o) => o.attemptsCount > 0);
  const avgPercent = allAttemptsWithScores.length > 0
    ? Math.round(
        (allAttemptsWithScores.reduce((sum, curr) => {
          const parts = curr.bestScore.split("/");
          const ratio = parseInt(parts[0]) / parseInt(parts[1]);
          return sum + ratio;
        }, 0) / allAttemptsWithScores.length) * 100
      )
    : 77.8; // default to Younes' day 1 mock

  const totalActiveWeaknesses = overview
    .filter((o) => o.status === "still weak" && o.attemptsCount > 0)
    .flatMap((o) => o.weakTopics).length;

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/pret-examen/6aep/final-coach" className="flex items-center gap-2">
            <span className="text-xl font-bold text-accent">&larr;</span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Retour au Coach
            </span>
          </Link>
          <div className="bg-paper-2 px-3 py-1 rounded-full text-xs font-semibold text-ink/70">
            Espace : <span className="text-ink font-bold">Parents / Enseignants</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <span className="bg-blue/15 text-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Suivi &amp; Diagnostics
          </span>
          <h1 className="font-display text-3xl font-extrabold text-ink mt-2">
            Tableau de Bord Parent-Enseignant
          </h1>
          <p className="text-ink/70 text-sm mt-1">
            Suivez les performances de Younes en temps réel, examinez les tentatives par version, les scores et signez les tests validés.
          </p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Moyenne générale (Max)</span>
            <span className="text-2xl font-extrabold text-ink block mt-1">{avgPercent}%</span>
            <span className="text-xs text-green font-semibold mt-1">Sur les meilleurs essais</span>
          </div>

          <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Jours révisés</span>
            <span className="text-2xl font-extrabold text-gold block mt-1">{completedDaysCount} / 8</span>
            <span className="text-xs text-ink/60 mt-1">Jours avec au moins 1 essai</span>
          </div>

          <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Points faibles actifs</span>
            <span className="text-2xl font-extrabold text-accent block mt-1">{totalActiveWeaknesses}</span>
            <span className="text-xs text-accent font-semibold mt-1">Sujets à retravailler</span>
          </div>
        </div>

        {/* Tracking Table card */}
        <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-ink/5 bg-paper/50 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Grand Livre de Suivi des jours</h3>
            <span className="text-xs text-ink/50 font-semibold">Regroupe les essais multiples</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-paper-2 text-ink/50 text-[10px] font-bold uppercase border-b border-ink/5">
                  <th className="py-3 px-4">Jour</th>
                  <th className="py-3 px-4">Essais</th>
                  <th className="py-3 px-4">Meilleur Score</th>
                  <th className="py-3 px-4">Dernier Score</th>
                  <th className="py-3 px-4">Sujets Sensibles</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-center">Émargement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {overview.map((row) => {
                  const isSigned = row.signoff === "Signé";
                  const hasAttempts = row.attemptsCount > 0;
                  
                  return (
                    <tr key={row.day} className="hover:bg-paper/30 transition-colors duration-150">
                      <td className="py-4 px-4 font-bold text-ink">J{row.day} <span className="text-[10px] text-ink/40 font-normal">({row.date})</span></td>
                      <td className="py-4 px-4 font-semibold text-ink/75">{row.attemptsCount}</td>
                      <td className="py-4 px-4 font-bold text-green">{row.bestScore}</td>
                      <td className="py-4 px-4 font-bold text-ink">{row.latestScore}</td>
                      <td className="py-4 px-4">
                        {hasAttempts && row.weakTopics.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {row.weakTopics.map((topic, i) => (
                              <span key={i} className="text-xs text-accent font-semibold">{topic}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-ink/30">Aucun</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            hasAttempts
                              ? row.status === "improved"
                                ? "bg-green/10 text-green"
                                : "bg-gold/10 text-gold"
                              : "bg-paper-3 text-ink/40"
                          }`}
                        >
                          {hasAttempts ? (row.status === "improved" ? "Acquis" : "À consolider") : "En attente"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleSignoff(row.day)}
                          disabled={!hasAttempts}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                            !hasAttempts
                              ? "bg-paper-3 text-ink/35 cursor-not-allowed border border-ink/5"
                              : isSigned
                              ? "bg-green/15 text-green hover:bg-green/25"
                              : "bg-ink text-white hover:bg-ink-2"
                          }`}
                        >
                          {isSigned ? "✓ Signé" : "Signer"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Attempts Log */}
        {detailedAttempts.length > 0 && (
          <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-ink/5 bg-paper/50">
              <h3 className="font-display text-lg font-bold text-ink">Grand Livre des Tentatives Récentes</h3>
            </div>
            <div className="p-4 space-y-3">
              {detailedAttempts.map((att, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-3 bg-paper rounded-xl border border-ink/5">
                  <div>
                    <span className="font-bold text-ink block">Jour {att.day} &middot; Tentative #{att.attemptNumber}</span>
                    <span className="text-[10px] text-ink/50">Version {att.version} &middot; date : {att.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-accent text-sm block">{att.score}</span>
                    <span className="text-[9px] text-ink/40">{att.weakTopics.length} erreurs détectées</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedagogical recommendations */}
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <span>🎓</span> Conseils Pédagogiques de Révision
          </h3>
          <div className="space-y-4 text-sm text-ink/80">
            <div className="border-l-4 border-accent pl-4 py-1.5 bg-accent/5 rounded-r-xl">
              <span className="font-bold text-ink text-xs block uppercase tracking-wider">Erreurs décimales (Mathématiques)</span>
              <p className="text-xs text-ink/75 mt-1">
                Younes fait des erreurs d'alignement. Forcez-le à dessiner la grille verticale de calcul ou à écrire le zéro de remplacement à droite de la virgule (ex. écrire 35,10 au lieu de 35,1 pour soustraire 12,45).
              </p>
            </div>
            
            <div className="border-l-4 border-green pl-4 py-1.5 bg-green/5 rounded-r-xl">
              <span className="font-bold text-ink text-xs block uppercase tracking-wider">Orthographe des versets (Éducation Islamique)</span>
              <p className="text-xs text-ink/75 mt-1">
                Attention aux fautes courantes d'écriture coranique. Younes a tendance à fusionner des mots comme "ما أنت" en "مأنت". Demandez-lui d'épeler chaque mot séparément avant de l'écrire.
              </p>
            </div>
            
            <div className="border-l-4 border-blue pl-4 py-1.5 bg-blue/5 rounded-r-xl">
              <span className="font-bold text-ink text-xs block uppercase tracking-wider">Gestion de l'anxiété</span>
              <p className="text-xs text-ink/75 mt-1">
                L'anxiété fait perdre à Younes ses repères. La respiration carrée (CalmBreathingBox) doit être pratiquée 3 minutes avant chaque mini-test pour ralentir son rythme cardiaque.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
