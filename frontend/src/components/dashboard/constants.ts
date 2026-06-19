export const CHART_COLORS = [
  "#880d1e",
  "#dd2d4a",
  "#f49cbb",
  "#6e0a18",
  "#0a0a0a",
  "#c42d48",
  "#fce4ef",
  "#a80c22",
] as const;

/** Distinct palette + dash patterns for multi-series trend lines (6+ groups). */
export const GROUPED_LINE_STYLES = [
  { stroke: "#6366F1", strokeDasharray: undefined },
  { stroke: "#F59E0B", strokeDasharray: "6 3" },
  { stroke: "#10B981", strokeDasharray: "2 2" },
  { stroke: "#EF4444", strokeDasharray: "8 4 2 4" },
  { stroke: "#EC4899", strokeDasharray: "4 4" },
  { stroke: "#14B8A6", strokeDasharray: "10 3" },
  { stroke: "#8B5CF6", strokeDasharray: "3 6" },
  { stroke: "#3B82F6", strokeDasharray: "1 3" },
  { stroke: "#F97316", strokeDasharray: "6 2 2 2" },
  { stroke: "#84CC16", strokeDasharray: "5 5" },
] as const;

export const MAPE_THRESHOLD = 12;

/** Default rows shown in the anomalies table before "View all". */
export const ANOMALY_TABLE_TOP_N = 15;

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
