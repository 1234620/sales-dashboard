"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { dashboardTheme } from "@/components/dashboard/theme";
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
import { computeMape, normalizeDateKey } from "@/lib/chart-utils";
import { priorPeriod } from "@/lib/date-ranges";
import { exportElementToPdf, pdfFilename } from "@/lib/export-pdf";
import { buildInsights } from "@/lib/insights";
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

  const filterParams = useMemo(() => toFilterParams(filters), [filters]);
  const debouncedFilterParams = useDebounce(filterParams, 300);
  const priorFilterParams = useMemo(() => {
    if (!filters.compareToPrior) return null;
    const prior = priorPeriod({ startDate: filters.startDate, endDate: filters.endDate });
    return {
      ...filterParams,
      startDate: prior.startDate,
      endDate: prior.endDate,
    };
  }, [filters.compareToPrior, filters.startDate, filters.endDate, filterParams]);
  const debouncedPriorFilterParams = useDebounce(priorFilterParams, 300);
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const dashboardRequestId = useRef(0);
  const tabExportRef = useRef<HTMLDivElement>(null);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    const requestId = ++dashboardRequestId.current;
    await Promise.resolve();

    if (requestId !== dashboardRequestId.current) return;

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
      productsHeatmapResult,
      trendsResult,
      anomaliesSeriesResult,
      anomaliesFlaggedResult,
      marginsReturnsResult,
      marginsChannelResult,
      marginsFestiveResult,
      compareKpisResult,
    ] = await Promise.allSettled([
      api.fetchKPIs(debouncedFilterParams),
      api.fetchRevenueTrend(debouncedFilterParams),
      api.fetchYoYGrowth(debouncedFilterParams),
      api.fetchRegional(debouncedFilterParams),
      api.fetchCategories(debouncedFilterParams),
      api.fetchTopSKUs(10, debouncedFilterParams),
      api.fetchHeatmap(debouncedFilterParams),
      api.fetchDailyRevenue(groupBy, debouncedFilterParams),
      api.fetchAnomalies(debouncedFilterParams),
      api.fetchAnomalies(debouncedFilterParams, { flaggedOnly: true }),
      api.fetchReturns(debouncedFilterParams),
      api.fetchChannelMix(debouncedFilterParams),
      api.fetchFestiveUplift(debouncedFilterParams),
      debouncedPriorFilterParams
        ? api.fetchKPIs(debouncedPriorFilterParams)
        : Promise.resolve(null),
    ]);

    if (isStale()) return;

    const kpis = kpisResult.status === "fulfilled" ? kpisResult.value : null;
    const trend = trendResult.status === "fulfilled" ? trendResult.value : null;
    const yoy =
      yoyResult.status === "fulfilled" ? yoyResult.value : { data: [] };
    const compareKpis =
      compareKpisResult.status === "fulfilled" ? compareKpisResult.value : null;

    if (kpis && trend) {
      setOverview({
        data: { kpis, trend, yoy, compareKpis },
        loading: false,
        error: null,
      });
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
      const heatmapOk = productsHeatmapResult.status === "fulfilled";
      if (categoriesOk && skusOk) {
        setProducts({
          data: {
            categories: productsCategoriesResult.value,
            skus: productsSkusResult.value,
            heatmap: heatmapOk ? productsHeatmapResult.value : null,
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
  }, [debouncedFilterParams, debouncedPriorFilterParams, trendGroupBy]);

  const forecastMape = useMemo(() => {
    if (!forecast.data?.validation?.length || !forecast.data.forecast?.length) {
      return null;
    }
    const forecastByDs = new Map(
      forecast.data.forecast.map((f) => [normalizeDateKey(f.ds), f.yhat]),
    );
    const mapePoints = forecast.data.validation.map((v) => ({
      actual: v.y,
      predicted: forecastByDs.get(normalizeDateKey(v.ds)) ?? 0,
    }));
    return computeMape(mapePoints);
  }, [forecast.data]);

  const insights = useMemo(
    () =>
      buildInsights({
        overview,
        regional,
        anomalies,
        forecastMape,
      }),
    [overview, regional, anomalies, forecastMape],
  );

  const forecastRequestId = useRef(0);

  const loadForecastData = useCallback(async () => {
    const requestId = ++forecastRequestId.current;
    await Promise.resolve();
    if (requestId !== forecastRequestId.current) return;
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
    const handle = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [loadDashboardData]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadForecastData();
    }, 0);
    return () => window.clearTimeout(handle);
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

  const handleExportPdf = async () => {
    const el = tabExportRef.current;
    if (!el) return;
    setPdfExporting(true);
    setPdfError(null);
    try {
      await exportElementToPdf(el, pdfFilename(activeTab));
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setPdfExporting(false);
    }
  };

  const filterDashboardToRegion = (region: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(region)
        ? prev.selectedRegions
        : [...prev.selectedRegions, region],
    }));
  };

  const sectionLoading =
    activeTab === "overview"
      ? overview.loading
      : activeTab === "regional"
        ? regional.loading
        : activeTab === "products"
          ? products.loading
          : activeTab === "trends"
            ? trends.loading
            : activeTab === "forecasting"
              ? forecast.loading
              : activeTab === "anomalies"
                ? anomalies.loading
                : margins.loading;

  return (
    <div className={dashboardTheme.page}>
      <header className={dashboardTheme.header}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={dashboardTheme.headerTitle}>Parasnath Distribution Group</h1>
            <p className={dashboardTheme.headerSubtitle}>
              FMCG Sales Performance & Forecasting Dashboard
            </p>
          </div>
          <div className={`text-right ${dashboardTheme.headerMeta}`}>
            <p>
              Transactions:{" "}
              <span className={dashboardTheme.headerMetaAccent}>
                {overview.data
                  ? formatNumber(overview.data.kpis.total_transactions)
                  : "—"}
              </span>
            </p>
            <p className="mt-0.5">Updated June 2026</p>
          </div>
        </div>
      </header>

      <div className={dashboardTheme.main}>
        <FilterPanel
          filters={filters}
          activeFilterCount={activeFilterCount}
          onStartDateChange={(value) => setFilters((prev) => ({ ...prev, startDate: value }))}
          onEndDateChange={(value) => setFilters((prev) => ({ ...prev, endDate: value }))}
          onToggleRegion={toggleRegion}
          onToggleCategory={toggleCategory}
          onToggleChannel={toggleChannel}
          onCompareToPriorChange={(enabled) =>
            setFilters((prev) => ({ ...prev, compareToPrior: enabled }))
          }
          onExportPdf={() => void handleExportPdf()}
          exportPdfDisabled={pdfExporting || sectionLoading}
          onReset={resetFilters}
        />

        {pdfError && (
          <div className={`${dashboardTheme.error} mb-4`}>
            PDF export failed: {pdfError}
          </div>
        )}

        <InsightsPanel insights={insights} />

        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          exportRef={tabExportRef}
          tabContent={{
            overview: <OverviewTab section={overview} />,
            regional: (
              <RegionalTab
                section={regional}
                filterParams={filterParams}
                onFilterDashboardToRegion={filterDashboardToRegion}
              />
            ),
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

      <footer className={dashboardTheme.footer}>
        <p>
          Built by <span className={dashboardTheme.footerAccent}>Ahmed Moosani</span> — MBA Tech
          (AI), MPSTME NMIMS Mumbai
        </p>
        <p className="mt-1">Internship Project at Parasnath Distribution Group | 2026</p>
      </footer>
    </div>
  );
}
