"use client";

import { dashboardTheme } from "@/components/dashboard/theme";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface InsightsPanelProps {
  insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={dashboardTheme.insights}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-amber-100/50 transition-colors"
      >
        <span className={`flex items-center gap-2 ${dashboardTheme.insightsTitle}`}>
          <Lightbulb className="h-4 w-4 text-amber-600" aria-hidden />
          Insights
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-amber-700" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-700" aria-hidden />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-4 space-y-2 overflow-hidden"
          >
            {insights.map((line) => (
              <li key={line} className={`${dashboardTheme.insightsText} flex gap-2`}>
                <span className="text-amber-600 shrink-0">•</span>
                <span>{line}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
