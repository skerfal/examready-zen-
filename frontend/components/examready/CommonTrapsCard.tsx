"use client";

import React from "react";

interface CommonTrapsCardProps {
  trapsText: string;
}

export default function CommonTrapsCard({ trapsText }: CommonTrapsCardProps) {
  if (!trapsText || trapsText === "N/A") return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm flex gap-4 items-start">
      <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
        ⚠️
      </div>
      
      <div className="flex flex-col gap-1.5">
        <h5 className="text-xs uppercase font-extrabold tracking-wider text-red-700">
          Piège Fréquent à l'Examen ! (Attention)
        </h5>
        <p className="text-red-950 text-sm leading-relaxed font-semibold">
          {trapsText}
        </p>
        <p className="text-[11px] text-red-800 italic mt-0.5">
          * Conseil du coach : Repère ce piège sur ta copie et coche-le mentalement pour l'éviter.
        </p>
      </div>
    </div>
  );
}
