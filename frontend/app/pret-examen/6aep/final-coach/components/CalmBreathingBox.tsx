"use client";

import React, { useState, useEffect, useRef } from "react";

export default function CalmBreathingBox() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [seconds, setSeconds] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSeconds(4);
      setPhase("inhale");
      return;
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 1) {
          setPhase((currentPhase) => {
            if (currentPhase === "inhale") return "hold1";
            if (currentPhase === "hold1") return "exhale";
            if (currentPhase === "exhale") return "hold2";
            return "inhale";
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const getPhaseConfig = () => {
    switch (phase) {
      case "inhale":
        return {
          textFr: "Inspire lentement...",
          textAr: "استنشق ببطء...",
          color: "border-blue text-blue bg-blue/5 scale-110",
          progress: 25,
        };
      case "hold1":
        return {
          textFr: "Bloque ta respiration...",
          textAr: "احبس نفسك...",
          color: "border-gold text-gold bg-gold/5 scale-110",
          progress: 50,
        };
      case "exhale":
        return {
          textFr: "Expire lentement...",
          textAr: "ازفر ببطء...",
          color: "border-accent text-accent bg-accent/5 scale-95",
          progress: 75,
        };
      case "hold2":
        return {
          textFr: "Bloque à vide...",
          textAr: "انتظر بهدوء...",
          color: "border-green text-green bg-green/5 scale-95",
          progress: 100,
        };
    }
  };

  const config = getPhaseConfig();

  return (
    <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display font-bold text-ink text-sm sm:text-base flex items-center gap-1.5">
            <span>🧘</span> Zone de Calme &middot; Respiration Carrée
          </h4>
          <p className="text-[11px] text-ink/60 mt-0.5">
            Aide à te concentrer et évite le stress de l'examen.
          </p>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-accent/15 text-accent hover:bg-accent/25"
              : "bg-ink text-white hover:bg-ink-2"
          }`}
        >
          {isActive ? "Arrêter" : "Démarrer (4s)"}
        </button>
      </div>

      <div className="h-40 flex flex-col items-center justify-center relative w-full overflow-hidden">
        {isActive ? (
          <div className="flex flex-col items-center gap-4">
            {/* Pulsing circle representation */}
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-extrabold transition-all duration-1000 ease-in-out ${config.color}`}
            >
              {seconds}
            </div>

            {/* Instruction labels */}
            <div className="text-center">
              <p className="text-sm font-bold text-ink transition-colors duration-500">
                {config.textFr}
              </p>
              <p className="text-xs font-semibold text-ink/60 dir-rtl mt-0.5 transition-colors duration-500">
                {config.textAr}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-ink/20 flex items-center justify-center text-xl text-ink/30 mx-auto mb-3 animate-pulse">
              🍃
            </div>
            <p className="text-xs text-ink/70 max-w-xs mx-auto">
              Prends 1 minute pour respirer en rythme avant de commencer ton épreuve.
            </p>
          </div>
        )}
      </div>

      {isActive && (
        <div className="w-full bg-paper-3 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-accent h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(seconds / 4) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
