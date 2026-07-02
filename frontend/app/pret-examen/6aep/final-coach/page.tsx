"use client";

import Link from "next/link";
import { younesProfile } from "./lib/testData";

function Brandmark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M 6 12.5 Q 11 11 16 13.5 L 16 22.5 Q 11 21 6 22 Z" fill="white" />
      <path d="M 26 12.5 Q 21 11 16 13.5 L 16 22.5 Q 21 21 26 22 Z" fill="white" />
      <line x1="16" y1="13.5" x2="16" y2="22.5" stroke="#fde6c9" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function FinalCoachLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Navbar Navigation */}
      <header className="border-b border-ink/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Brandmark />
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              IqraaNow Final Coach
            </span>
          </Link>
          <div className="flex items-center gap-4.5">
            <Link
              href="/pret-examen/6aep/final-coach/checklist"
              className="text-xs sm:text-sm font-semibold text-ink/70 hover:text-accent transition-colors duration-200"
            >
              Checklist J-8
            </Link>
            <Link
              href="/pret-examen/6aep/final-coach/dashboard"
              className="rounded-full bg-ink hover:bg-accent hover:scale-105 px-4 py-1.5 text-xs font-bold text-white transition-all duration-200 shadow-sm shadow-ink/10"
            >
              Espace Parent
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent/95 to-gold/95 p-6 sm:p-8 text-white shadow-xl shadow-accent/5 mb-8">
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-y-12 translate-x-12 z-0 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-72 h-72">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="6" fill="none" />
            </svg>
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              🎓 6AEP Exam Prep
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight leading-tight">
              Coach Examen Final
            </h1>
            <p className="text-white/95 text-sm sm:text-base mt-2.5 leading-relaxed">
              Bienvenue dans ta préparation personnalisée, {younesProfile.name} ! Il te reste 8 jours pour réviser calmement, étape par étape, et arriver serein le jour de l’examen.
            </p>
          </div>
        </section>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-ink/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-ink/40 uppercase tracking-wider">Date de l'examen</span>
              <span className="text-base">📅</span>
            </div>
            <div className="text-xl font-bold text-ink mt-2">{younesProfile.examDate}</div>
            <div className="text-xs text-accent font-bold mt-1">J-{younesProfile.daysRemaining} jours restants</div>
          </div>
          
          <div className="bg-white border border-ink/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-ink/40 uppercase tracking-wider">Progression révision</span>
              <span className="text-base">🎯</span>
            </div>
            <div className="text-xl font-bold text-ink mt-2">{younesProfile.overallProgress}%</div>
            <div className="w-full bg-paper-3 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-green h-1.5 rounded-full"
                style={{ width: `${younesProfile.overallProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white border border-ink/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-ink/40 uppercase tracking-wider">Score moyen mini-tests</span>
              <span className="text-base">⚡</span>
            </div>
            <div className="text-xl font-bold text-ink mt-2">{younesProfile.averageScore}</div>
            <div className="text-xs text-green font-bold mt-1">Dernier test : J1 complété</div>
          </div>
        </div>

        {/* Two-Column Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main CTAs */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-ink mb-4">Que veux-tu réviser aujourd'hui ?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/pret-examen/6aep/final-coach/tests/day/1"
                  className="group rounded-xl border border-ink/5 bg-paper/50 hover:bg-accent/5 hover:border-accent/40 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="bg-accent/10 text-accent text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Accès rapide
                    </span>
                    <h3 className="font-bold text-ink group-hover:text-accent transition-colors duration-200 mt-2 text-base">
                      Test du Jour 1
                    </h3>
                    <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                      Décimaux, Compréhension, Sourate al-Qalam
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                    Revoir le test <span>&rarr;</span>
                  </span>
                </Link>

                <Link
                  href="/pret-examen/6aep/final-coach/tests"
                  className="group rounded-xl border border-ink/5 bg-paper/50 hover:bg-green/5 hover:border-green/40 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="bg-green/10 text-green text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Plan complet
                    </span>
                    <h3 className="font-bold text-ink group-hover:text-green transition-colors duration-200 mt-2 text-base">
                      Les 8 jours de révision
                    </h3>
                    <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                      Affiche le calendrier complet de tes mini-tests
                    </p>
                  </div>
                  <span className="text-xs font-bold text-green mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                    Voir les jours <span>&rarr;</span>
                  </span>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-ink/5 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/pret-examen/6aep/final-coach/mistake-loop"
                  className="flex-1 text-center rounded-xl bg-ink hover:bg-accent text-paper py-3 font-bold text-xs transition-colors duration-200 cursor-pointer shadow-sm shadow-ink/10"
                >
                  حلقة الأخطاء (Mistake Loop)
                </Link>
                <Link
                  href="/pret-examen/6aep/final-coach/dashboard"
                  className="flex-1 text-center rounded-xl border border-ink/10 text-ink py-3 font-bold text-xs hover:bg-paper-2 transition-colors duration-200 cursor-pointer"
                >
                  Tableau de Bord Parent
                </Link>
              </div>
            </div>

            {/* Curriculum Subjects */}
            <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-ink mb-4">Matières clés de l'examen</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3.5 p-3.5 bg-blue/5 rounded-xl border border-blue/10">
                  <div className="w-9 h-9 rounded-lg bg-blue text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue/20">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue uppercase tracking-wider">Mathématiques</div>
                    <div className="text-[11px] text-ink/60 mt-0.5">Fraction, Vitesse, Angles</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3.5 p-3.5 bg-accent/5 rounded-xl border border-accent/10">
                  <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-accent/20">
                    F
                  </div>
                  <div>
                    <div className="text-xs font-bold text-accent uppercase tracking-wider">Français</div>
                    <div className="text-[11px] text-ink/60 mt-0.5">Grammaire, Texte, Writing</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3.5 p-3.5 bg-gold/5 rounded-xl border border-gold/10">
                  <div className="w-9 h-9 rounded-lg bg-gold text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-gold/20 font-sans">
                    ع
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gold uppercase tracking-wider">العربية</div>
                    <div className="text-[11px] text-ink/60 mt-0.5">الصرف، التراكيب، التعبير</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3.5 p-3.5 bg-green/5 rounded-xl border border-green/10">
                  <div className="w-9 h-9 rounded-lg bg-green text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-green/20 font-sans">
                    إ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-green uppercase tracking-wider">التربية الإسلامية</div>
                    <div className="text-[11px] text-ink/60 mt-0.5">سورة القلم، الصيام، القيم</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weak Areas Panel */}
            <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-ink mb-2.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
                Points à consolider
              </h3>
              <p className="text-xs text-ink/50 mb-4">Basé sur tes récents résultats aux mini-tests :</p>
              <ul className="space-y-3">
                {younesProfile.weakTopics.map((topic, i) => (
                  <li key={i} className="text-xs font-bold text-ink bg-paper-2 rounded-xl p-3 border border-ink/5 flex items-start gap-2.5">
                    <span className="text-gold mt-0.5 text-sm">⚠️</span>
                    <span className="leading-normal">{topic}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pret-examen/6aep/final-coach/mistake-loop"
                className="text-xs font-bold text-accent hover:text-accent-dark transition-colors duration-200 mt-4 block text-center border-t border-ink/5 pt-3"
              >
                Traiter dans حلقة الأخطاء &rarr;
              </Link>
            </div>

            {/* Pre-Exam Checklist Widget */}
            <div className="bg-gradient-to-br from-green via-green/95 to-ink rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <h3 className="font-display text-lg font-bold">Checklist du Jour J</h3>
              <p className="text-white/80 text-xs mt-1 leading-relaxed">Es-tu prêt physiquement et mentalement pour le 26 Juin ?</p>
              <ul className="space-y-2 mt-4 text-xs">
                <li className="flex items-center gap-2">
                  <span className="text-accent-light text-sm">✓</span> Dormir plus de 9 heures
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-light text-sm">✓</span> Préparer la trousse géométrique
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-light text-sm">✓</span> Respiration relaxante
                </li>
              </ul>
              <Link
                href="/pret-examen/6aep/final-coach/checklist"
                className="mt-5 text-center block rounded-xl bg-white hover:bg-paper text-ink py-2.5 font-bold text-xs transition-colors duration-200"
              >
                Ouvrir la Checklist &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
