"use client";

import React from "react";

interface MathSymbolKeyboardProps {
  topicId?: string;
  answerType?: string;
  onInsertSymbol: (symbol: string) => void;
}

export default function MathSymbolKeyboard({
  topicId = "",
  answerType = "",
  onInsertSymbol
}: MathSymbolKeyboardProps) {
  // Determine relevant categories
  const isOrdering =
    topicId.includes("ordering") ||
    topicId.includes("compare") ||
    topicId.includes("comparaison") ||
    topicId.includes("ordre");

  const isGeometry =
    topicId.includes("angle") ||
    topicId.includes("geometrie") ||
    topicId.includes("trace") ||
    topicId.includes("construction") ||
    topicId.includes("triangle") ||
    topicId.includes("cercle") ||
    topicId.includes("symetrie") ||
    topicId.includes("bissectrice") ||
    topicId.includes("parallel");

  const isFractions = topicId.includes("fraction");

  const isPowers =
    topicId.includes("puissance") ||
    topicId.includes("power") ||
    topicId.includes("carre") ||
    topicId.includes("cube");

  const isMeasurement =
    topicId.includes("conversion") ||
    topicId.includes("mesure") ||
    topicId.includes("volume") ||
    topicId.includes("aire") ||
    topicId.includes("surface") ||
    topicId.includes("unite") ||
    topicId.includes("longueur") ||
    topicId.includes("masse") ||
    topicId.includes("capacite") ||
    topicId.includes("perimetre");

  // Define symbol lists
  const defaultSymbols = [">", "<", "=", "+", "-", "×", "÷", ".", ",", "/", "(", ")"];
  const orderingSymbols = [">", "<", "=", "≤", "≥"];
  const fractionSymbols = ["/", "½", "¼", "¾"];
  const geometrySymbols = ["°", "∠", "⟂", "∥"];
  const powerSymbols = ["²", "³"];
  const measurementSymbols = [
    "cm", "m", "km", "g", "kg", "L",
    "m²", "cm²", "m³", "cm³"
  ];

  // Helper to filter out duplicates if default and custom groups overlap
  // We can show different sections clearly labeled for child friendliness.
  return (
    <div className="bg-paper-2 rounded-2xl p-4 border border-paper-3 flex flex-col gap-3.5 shadow-sm mt-3 animate-fade-in">
      {/* Keyboard Header */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2">
          Clavier de Symboles Mathématiques ⌨️
        </span>
        <p className="text-xs text-ink-2 leading-relaxed">
          Tu peux utiliser ces symboles pour répondre plus facilement.
        </p>
      </div>

      {/* Symbol Buttons Workspace */}
      <div className="flex flex-col gap-3">
        {/* Dynamic / Topic-Specific Group first if applicable */}
        {isOrdering && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
              Ordre & Comparaison 🔢
            </span>
            <div className="flex flex-wrap gap-2">
              {orderingSymbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onInsertSymbol(sym)}
                  className="min-w-[44px] h-11 bg-white hover:bg-accent hover:text-white border border-paper-3 hover:border-accent text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
            {/* Quick Example for ordering */}
            <p className="text-[11px] text-accent font-semibold italic mt-0.5">
              Exemple : 25.41 &gt; 25.4 &gt; 25.14
            </p>
          </div>
        )}

        {isFractions && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-blue uppercase tracking-wider">
              Fractions 🍕
            </span>
            <div className="flex flex-wrap gap-2">
              {fractionSymbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onInsertSymbol(sym)}
                  className="min-w-[44px] h-11 bg-white hover:bg-blue hover:text-white border border-paper-3 hover:border-blue text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {isGeometry && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-blue uppercase tracking-wider">
              Géométrie & Angles 📐
            </span>
            <div className="flex flex-wrap gap-2">
              {geometrySymbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onInsertSymbol(sym)}
                  className="min-w-[44px] h-11 bg-white hover:bg-blue hover:text-white border border-paper-3 hover:border-blue text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {isPowers && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-green uppercase tracking-wider">
              Puissances ⚡
            </span>
            <div className="flex flex-wrap gap-2">
              {powerSymbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onInsertSymbol(sym)}
                  className="min-w-[44px] h-11 bg-white hover:bg-green hover:text-white border border-paper-3 hover:border-green text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {isMeasurement && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-green uppercase tracking-wider">
              Unités & Mesures ⚖️
            </span>
            <div className="flex flex-wrap gap-2">
              {measurementSymbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onInsertSymbol(sym)}
                  className="px-3 h-11 bg-white hover:bg-green hover:text-white border border-paper-3 hover:border-green text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center active:scale-95"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* General / Default calculations group */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-ink-2 uppercase tracking-wider">
            Calculs & Base ➕
          </span>
          <div className="flex flex-wrap gap-2">
            {defaultSymbols.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => onInsertSymbol(sym)}
                className="min-w-[44px] h-11 bg-white hover:bg-ink-2 hover:text-white border border-paper-3 hover:border-ink-2 text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center active:scale-95"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
