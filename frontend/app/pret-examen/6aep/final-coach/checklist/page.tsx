"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { checklistItems as initialChecklist } from "../lib/testData";

export default function ChecklistPage() {
  const [items, setItems] = useState(initialChecklist);

  // Load from localStorage on mount (safe for SSR)
  useEffect(() => {
    const saved = localStorage.getItem("iqraa_checklist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleToggle = (id: string) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      localStorage.setItem("iqraa_checklist", JSON.stringify(updated));
      return updated;
    });
  };

  const handleReset = () => {
    if (confirm("Voulez-vous réinitialiser la checklist ?")) {
      const reset = initialChecklist.map((item) => ({ ...item, checked: false }));
      setItems(reset);
      localStorage.setItem("iqraa_checklist", JSON.stringify(reset));
    }
  };

  // Group items by category
  const categories = {
    morning: {
      titleFr: "🌅 Au Réveil (Le Matin du Jour J)",
      titleAr: "عند الاستيقاظ صباح الامتحان",
      items: items.filter((item) => item.category === "morning"),
    },
    bag: {
      titleFr: "🎒 Dans mon Cartable (À vérifier la veille)",
      titleAr: "في محفظتي (يُراجع في المساء)",
      items: items.filter((item) => item.category === "bag"),
    },
    mind: {
      titleFr: "🧘 Calme & Confiance (État d'esprit)",
      titleAr: "الهدوء والتركيز النفسي",
      items: items.filter((item) => item.category === "mind"),
    },
    during: {
      titleFr: "📝 Pendant l'Épreuve (Gestion de copie)",
      titleAr: "أثناء الامتحان داخل القسم",
      items: items.filter((item) => item.category === "during"),
    },
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

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
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-accent hover:text-accent-dark transition-colors duration-200 cursor-pointer"
          >
            Réinitialiser
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <span className="bg-green/15 text-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Jour J &middot; 26 Juin
          </span>
          <h1 className="font-display text-3xl font-extrabold text-ink mt-2">
            Ma Checklist Anti-Stress du Jour J
          </h1>
          <p className="text-ink/70 text-sm mt-1">
            Coche chaque étape au fur et à mesure pour t'assurer d'avoir tout le nécessaire et d'aborder l'examen avec sérénité.
          </p>
        </div>

        {/* Progress bar card */}
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-ink/50 uppercase tracking-wider">
              Préparation globale du Jour J
            </span>
            <span className="text-sm font-extrabold text-ink">
              {checkedCount} / {totalCount} validés ({percent}%)
            </span>
          </div>
          <div className="w-full bg-paper-3 h-3 rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ease-out ${
                percent === 100 ? "bg-green" : "bg-accent"
              }`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          {percent === 100 && (
            <p className="text-xs text-green font-bold mt-2.5 text-center">
              🎉 Super Younes ! Tu as coché toute la checklist. Tu es paré et prêt pour l'examen !
            </p>
          )}
        </div>

        {/* Category blocks */}
        <div className="space-y-8">
          {Object.entries(categories).map(([key, cat]) => (
            <div key={key} className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
              <div className="border-b border-ink/5 pb-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink">{cat.titleFr}</h3>
                <span className="text-xs font-semibold text-ink/40 dir-rtl text-right sm:text-left">
                  {cat.titleAr}
                </span>
              </div>

              <div className="space-y-4">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                      item.checked
                        ? "bg-green/5 border-green/20"
                        : "bg-paper-2/50 border-ink/5 hover:border-ink/15 hover:bg-paper-2"
                    }`}
                  >
                    {/* Checkbox icon */}
                    <div className="pt-0.5">
                      <div
                        className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                          item.checked
                            ? "bg-green border-green text-white"
                            : "border-ink/20 bg-white"
                        }`}
                      >
                        {item.checked && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3.5 h-3.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Text labels */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span
                          className={`text-sm font-bold leading-none ${
                            item.checked ? "text-ink/50 line-through" : "text-ink"
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.titleAr && (
                          <span
                            className={`text-xs font-semibold dir-rtl text-right ${
                              item.checked ? "text-ink/30" : "text-ink/60"
                            }`}
                          >
                            {item.titleAr}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-xs mt-1.5 leading-relaxed ${item.checked ? "text-ink/40" : "text-ink/65"}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
