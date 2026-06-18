export const CHART_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
] as const;

export const ALL_REGIONS = [
  "Central",
  "East",
  "North",
  "North-East",
  "South",
  "West",
] as const;

export const ALL_CATEGORIES = [
  "Bakery & Biscuits",
  "Beverages",
  "Confectionery",
  "Culinary",
  "Spice Mixes",
] as const;

export const ALL_CHANNELS = ["offline", "online"] as const;

export const DEFAULT_START_DATE = "2023-01-01";
export const DEFAULT_END_DATE = "2026-04-30";

export const TAB_OPTIONS = [
  { value: "overview", label: "KPI Overview" },
  { value: "regional", label: "Regional" },
  { value: "products", label: "Product Performance" },
  { value: "trends", label: "Trend Analysis" },
  { value: "forecasting", label: "Forecasting" },
  { value: "anomalies", label: "Anomaly Detection" },
  { value: "margins", label: "Margins & Profit" },
] as const;
