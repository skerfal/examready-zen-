"use client";

import React from "react";
import { PracticePlan } from "@/lib/examreadyZenApi";

interface PracticePlanCardProps {
  plan: PracticePlan;
}

export default function PracticePlanCard({ plan }: PracticePlanCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-paper-3 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col mb-6">
      {/* Header */}
      <div className="bg-blue text-white p-5 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest font-semibold text-white/70 bg-white/10 px-2.5 py-1 rounded-full self-start">
          Plan de Renforcement
        </span>
        <h3 className="text-xl md:text-2xl font-bold font-display leading-tight">
          {plan.plan_title}
        </h3>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Plan Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-paper-2 rounded-xl p-3 border border-paper-3 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-xs text-ink-2 uppercase tracking-wider font-semibold">Temps estimé</p>
              <p className="text-sm font-bold text-ink">{plan.estimated_time_minutes} minutes</p>
            </div>
          </div>
          <div className="bg-paper-2 rounded-xl p-3 border border-paper-3 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-xs text-ink-2 uppercase tracking-wider font-semibold">Objectif de réussite</p>
              <p className="text-sm font-bold text-ink">{plan.success_criteria}</p>
            </div>
          </div>
        </div>

        {/* Recommended Skills tags */}
        {plan.recommended_skills && plan.recommended_skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-ink-2 uppercase mr-1">Compétences ciblées :</span>
            {plan.recommended_skills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-blue/10 text-blue font-semibold px-2 py-0.5 rounded-full border border-blue/20"
              >
                {skill.replace("_", " ")}
              </span>
            ))}
          </div>
        )}

        {/* Practice Blocks */}
        <div className="flex flex-col gap-5 mt-2">
          <h4 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-paper-3 pb-2">
            Blocs d'exercices à compléter
          </h4>

          {plan.practice_blocks.map((block, idx) => (
            <div
              key={idx}
              className="bg-paper rounded-xl border border-paper-3 p-5 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <h5 className="font-bold text-ink text-base">
                  {block.objective || `Pratique : ${block.skill_tag.replace("_", " ")}`}
                </h5>
                <span className="text-xs bg-accent text-white px-2.5 py-0.5 rounded-full font-bold">
                  {block.question_count} exercice{block.question_count > 1 ? "s" : ""}
                </span>
              </div>

              {/* Recommended questions texts */}
              {block.recommended_questions && block.recommended_questions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-ink-2 uppercase tracking-wider">
                    Questions d'entraînement recommandées :
                  </p>
                  <div className="flex flex-col gap-2">
                    {block.recommended_questions.map((q: any, qIdx: number) => (
                      <div
                        key={q.question_id || qIdx}
                        className="bg-white p-3.5 rounded-lg border border-paper-3 text-sm text-ink flex flex-col gap-2 shadow-sm"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs font-semibold text-blue bg-blue/10 px-2 py-0.5 rounded border border-blue/20">
                            {q.question_id}
                          </span>
                          {q.difficulty && (
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              q.difficulty === "easy" ? "bg-green/10 text-green" :
                              q.difficulty === "medium" ? "bg-gold/10 text-gold" : "bg-accent/10 text-accent"
                            }`}>
                              {q.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold leading-relaxed">
                          {q.question_text}
                        </p>
                        {q.remediation_hint && (
                          <p className="text-xs text-ink-2 italic border-t border-paper-3 pt-1.5 mt-1">
                            💡 Astuce : {q.remediation_hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation hint for the block */}
              {block.remediation_hint && !block.recommended_questions && (
                <p className="text-xs text-ink-2 italic bg-white p-2.5 rounded-lg border border-paper-3">
                  💡 Rappel : {block.remediation_hint}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
