"use client";

import React, { useState } from "react";
import { PracticePlan } from "@/lib/examreadyZenApi";

interface ReinforcementFlowProps {
  plan: PracticePlan;
}

export default function ReinforcementFlow({ plan }: ReinforcementFlowProps) {
  // Keep track of which questions have been checked off by the student
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});

  const handleToggle = (qId: string) => {
    setCheckedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Calculate progress
  const totalQuestions = plan.practice_blocks.reduce((acc, block) => acc + (block.recommended_questions?.length || 0), 0);
  const completedQuestions = Object.values(checkedQuestions).filter(Boolean).length;
  const progressPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-paper-3 shadow-md overflow-hidden flex flex-col mb-8">
      {/* Header */}
      <div className="bg-blue text-white p-6 flex flex-col gap-1">
        <span className="text-[10px] md:text-xs uppercase tracking-widest font-extrabold text-white/70 bg-white/10 px-3 py-1 rounded-full self-start">
          Feuille de Route Personnalisée
        </span>
        <h3 className="text-xl md:text-3xl font-bold font-display leading-tight mt-1">
          Plan d'Entraînement Adaptatif
        </h3>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Progress Tracker Dial */}
        <div className="bg-paper-2 rounded-2xl p-4 border border-paper-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-ink-2 tracking-wider">
              Ton avancement :
            </span>
            <span className="text-lg font-bold text-ink mt-0.5">
              {completedQuestions} sur {totalQuestions} exercices complétés
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="flex-1 max-w-md bg-paper-3 rounded-full h-3 overflow-hidden shadow-inner relative">
            <div 
              className="bg-blue h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-extrabold text-blue font-mono">{progressPercent}%</span>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-paper-2 border border-paper-3 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h5 className="text-[10px] font-bold text-ink-2 uppercase tracking-wider">Durée recommandée</h5>
              <p className="text-sm font-extrabold text-ink">{plan.estimated_time_minutes} minutes</p>
            </div>
          </div>
          <div className="bg-paper-2 border border-paper-3 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h5 className="text-[10px] font-bold text-ink-2 uppercase tracking-wider">Objectif de réussite</h5>
              <p className="text-sm font-extrabold text-ink">{plan.success_criteria}</p>
            </div>
          </div>
        </div>

        {/* Practice Blocks loop */}
        <div className="flex flex-col gap-6 mt-2">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-paper-3 pb-2.5">
            📋 Liste des défis d'entraînement
          </h4>

          {plan.practice_blocks.map((block, idx) => (
            <div key={idx} className="bg-paper rounded-2xl border border-paper-3 p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4 flex-wrap border-b border-paper-3/40 pb-3">
                <div>
                  <h5 className="font-bold text-ink text-base md:text-lg">
                    {block.objective || `Entraînement : ${block.skill_tag.replace("_", " ")}`}
                  </h5>
                  <span className="text-xs text-ink-2 italic">
                    Focus sur : <strong>{block.skill_tag.replace("_", " ")}</strong>
                  </span>
                </div>
                <span className="text-xs font-extrabold bg-blue/10 text-blue border border-blue/20 px-3 py-1 rounded-full">
                  {block.question_count} exercice{block.question_count > 1 ? "s" : ""}
                </span>
              </div>

              {/* Exercises checklist */}
              {block.recommended_questions && block.recommended_questions.length > 0 && (
                <div className="flex flex-col gap-3">
                  {block.recommended_questions.map((q: any, qIdx: number) => {
                    const isChecked = !!checkedQuestions[q.question_id];
                    return (
                      <div
                        key={q.question_id || qIdx}
                        className={`border rounded-xl p-4 transition-all flex gap-3.5 items-start ${
                          isChecked
                            ? "bg-green/5 border-green/30 opacity-70"
                            : "bg-white border-paper-3 hover:border-blue/30"
                        }`}
                      >
                        {/* Interactive Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggle(q.question_id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            isChecked
                              ? "bg-green border-green text-white"
                              : "border-paper-3 hover:border-blue bg-white"
                          }`}
                        >
                          {isChecked && <span className="text-xs">✓</span>}
                        </button>

                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="flex justify-between items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-blue bg-blue/5 border border-blue/15 px-2 py-0.5 rounded">
                              {q.question_id}
                            </span>
                            {q.difficulty && (
                              <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                                q.difficulty === "easy" ? "bg-green/10 text-green" :
                                q.difficulty === "medium" ? "bg-gold/10 text-gold" : "bg-accent/10 text-accent"
                              }`}>
                                {q.difficulty}
                              </span>
                            )}
                          </div>

                          <p className={`text-sm leading-relaxed text-ink font-semibold ${
                            isChecked ? "line-through text-ink-2" : ""
                          }`}>
                            {q.question_text}
                          </p>

                          {q.remediation_hint && !isChecked && (
                            <p className="text-xs text-ink-2 italic border-t border-paper-3 pt-2 mt-1 flex items-center gap-1">
                              <span>💡</span> <span>Indice : {q.remediation_hint}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
