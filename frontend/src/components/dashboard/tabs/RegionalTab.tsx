"use client";

import { CHART_COLORS } from "@/components/dashboard/constants";
import { PieSliceLabel } from "@/components/dashboard/chart-primitives";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import type { FilterParams, RegionalSection, StateData } from "@/lib/types";
import { CHART_TOOLTIP_STYLE } from "@/lib/chart-utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useCallback, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface RegionalTabProps {
  section: RegionalSection;
  filterParams: FilterParams;
  onFilterDashboardToRegion?: (region: string) => void;
}

export function RegionalTab({
  section,
  filterParams,
  onFilterDashboardToRegion,
}: RegionalTabProps) {
  const { data: regionalData, loading, error } = section;
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [stateData, setStateData] = useState<StateData[] | null>(null);
  const [statesLoading, setStatesLoading] = useState(false);
  const [statesError, setStatesError] = useState<string | null>(null);

  const handleRegionSelect = useCallback(
    async (region: string) => {
      setSelectedRegion(region);
      setStatesLoading(true);
      setStatesError(null);
      try {
        const rows = await api.fetchRegionalStates(region, filterParams);
        setStateData(rows);
      } catch (err) {
        setStateData(null);
        setStatesError(err instanceof Error ? err.message : "Failed to load states");
      } finally {
        setStatesLoading(false);
      }
    },
    [filterParams],
  );

  const resetDrillDown = () => {
    setSelectedRegion(null);
    setStateData(null);
    setStatesError(null);
  };

  return (
    <TabSection loading={loading} error={error} hasData={!!regionalData}>
      {regionalData && (
        <div className="space-y-8">
          {selectedRegion && (
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={resetDrillDown}
                className="text-[#880d1e] hover:text-[#880d1e] font-semibold"
              >
                All Regions
              </button>
              <span className="text-gray-400">›</span>
              <span className="text-gray-800 font-bold">{selectedRegion}</span>
              {onFilterDashboardToRegion && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2 text-xs border-slate-700"
                  onClick={() => onFilterDashboardToRegion(selectedRegion)}
                >
                  Filter dashboard to {selectedRegion}
                </Button>
              )}
            </nav>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Regional Revenue Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Click a slice or row to drill down by state
                  </CardDescription>
                </div>
                <ExportCsvButton
                  tab="regional"
                  rows={regionalData}
                  disabled={loading}
                  columns={[
                    { key: "region", header: "region" },
                    { key: "revenue", header: "revenue" },
                    { key: "share_pct", header: "share_pct" },
                  ]}
                />
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                    <Pie
                      data={regionalData}
                      dataKey="revenue"
                      nameKey="region"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={58}
                      paddingAngle={2}
                      stroke="#0f172a"
                      strokeWidth={2}
                      label={PieSliceLabel}
                      labelLine={false}
                      onClick={(_data, index) => {
                        const region = regionalData[index]?.region;
                        if (region) void handleRegionSelect(region);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {regionalData.map((entry, index) => (
                        <Cell
                          key={entry.region}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          opacity={
                            selectedRegion && selectedRegion !== entry.region ? 0.35 : 1
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(val: number, _name, item) => [
                        `${formatCurrency(val)} (${formatPercent(item.payload.share_pct)})`,
                        item.payload.region,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Regional Details</CardTitle>
                <CardDescription className="text-gray-500">
                  Detailed list of performance statistics by territory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData.map((reg, index) => (
                    <button
                      type="button"
                      key={reg.region}
                      onClick={() => void handleRegionSelect(reg.region)}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                        selectedRegion === reg.region
                          ? "bg-[#880d1e]/5 border-[#880d1e]/50"
                          : "bg-gray-50 border-gray-200 hover:border-[#880d1e]/40"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-gray-800">{reg.region}</p>
                        <div className="w-48 bg-gray-100 rounded-full h-1.5 mt-2">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${reg.share_pct}%`,
                              backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-[#880d1e]">
                          {formatCurrency(reg.revenue)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatPercent(reg.share_pct)} share
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedRegion && (
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {selectedRegion} — State Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Revenue share by state within {selectedRegion}
                  </CardDescription>
                </div>
                {stateData && stateData.length > 0 && (
                  <ExportCsvButton
                    tab="regional-states"
                    rows={stateData}
                    disabled={statesLoading}
                    suffix={selectedRegion.toLowerCase().replace(/\s+/g, "-")}
                    columns={[
                      { key: "state", header: "state" },
                      { key: "revenue", header: "revenue" },
                      { key: "share_pct", header: "share_pct" },
                    ]}
                  />
                )}
              </CardHeader>
              <CardContent>
                {statesLoading && (
                  <p className="text-sm text-gray-500 py-4">Loading state breakdown…</p>
                )}
                {statesError && (
                  <p className="text-sm text-red-400 py-4">{statesError}</p>
                )}
                {!statesLoading && !statesError && stateData?.length === 0 && (
                  <p className="text-sm text-gray-500 py-4">No state data for this region.</p>
                )}
                {stateData && stateData.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="py-3 px-4">State</th>
                          <th className="py-3 px-4 text-right">Revenue</th>
                          <th className="py-3 px-4 text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stateData.map((row) => (
                          <tr
                            key={row.state}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 font-semibold text-gray-800">
                              {row.state}
                            </td>
                            <td className="py-3 px-4 text-right text-[#880d1e]">
                              {formatCurrency(row.revenue)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500">
                              {formatPercent(row.share_pct)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </TabSection>
  );
}
