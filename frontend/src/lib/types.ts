export interface FilterParams {
  startDate?: string;
  endDate?: string;
  regions?: string[];
  categories?: string[];
  channels?: string[];
}

export interface KPIData {
  total_revenue: number;
  average_order_value: number;
  discount_impact_rate: number;
  sales_velocity: number;
  repeat_purchase_rate: number;
  contribution_margin: number;
  total_transactions: number;
  unique_customers: number;
  mom_growth: number;
  yoy_growth: number;
}

export interface RevenueTrendPoint {
  year_month: string;
  revenue: number;
  mom_growth_pct: number;
}

export interface TrendData {
  data: RevenueTrendPoint[];
}

export interface YoYGrowthPoint {
  month: number;
  label: string;
  yoy_growth_pct: number | null;
  current_revenue: number;
  prior_revenue: number;
}

export interface YoYGrowthData {
  data: YoYGrowthPoint[];
}

export interface RegionalData {
  region: string;
  revenue: number;
  share_pct: number;
}

export interface CategoryData {
  product_category: string;
  revenue: number;
  margin: number;
  margin_pct: number;
}

export interface SKUData {
  product_sku: string;
  revenue: number;
  quantity: number;
}

export interface TopSKUsData {
  top: SKUData[];
  bottom: SKUData[];
}

export interface AnomalyPoint {
  date: string;
  daily_revenue: number;
  rolling_mean: number;
  z_score: number;
  revenue_deviation?: number;
  is_anomaly: boolean;
}

export interface AnomalyData {
  data: AnomalyPoint[];
  total_days: number;
  anomalies_count: number;
  zscore_threshold?: number;
  rolling_window_days?: number;
  min_revenue_delta?: number;
  exclude_festive_days?: boolean;
}

export interface ChannelMixData {
  channel: string;
  revenue: number;
  share_pct: number;
}

export interface DailyRevenueRow {
  date: string;
  net_revenue: number;
  region?: string;
  product_category?: string;
}

export interface DailyRevenueData {
  data: DailyRevenueRow[];
}

export interface FestiveUpliftData {
  festival: string;
  festive_daily_avg: number;
  normal_daily_avg: number;
  uplift_pct: number;
}

export interface ReturnRateData {
  product_category: string;
  total_units: number;
  returned_units: number;
  return_rate: number;
}

export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
  y?: number;
}

export interface ForecastValidationPoint {
  ds: string;
  y: number;
}

export interface ForecastData {
  forecast: ForecastPoint[];
  validation: ForecastValidationPoint[];
  training_periods: number;
}

export type ForecastResponse = ForecastData | { error: string };

export type TrendGroupBy = "region" | "product_category" | null;

export interface UngroupedTrendPoint {
  date: string;
  revenue: number;
  ma30: number;
  ma90: number;
}

export type GroupedTrendPoint = { date: string } & Record<string, number | string>;

export type ProcessedTrendPoint = UngroupedTrendPoint | GroupedTrendPoint;

export type DashboardTab =
  | "overview"
  | "regional"
  | "products"
  | "trends"
  | "forecasting"
  | "anomalies"
  | "margins";

export interface SectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type OverviewSection = SectionState<{
  kpis: KPIData;
  trend: TrendData;
  yoy: YoYGrowthData;
}>;

export type RegionalSection = SectionState<RegionalData[]>;
export type ProductsSection = SectionState<{
  categories: CategoryData[];
  skus: TopSKUsData;
}>;
export type TrendsSection = SectionState<DailyRevenueData>;
export type ForecastSection = SectionState<ForecastData>;
export type AnomaliesSection = SectionState<{
  series: AnomalyData;
  flagged: AnomalyData;
}>;
export type MarginsSection = SectionState<{
  returns: ReturnRateData[];
  channel: ChannelMixData[];
  festive: FestiveUpliftData[];
}>;

export interface FilterState {
  startDate: string;
  endDate: string;
  selectedRegions: string[];
  selectedCategories: string[];
  selectedChannels: string[];
}
