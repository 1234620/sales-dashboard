/**
 * API client for the Sales Dashboard backend
 */

const API_BASE = "http://localhost:8000";

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  regions?: string[];
  categories?: string[];
  channels?: string[];
}

function buildQueryString(filters?: FilterParams): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.startDate) params.append("start_date", filters.startDate);
  if (filters.endDate) params.append("end_date", filters.endDate);
  if (filters.regions && filters.regions.length > 0) {
    filters.regions.forEach(r => params.append("regions", r));
  }
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach(c => params.append("categories", c));
  }
  if (filters.channels && filters.channels.length > 0) {
    filters.channels.forEach(ch => params.append("channels", ch));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

interface KPIData {
  total_revenue: number;
  average_order_value: number;
  discount_impact_rate: number;
  sales_velocity: number;
  repeat_purchase_rate: number;
  contribution_margin: number;
  total_transactions: number;
  unique_customers: number;
  mom_growth: number;
}

interface TrendData {
  data: Array<{
    year_month: string;
    revenue: number;
    mom_growth_pct: number;
  }>;
}

interface RegionalData {
  region: string;
  revenue: number;
  share_pct: number;
}

interface CategoryData {
  product_category: string;
  revenue: number;
  margin: number;
  margin_pct: number;
}

interface SKUData {
  product_sku: string;
  revenue: number;
  quantity: number;
}

interface AnomalyData {
  data: Array<{
    date: string;
    daily_revenue: number;
    rolling_mean: number;
    z_score: number;
    is_anomaly: boolean;
  }>;
  total_days: number;
  anomalies_count: number;
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

export async function fetchRegional(filters?: FilterParams): Promise<RegionalData[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/regional${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch regional data");
  return res.json();
}

export async function fetchCategories(filters?: FilterParams): Promise<CategoryData[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/categories${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch category data");
  return res.json();
}

export async function fetchTopSKUs(n: number = 10, filters?: FilterParams): Promise<{ top: SKUData[]; bottom: SKUData[] }> {
  const query = buildQueryString(filters);
  const prefix = query ? `${query}&` : "?";
  const res = await fetch(`${API_BASE}/api/top-skus${prefix}n=${n}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch SKU data");
  return res.json();
}

export async function fetchAnomalies(filters?: FilterParams): Promise<AnomalyData> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/anomalies${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch anomalies");
  return res.json();
}

export async function fetchChannelMix(filters?: FilterParams): Promise<Array<{ channel: string; revenue: number; share_pct: number }>> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/channel-mix${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch channel mix");
  return res.json();
}

export async function fetchForecast(horizon: number = 6): Promise<any> {
  const res = await fetch(`${API_BASE}/api/forecast?horizon=${horizon}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}

export async function fetchDailyRevenue(groupBy?: string, filters?: FilterParams): Promise<{ data: any[] }> {
  const baseQuery = buildQueryString(filters);
  let query = baseQuery;
  if (groupBy) {
    query = baseQuery ? `${baseQuery}&group_by=${groupBy}` : `?group_by=${groupBy}`;
  }
  const res = await fetch(`${API_BASE}/api/daily-revenue${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch daily revenue");
  return res.json();
}

export async function fetchFestiveUplift(filters?: FilterParams): Promise<any[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/festive-uplift${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch festive uplift");
  return res.json();
}

export async function fetchReturns(filters?: FilterParams): Promise<any[]> {
  const query = buildQueryString(filters);
  const res = await fetch(`${API_BASE}/api/returns${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch returns");
  return res.json();
}
