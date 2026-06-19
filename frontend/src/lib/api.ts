/**
 * API client for the Sales Dashboard backend
 */

import type {
  AnomalyData,
  CategoryData,
  ChannelMixData,
  DailyRevenueData,
  FestiveUpliftData,
  FilterParams,
  ForecastResponse,
  KPIData,
  RegionalData,
  ReturnRateData,
  StateData,
  TopSKUsData,
  TrendData,
  HeatmapData,
  YoYGrowthData,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type { FilterParams };

function buildQueryString(
  filters?: FilterParams,
  extra?: Record<string, string | boolean>,
): string {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("start_date", filters.startDate);
  if (filters?.endDate) params.append("end_date", filters.endDate);
  if (filters?.regions && filters.regions.length > 0) {
    filters.regions.forEach((r) => params.append("regions", r));
  }
  if (filters?.categories && filters.categories.length > 0) {
    filters.categories.forEach((c) => params.append("categories", c));
  }
  if (filters?.channels && filters.channels.length > 0) {
    filters.channels.forEach((ch) => params.append("channels", ch));
  }
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      params.append(key, String(value));
    });
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

export async function fetchKPIs(filters?: FilterParams): Promise<KPIData> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/kpis${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch KPIs");
  return res.json();
}

export async function fetchRevenueTrend(filters?: FilterParams): Promise<TrendData> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/revenue-trend${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch revenue trend");
  return res.json();
}

export async function fetchYoYGrowth(filters?: FilterParams): Promise<YoYGrowthData> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/yoy-growth${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch YoY growth");
  return res.json();
}

export async function fetchRegional(filters?: FilterParams): Promise<RegionalData[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/regional${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch regional data");
  return res.json();
}

export async function fetchRegionalStates(
  region: string,
  filters?: FilterParams,
): Promise<StateData[]> {
  const query = buildQueryString(filters, { region });
  const res = await fetch(`${API_BASE}/api/regional/states${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch state breakdown");
  return res.json();
}

export async function fetchHeatmap(filters?: FilterParams): Promise<HeatmapData> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/heatmap${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch heatmap");
  return res.json();
}

export async function fetchCategories(filters?: FilterParams): Promise<CategoryData[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/categories${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch category data");
  return res.json();
}

export async function fetchTopSKUs(
  n: number = 10,
  filters?: FilterParams,
): Promise<TopSKUsData> {
  const query = buildQueryString(filters);
  const prefix = query ? `${query}&` : "?";
  const res = await fetch(`${API_BASE}/api/top-skus${prefix}n=${n}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch SKU data");
  return res.json();
}

export async function fetchAnomalies(
  filters?: FilterParams,
  options?: { flaggedOnly?: boolean },
): Promise<AnomalyData> {
  const extra = options?.flaggedOnly ? { flagged_only: true } : undefined;
  const query = buildQueryString(filters, extra);
  const res = await fetch(`${API_BASE}/api/anomalies${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch anomalies");
  return res.json();
}

export async function fetchChannelMix(filters?: FilterParams): Promise<ChannelMixData[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/channel-mix${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch channel mix");
  return res.json();
}

export async function fetchForecast(horizon: number = 6): Promise<ForecastResponse> {
  const res = await fetch(`${API_BASE}/api/forecast?horizon=${horizon}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}

export async function fetchDailyRevenue(
  groupBy?: string,
  filters?: FilterParams,
): Promise<DailyRevenueData> {
  const apiGroupBy =
    groupBy === "product_category" ? "category" : groupBy;
  const baseQuery = buildQueryString(filters);
  let query = baseQuery;
  if (apiGroupBy) {
    query = baseQuery ? `${baseQuery}&group_by=${apiGroupBy}` : `?group_by=${apiGroupBy}`;
  }
  const res = await fetch(`${API_BASE}/api/daily-revenue${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch daily revenue");
  return res.json();
}

export async function fetchFestiveUplift(filters?: FilterParams): Promise<FestiveUpliftData[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/festive-uplift${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch festive uplift");
  return res.json();
}

export async function fetchReturns(filters?: FilterParams): Promise<ReturnRateData[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/returns${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch returns");
  return res.json();
}
