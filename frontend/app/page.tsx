"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import {
  countActiveFilters,
  FilterPanel,
  getDefaultFilters,
  toFilterParams,
} from "@/components/dashboard/FilterPanel";
import { AnomaliesTab } from "@/components/dashboard/tabs/AnomaliesTab";
import { ForecastingTab } from "@/components/dashboard/tabs/ForecastingTab";
import { MarginsTab } from "@/components/dashboard/tabs/MarginsTab";
import { OverviewTab } from "@/components/dashboard/tabs/OverviewTab";
import { ProductsTab } from "@/components/dashboard/tabs/ProductsTab";
import { RegionalTab } from "@/components/dashboard/tabs/RegionalTab";
import { TrendsTab } from "@/components/dashboard/tabs/TrendsTab";
import { useDebounce } from "@/hooks/useDebounce";
import * as api from "@/lib/api";
import { processTrendData } from "@/lib/trend-data";
import type {
  AnomaliesSection,
  DashboardTab,
  FilterState,
  ForecastSection,
  MarginsSection,
  OverviewSection,
  ProductsSection,
  RegionalSection,
  TrendGroupBy,
  TrendsSection,
} from "@/lib/types";
import { formatNumber } from "@/lib/format";

function emptySection<T>(): { data: T | null; loading: boolean; error: string | null } {
  return { data: null, loading: true, error: null };
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed";
}

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters);
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [trendGroupBy, setTrendGroupBy] = useState<TrendGroupBy>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const [overview, setOverview] = useState<OverviewSection>(emptySection);
  const [regional, setRegional] = useState<RegionalSection>(emptySection);
  const [products, setProducts] = useState<ProductsSection>(emptySection);
  const [trends, setTrends] = useState<TrendsSection>(emptySection);
  const [forecast, setForecast] = useState<ForecastSection>(emptySection);
  const [anomalies, setAnomalies] = useState<AnomaliesSection>(emptySection);
  const [margins, setMargins] = useState<MarginsSection>(emptySection);

  const filterParams = useMemo(
    () => toFilterParams(filters),
    [
      filters.startDate,
      filters.endDate,
      filters.selectedRegions,
      filters.selectedCategories,
      filters.selectedChannels,
    ],
  );
  const debouncedFilterParams = useDebounce(filterParams, 300);
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const dashboardRequestId = useRef(0);

  const loadDashboardData = useCallback(async () => {
    const requestId = ++dashboardRequestId.current;

    const setLoading = () => {
      setOverview((s) => ({ ...s, loading: true, error: null }));
      setRegional((s) => ({ ...s, loading: true, error: null }));
      setProducts((s) => ({ ...s, loading: true, error: null }));
      setTrends((s) => ({ ...s, loading: true, error: null }));
      setAnomalies((s) => ({ ...s, loading: true, error: null }));
      setMargins((s) => ({ ...s, loading: true, error: null }));
    };

    setLoading();

    const groupBy = trendGroupBy ?? undefined;
    const isStale = () => requestId !== dashboardRequestId.current;

    const [
      kpisResult,
      trendResult,
      yoyResult,
      regionalResult,
      productsCategoriesResult,
      productsSkusResult,
      trendsResult,
      anomaliesSeriesResult,
      anomaliesFlaggedResult,
      marginsReturnsResult,
      marginsChannelResult,
      marginsFestiveResult,
    ] = await Promise.allSettled([
      api.fetchKPIs(debouncedFilterParams),
      api.fetchRevenueTrend(debouncedFilterParams),
      api.fetchYoYGrowth(debouncedFilterParams),
      api.fetchRegional(debouncedFilterParams),
      api.fetchCategories(debouncedFilterParams),
      api.fetchTopSKUs(10, debouncedFilterParams),
      api.fetchDailyRevenue(groupBy, debouncedFilterParams),
      api.fetchAnomalies(debouncedFilterParams),
      api.fetchAnomalies(debouncedFilterParams, { flaggedOnly: true }),
      api.fetchReturns(debouncedFilterParams),
      api.fetchChannelMix(debouncedFilterParams),
      api.fetchFestiveUplift(debouncedFilterParams),
    ]);

    if (isStale()) return;

    const kpis = kpisResult.status === "fulfilled" ? kpisResult.value : null;
    const trend = trendResult.status === "fulfilled" ? trendResult.value : null;
    const yoy =
      yoyResult.status === "fulfilled" ? yoyResult.value : { data: [] };

    if (kpis && trend) {
      setOverview({ data: { kpis, trend, yoy }, loading: false, error: null });
    } else {
      const err =
        kpisResult.status === "rejected"
          ? getErrorMessage(kpisResult.reason)
          : trendResult.status === "rejected"
            ? getErrorMessage(trendResult.reason)
            : "Failed to load overview data";
      setOverview((s) => ({ ...s, loading: false, error: err }));
    }

      if (regionalResult.status === "fulfilled") {
        setRegional({ data: regionalResult.value, loading: false, error: null });
      } else {
        setRegional((s) => ({
          ...s,
          loading: false,
          error: getErrorMessage(regionalResult.reason),
        }));
      }

      const categoriesOk = productsCategoriesResult.status === "fulfilled";
      const skusOk = productsSkusResult.status === "fulfilled";
      if (categoriesOk && skusOk) {
        setProducts({
          data: {
            categories: productsCategoriesResult.value,
            skus: productsSkusResult.value,
          },
          loading: false,
          error: null,
        });
      } else {
        const err =
          productsCategoriesResult.status === "rejected"
            ? getErrorMessage(productsCategoriesResult.reason)
            : getErrorMessage(
                productsSkusResult.status === "rejected"
                  ? productsSkusResult.reason
                  : "Failed to load SKU data",
              );
        setProducts((s) => ({ ...s, loading: false, error: err }));
      }

      if (trendsResult.status === "fulfilled") {
        setTrends({ data: trendsResult.value, loading: false, error: null });
      } else {
        setTrends((s) => ({
          ...s,
          loading: false,
          error: getErrorMessage(trendsResult.reason),
        }));
      }

      if (
        anomaliesSeriesResult.status === "fulfilled" &&
        anomaliesFlaggedResult.status === "fulfilled"
      ) {
        setAnomalies({
          data: {
            series: anomaliesSeriesResult.value,
            flagged: anomaliesFlaggedResult.value,
          },
          loading: false,
          error: null,
        });
      } else {
        const err =
          anomaliesSeriesResult.status === "rejected"
            ? getErrorMessage(anomaliesSeriesResult.reason)
            : getErrorMessage(
                anomaliesFlaggedResult.status === "rejected"
                  ? anomaliesFlaggedResult.reason
                  : "Failed to load anomalies",
              );
        setAnomalies((s) => ({ ...s, loading: false, error: err }));
      }

      const returnsOk = marginsReturnsResult.status === "fulfilled";
      const channelOk = marginsChannelResult.status === "fulfilled";
      const festiveOk = marginsFestiveResult.status === "fulfilled";
      if (returnsOk && channelOk && festiveOk) {
        setMargins({
          data: {
            returns: marginsReturnsResult.value,
            channel: marginsChannelResult.value,
            festive: marginsFestiveResult.value,
          },
          loading: false,
          error: null,
        });
      } else {
        const err = !returnsOk
          ? getErrorMessage(
              marginsReturnsResult.status === "rejected"
                ? marginsReturnsResult.reason
                : "Failed",
            )
          : !channelOk
            ? getErrorMessage(
                marginsChannelResult.status === "rejected"
                  ? marginsChannelResult.reason
                  : "Failed",
              )
            : getErrorMessage(
                marginsFestiveResult.status === "rejected"
                  ? marginsFestiveResult.reason
                  : "Failed",
              );
        setMargins((s) => ({ ...s, loading: false, error: err }));
      }
  }, [debouncedFilterParams, trendGroupBy]);

  const forecastRequestId = useRef(0);

  const loadForecastData = useCallback(async () => {
    const requestId = ++forecastRequestId.current;
    setForecast((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.fetchForecast(forecastHorizon);
      if (requestId !== forecastRequestId.current) return;
      if ("error" in res) {
        setForecast({ data: null, loading: false, error: res.error });
      } else {
        setForecast({ data: res, loading: false, error: null });
      }
    } catch (err) {
      if (requestId !== forecastRequestId.current) return;
      setForecast({ data: null, loading: false, error: getErrorMessage(err) });
    }
  }, [forecastHorizon]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    void loadForecastData();
  }, [loadForecastData]);

  const processedTrendData = useMemo(
    () => processTrendData(trends.data, trendGroupBy),
    [trends.data, trendGroupBy],
  );

  const toggleRegion = (reg: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(reg)
        ? prev.selectedRegions.filter((r) => r !== reg)
        : [...prev.selectedRegions, reg],
    }));
  };

  const toggleCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(cat)
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat],
    }));
  };

  const toggleChannel = (ch: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedChannels: prev.selectedChannels.includes(ch)
        ? prev.selectedChannels.filter((c) => c !== ch)
        : [...prev.selectedChannels, ch],
    }));
  };

  const resetFilters = () => setFilters(getDefaultFilters());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-indigo-950/40">
      <div className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight">
              Parasnath Distribution Group
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              FMCG Sales Performance & Intelligent Forecasting Dashboard
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>
              Database:{" "}
              <span className="text-indigo-400 font-semibold">
                {overview.data
                  ? formatNumber(overview.data.kpis.total_transactions)
                  : "—"}
              </span>{" "}
              Transactions
            </p>
            <p className="mt-0.5">Updated: June 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <FilterPanel
          filters={filters}
          activeFilterCount={activeFilterCount}
          onStartDateChange={(value) => setFilters((prev) => ({ ...prev, startDate: value }))}
          onEndDateChange={(value) => setFilters((prev) => ({ ...prev, endDate: value }))}
          onToggleRegion={toggleRegion}
          onToggleCategory={toggleCategory}
          onToggleChannel={toggleChannel}
          onReset={resetFilters}
        />

        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabContent={{
            overview: <OverviewTab section={overview} />,
            regional: <RegionalTab section={regional} />,
            products: <ProductsTab section={products} />,
            trends: (
              <TrendsTab
                loading={trends.loading}
                error={trends.error}
                dailyRevenue={trends.data}
                processedTrendData={processedTrendData}
                trendGroupBy={trendGroupBy}
                onTrendGroupByChange={setTrendGroupBy}
              />
            ),
            forecasting: (
              <ForecastingTab
                section={forecast}
                forecastHorizon={forecastHorizon}
                onForecastHorizonChange={setForecastHorizon}
              />
            ),
            anomalies: <AnomaliesTab section={anomalies} />,
            margins: <MarginsTab section={margins} />,
          }}
        />
      </div>

      <div className="border-t border-slate-900 bg-slate-900/20 py-8 mt-12 text-center text-xs text-slate-500">
        <p>
          Built by <span className="font-semibold text-slate-400">Ahmed Moosani</span> — MBA Tech
          (AI), MPSTME NMIMS Mumbai
        </p>
        <p className="mt-1">Internship Project at Parasnath Distribution Group | 2026</p>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
