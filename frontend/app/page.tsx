"use client";

import { palette } from "@/lib/palette";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, LineChart, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: BarChart3, label: "KPI Overview" },
  { icon: TrendingUp, label: "Revenue Trends" },
  { icon: LineChart, label: "Prophet Forecast" },
  { icon: Sparkles, label: "Anomaly Detection" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

function FloatingDashboardPreview() {
  const bars = [42, 68, 55, 82, 61, 90, 74];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.8 }}
      className="relative w-full max-w-lg mx-auto"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-[#880d1e]/10 overflow-hidden"
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="w-2.5 h-2.5 rounded-full bg-[#dd2d4a]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f49cbb]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#880d1e]" />
          <span className="ml-2 text-xs font-medium text-gray-500">Sales Performance Dashboard</span>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Revenue", value: "₹12.4M" },
              { label: "Margin", value: "18.2%" },
              { label: "Velocity", value: "₹2.1L/d" },
              { label: "Anomalies", value: "6 flagged" },
            ].map((kpi, i) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                  {kpi.label}
                </p>
                <p className="mt-1 text-sm font-bold text-[#0a0a0a]">{kpi.value}</p>
                <div
                  className="mt-2 h-0.5 w-8 rounded-full"
                  style={{ backgroundColor: i % 2 === 0 ? palette.maroon : palette.crimson }}
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3">Monthly revenue</p>
            <div className="h-28 flex items-end gap-1.5">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{
                    background: `linear-gradient(to top, ${palette.maroon}, ${palette.pink})`,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.45 }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {[palette.maroon, palette.crimson, palette.pink, "#0a0a0a"].map((color) => (
              <div
                key={color}
                className="h-2 flex-1 rounded-full opacity-80"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-4 top-8 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg hidden md:block"
      >
        <p className="text-[10px] text-gray-500 font-medium">West region</p>
        <p className="text-sm font-bold" style={{ color: palette.maroon }}>
          29.9% share
        </p>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-4 bottom-12 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg hidden md:block"
      >
        <p className="text-[10px] text-gray-500 font-medium">MoM growth</p>
        <p className="text-sm font-bold" style={{ color: palette.crimson }}>
          +8.4%
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#0a0a0a]">
      <header className="relative z-10 border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: palette.maroon }}
            >
              <BarChart3 className="w-5 h-5 text-white" aria-hidden />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Sales<span style={{ color: palette.maroon }}>Analytics</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
          <div>
            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-[#0a0a0a]"
            >
              Unleash clarity with top{" "}
              <span style={{ color: palette.pink }}>sales insights</span>
            </motion.h1>

            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-base sm:text-lg text-gray-700 leading-relaxed max-w-lg"
            >
              Track FMCG revenue, forecast demand with Prophet, and flag anomalies — one
              dashboard built for distribution teams who need signal, not noise.
            </motion.p>

            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10"
            >
              <Link href="/dashboard">
                <motion.span
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-semibold text-base cursor-pointer shadow-lg"
                  style={{
                    backgroundColor: palette.maroon,
                    boxShadow: `0 12px 32px ${palette.maroon}40`,
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Open Dashboard
                  <ArrowRight className="w-5 h-5" aria-hidden />
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-12 flex flex-wrap gap-2"
            >
              {FEATURES.map((item, i) => (
                <motion.span
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.07 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-800"
                >
                  <item.icon className="w-3.5 h-3.5" style={{ color: palette.crimson }} />
                  {item.label}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <div className="hidden sm:block">
            <FloatingDashboardPreview />
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-xs text-gray-500 border-t border-gray-100">
        <p>
          Built by <span className="font-semibold text-[#0a0a0a]">Ahmed Moosani</span> — MBA
          Tech (AI), MPSTME NMIMS Mumbai · 2026
        </p>
      </footer>
    </div>
  );
}
