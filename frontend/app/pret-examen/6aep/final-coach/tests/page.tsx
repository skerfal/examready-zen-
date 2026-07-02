"use client";

import Link from "next/link";
import { dailyTestsMetadata, younesProfile } from "../lib/testData";

// Subject badge component mapping
function SubjectBadge({ subject }: { subject: string }) {
  let bgClass = "bg-paper-3 text-ink/80 border-ink/10";
  if (subject === "Mathématiques") {
    bgClass = "bg-blue/10 text-blue border-blue/20";
  } else if (subject === "Français") {
    bgClass = "bg-accent/10 text-accent border-accent/20";
  } else if (subject === "Langue Arabe" || subject === "Arabic") {
    bgClass = "bg-gold/10 text-gold border-gold/20";
  } else if (subject === "Éducation Islamique") {
    bgClass = "bg-green/10 text-green border-green/20";
  }

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${bgClass}`}>
      {subject}
    </span>
  );
}

export default function TestsIndex() {
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
            Élève : <span className="text-ink font-bold">{younesProfile.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="bg-accent/15 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Plan de 8 Jours
          </span>
          <h1 className="font-display text-3xl font-extrabold text-ink mt-2">
            Mes Mini-Tests Quotidiens
          </h1>
          <p className="text-ink/70 text-sm mt-1">
            Chaque jour de révision contient un mini-test de 8 à 12 questions pour évaluer tes connaissances et t'entraîner dans les conditions de l'examen.
          </p>
        </div>

        {/* Days List */}
        <div className="space-y-4">
          {dailyTestsMetadata.map((test) => {
            const isCompleted = test.status === "completed";
            const isNeedsReview = test.status === "needs review";
            
            return (
              <div
                key={test.day}
                className="bg-white border border-ink/10 rounded-2xl p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Side Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-ink text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {test.day}
                      </span>
                      <h3 className="font-display text-lg font-bold text-ink">
                        Jour {test.day} &middot; <span className="text-sm font-sans font-normal text-ink/60">{test.date}</span>
                      </h3>
                      {isCompleted && (
                        <span className="bg-green/10 text-green text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Complété {test.score && `(${test.score})`}
                        </span>
                      )}
                      {isNeedsReview && (
                        <span className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          À revoir
                        </span>
                      )}
                      {!isCompleted && !isNeedsReview && (
                        <span className="bg-ink/5 text-ink/50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Non commencé
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {test.subjects.map((sub, i) => (
                        <SubjectBadge key={i} subject={sub} />
                      ))}
                    </div>

                    <p className="text-xs text-ink/70 pt-1 line-clamp-1">
                      <span className="font-semibold text-ink">Leçons :</span> {test.lessons.join(", ")}
                    </p>
                  </div>

                  {/* Right Side Action */}
                  <div className="flex items-center justify-end gap-3 border-t border-ink/5 pt-3 sm:pt-0 sm:border-0">
                    <span className="text-xs text-ink/50 font-medium hidden sm:inline">{test.duration}</span>
                    <Link
                      href={`/pret-examen/6aep/final-coach/tests/day/${test.day}`}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-150 ${
                        isCompleted
                          ? "bg-paper-2 hover:bg-paper-3 text-ink"
                          : "bg-accent hover:bg-accent-dark text-white"
                      }`}
                    >
                      {isCompleted ? "Revoir les résultats" : "Commencer le test"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
