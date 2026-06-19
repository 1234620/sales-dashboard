"use client";

import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useState } from "react";

interface InsightsPanelProps {
  insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-amber-950/30 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-200">
          <Lightbulb className="h-4 w-4" aria-hidden />
          Insights
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-amber-300" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-300" aria-hidden />
        )}
      </button>
      {open && (
        <ul className="px-5 pb-4 space-y-2">
          {insights.map((line) => (
            <li key={line} className="text-sm text-amber-100/90 flex gap-2">
              <span className="text-amber-400 shrink-0">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
