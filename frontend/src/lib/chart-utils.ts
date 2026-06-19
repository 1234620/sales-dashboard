/**
 * Shared helpers for Recharts axis formatting, tick density, and labels.
 */

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e5e7eb",
  borderRadius: "10px",
  color: "#1f2937",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
} as const;

export const CHART_AXIS_TICK = { fill: "#6b7280", fontSize: 11 } as const;

export const CHART_LEGEND_STYLE = {
  color: "#374151",
  fontSize: 12,
} as const;

export function formatYearMonth(ym: string): string {
  if (!ym) return "";
  const [year, month] = ym.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function formatShortDate(dateStr: string): string {
  const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function computeTickInterval(count: number, targetTicks = 8): number {
  if (count <= targetTicks) return 0;
  return Math.ceil(count / targetTicks) - 1;
}

export function truncateLabel(label: string, maxLen = 28): string {
  if (label.length <= maxLen) return label;
  return `${label.slice(0, maxLen - 1)}…`;
}

export function computeMape(
  points: { actual: number; predicted: number }[],
): number | null {
  const valid = points.filter((p) => p.actual !== 0);
  if (valid.length === 0) return null;
  const sum = valid.reduce(
    (acc, p) => acc + Math.abs((p.actual - p.predicted) / p.actual),
    0,
  );
  return (sum / valid.length) * 100;
}

export function upliftBarColor(pct: number): string {
  if (pct >= 40) return "#10B981";
  if (pct >= 20) return "#6366F1";
  if (pct >= 0) return "#F59E0B";
  return "#EF4444";
}

export function normalizeDateKey(ds: string): string {
  return ds.split("T")[0].substring(0, 10);
}
