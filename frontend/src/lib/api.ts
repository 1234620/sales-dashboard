/**
 * API client for the Sales Dashboard backend
 */

const API_BASE = "http://localhost:8000";

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

export async function fetchKPIs(): Promise<KPIData> {
  const res = await fetch(`${API_BASE}/api/kpis`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch KPIs");
  return res.json();
}

export async function fetchRevenueTrend(): Promise<TrendData> {
  const res = await fetch(`${API_BASE}/api/revenue-trend`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch revenue trend");
  return res.json();
}

export async function fetchRegional(): Promise<RegionalData[]> {
  const res = await fetch(`${API_BASE}/api/regional`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch regional data");
  return res.json();
}

export async function fetchCategories(): Promise<CategoryData[]> {
  const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch category data");
  return res.json();
}

export async function fetchTopSKUs(n: number = 10): Promise<{ top: SKUData[]; bottom: SKUData[] }> {
  const res = await fetch(`${API_BASE}/api/top-skus?n=${n}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch SKU data");
  return res.json();
}

export async function fetchAnomalies(): Promise<AnomalyData> {
  const res = await fetch(`${API_BASE}/api/anomalies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch anomalies");
  return res.json();
}

export async function fetchChannelMix(): Promise<Array<{ channel: string; revenue: number; share_pct: number }>> {
  const res = await fetch(`${API_BASE}/api/channel-mix`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch channel mix");
  return res.json();
}

export async function fetchForecast(horizon: number = 6): Promise<any> {
  const res = await fetch(`${API_BASE}/api/forecast?horizon=${horizon}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}
