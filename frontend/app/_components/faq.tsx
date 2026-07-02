"use client";

import { useState } from "react";

type Item = { q: string; a: string };

const items: Item[] = [
  {
    q: "Qu'est-ce que IqraaNow exactement ?",
    a: "Une plateforme éducative multi-écoles qui t'accompagne de la leçon à l'examen : cours clairs, exercices guidés, suivi de progression et préparation ciblée aux épreuves.",
  },
  {
    q: "Quelle est la différence entre National, International et Élite ?",
    a: "Le programme National 🇲🇦 est inclus dans le catalogue de base. International 🌍 et Élite ✦ sont des modules complémentaires payants pour aller plus loin : curricula étrangers, contenus avancés et accompagnement renforcé.",
  },
  {
    q: "La plateforme est-elle disponible en arabe ?",
    a: "Oui. IqraaNow est pensée bilingue français / arabe, avec une typographie et une mise en page adaptées à la lecture en arabe (RTL).",
  },
  {
    q: "Pour quelles écoles IqraaNow fonctionne-t-il ?",
    a: "IqraaNow est multi-écoles : chaque établissement garde son identité et ses programmes, tout en profitant de la même expérience d'apprentissage de qualité.",
  },
  {
    q: "Comment commencer ?",
    a: "Crée ton compte, choisis ton niveau et ton école, puis commence ta première leçon. Le programme National est accessible immédiatement.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-5 w-5 shrink-0 text-accent transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/70">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors duration-200 hover:bg-ink/[0.03] cursor-pointer sm:px-6"
              >
                <span className="font-display text-base font-medium text-ink sm:text-lg">
                  {item.q}
                </span>
                <ChevronIcon open={open} />
              </button>
            </h3>
            <div
              className={`grid transition-all duration-300 ease-out ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[0.95rem] leading-relaxed text-ink/70 sm:px-6">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
