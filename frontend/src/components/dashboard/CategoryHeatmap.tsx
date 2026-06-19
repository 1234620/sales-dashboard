"use client";

import { CHART_COLORS } from "@/components/dashboard/constants";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import type { HeatmapData } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useMemo } from "react";

interface CategoryHeatmapProps {
  data: HeatmapData | null;
  loading?: boolean;
}

function heatColor(value: number, max: number): string {
  if (max <= 0) return "#1e293b";
  const t = Math.min(1, value / max);
  const r = Math.round(30 + t * (99 - 30));
  const g = Math.round(41 + t * (102 - 41));
  const b = Math.round(59 + t * (241 - 59));
  return `rgb(${r},${g},${b})`;
}

export function CategoryHeatmap({ data, loading = false }: CategoryHeatmapProps) {
  const { maxValue, flatRows } = useMemo(() => {
    if (!data?.values.length) {
      return { maxValue: 0, flatRows: [] as Record<string, unknown>[] };
    }
    let max = 0;
    const rows: Record<string, unknown>[] = [];
    data.regions.forEach((region, ri) => {
      data.categories.forEach((category, ci) => {
        const value = data.values[ri]?.[ci] ?? 0;
        if (value > max) max = value;
        rows.push({ region, category, revenue: value });
      });
    });
    return { maxValue: max, flatRows: rows };
  }, [data]);

  if (!data?.regions.length) return null;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1 min-w-full"
          style={{
            gridTemplateColumns: `minmax(6rem, auto) repeat(${data.categories.length}, minmax(4.5rem, 1fr))`,
          }}
        >
          <div />
          {data.categories.map((cat) => (
            <div
              key={cat}
              className="text-[10px] font-semibold text-slate-400 text-center px-1 pb-1 truncate"
              title={cat}
            >
              {cat.split(" ")[0]}
            </div>
          ))}
          {data.regions.map((region, ri) => (
            <div key={region} className="contents">
              <div className="text-xs font-bold text-slate-300 pr-2 flex items-center">
                {region}
              </div>
              {data.categories.map((category, ci) => {
                const value = data.values[ri]?.[ci] ?? 0;
                return (
                  <div
                    key={`${region}-${category}`}
                    className="rounded-md border border-slate-800 flex items-center justify-center text-[10px] font-semibold min-h-[2.25rem] px-1"
                    style={{
                      backgroundColor: heatColor(value, maxValue),
                      color: value > maxValue * 0.55 ? "#fff" : "#cbd5e1",
                    }}
                    title={`${region} · ${category}: ${formatCurrency(value)}`}
                  >
                    {value >= 1_000_000
                      ? `${(value / 1_000_000).toFixed(1)}M`
                      : value >= 1_000
                        ? `${(value / 1_000).toFixed(0)}K`
                        : value.toFixed(0)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Low</span>
          <div
            className="h-2 w-24 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${CHART_COLORS[0]}33, ${CHART_COLORS[0]})`,
            }}
          />
          <span>High revenue</span>
        </div>
        <ExportCsvButton
          tab="heatmap"
          rows={flatRows}
          disabled={loading}
          columns={[
            { key: "region", header: "region" },
            { key: "category", header: "category" },
            { key: "revenue", header: "revenue" },
          ]}
        />
      </div>
    </div>
  );
}
