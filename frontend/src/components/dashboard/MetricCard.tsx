"use client";

import { dashboardTheme } from "@/components/dashboard/theme";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | null;
  compareDelta?: string | null;
  changeType?: "positive" | "negative" | "neutral";
  accent?: "blue" | "teal" | "orange" | "rose" | "purple" | "cyan" | "pink" | "sky";
  delay?: number;
}

const ACCENT_BAR: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  blue: "bg-[#5D87FF]",
  teal: "bg-[#13DEB9]",
  orange: "bg-[#FFAE1F]",
  rose: "bg-[#FA896B]",
  purple: "bg-[#763EBD]",
  cyan: "bg-[#49BEFF]",
  pink: "bg-[#FA896B]",
  sky: "bg-[#0074BA]",
};

export function MetricCard({
  title,
  value,
  change,
  compareDelta,
  changeType = "neutral",
  accent = "blue",
  delay = 0,
}: MetricCardProps) {
  const isPositive = changeType === "positive";
  const isNeutral = changeType === "neutral";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay / 1000, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(93,135,255,0.12)] transition-shadow duration-300`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${ACCENT_BAR[accent]}`} />
      <div className="p-5 pl-6">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-2">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        {change && (
          <p
            className={`text-xs mt-2 flex items-center gap-1 font-medium ${
              isNeutral
                ? "text-gray-500"
                : isPositive
                  ? "text-emerald-600"
                  : "text-rose-600"
            }`}
          >
            {!isNeutral && (isPositive ? "↑" : "↓")} {change}
          </p>
        )}
        {compareDelta && (
          <p className="text-xs mt-1 font-semibold text-[#5D87FF]">{compareDelta}</p>
        )}
      </div>
    </motion.div>
  );
}

interface TabSectionProps {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
}

export function TabSection({
  loading,
  error,
  hasData,
  children,
  skeleton,
}: TabSectionProps) {
  if (error) {
    return <div className={dashboardTheme.error}>Failed to load this section: {error}</div>;
  }

  if (loading && !hasData) {
    return skeleton ?? <SectionSkeleton />;
  }

  return (
    <div className="relative">
      {loading && hasData && (
        <div className={dashboardTheme.refreshOverlay}>
          <span className={dashboardTheme.refreshBadge}>Refreshing…</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 border border-gray-200" />
        ))}
      </div>
      <div className="h-80 rounded-xl bg-gray-100 border border-gray-200" />
    </div>
  );
}

export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <div
      className="rounded-xl bg-gray-100 border border-gray-200 animate-pulse"
      style={{ height }}
    />
  );
}
