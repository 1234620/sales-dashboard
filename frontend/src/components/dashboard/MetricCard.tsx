import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | null;
  compareDelta?: string | null;
  changeType?: "positive" | "negative" | "neutral";
  color: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  compareDelta,
  changeType = "neutral",
  color,
  delay = 0,
}: MetricCardProps) {
  const isPositive = changeType === "positive";
  const isNeutral = changeType === "neutral";

  return (
    <div
      className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
      style={{
        animation: `slideUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}
      />
      <div className="relative p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
          {title}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
              {value}
            </p>
            {change && (
              <p
                className={`text-xs mt-2 flex items-center gap-1 font-semibold ${
                  isNeutral
                    ? "text-slate-400"
                    : isPositive
                      ? "text-emerald-400"
                      : "text-red-400"
                }`}
              >
                {!isNeutral && (isPositive ? "↑" : "↓")} {change}
              </p>
            )}
            {compareDelta && (
              <p className="text-xs mt-1 font-semibold text-indigo-300">{compareDelta}</p>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-300 flex items-center justify-center`}
          >
            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${color} opacity-80`} />
          </div>
        </div>
      </div>
    </div>
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
    return (
      <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-2xl text-sm">
        Failed to load this section: {error}
      </div>
    );
  }

  if (loading && !hasData) {
    return skeleton ?? <SectionSkeleton />;
  }

  return (
    <div className="relative">
      {loading && hasData && (
        <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-[1px] rounded-2xl flex items-start justify-end p-3">
          <span className="text-xs font-semibold text-indigo-300 bg-slate-900/90 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
            Refreshing…
          </span>
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
          <div key={i} className="h-32 rounded-2xl bg-slate-800/60 border border-slate-800" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-slate-800/60 border border-slate-800" />
    </div>
  );
}

export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <div
      className="rounded-2xl bg-slate-800/60 border border-slate-800 animate-pulse"
      style={{ height }}
    />
  );
}
