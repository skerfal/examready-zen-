"use client";

import React from "react";

interface WorkedExampleCardProps {
  exampleText: string;
}

export default function WorkedExampleCard({ exampleText }: WorkedExampleCardProps) {
  if (!exampleText || exampleText === "N/A") return null;

  return (
    <div className="bg-paper-2 border border-paper-3 rounded-2xl p-5 shadow-inner">
      <h5 className="text-xs uppercase font-bold tracking-wider text-blue mb-2.5 flex items-center gap-1.5">
        <span>✍️</span> Étape par Étape : Exemple Corrigé
      </h5>
      
      {/* Chalkboard / Grid Notebook effect */}
      <div className="bg-white border border-blue/20 rounded-xl p-4 font-mono text-sm leading-relaxed text-ink shadow-sm relative overflow-hidden">
        {/* Mock grid lines background using CSS radial-gradient */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(circle, #2c5f8d 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />
        <div className="relative z-10 whitespace-pre-line font-medium">
          {exampleText}
        </div>
      </div>
      
      <p className="text-[11px] text-ink-2 italic mt-2 text-right">
        💡 Astuce : Réécris ces étapes sur ton brouillon pour t'entraîner !
      </p>
    </div>
  );
}
