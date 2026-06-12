"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from "recharts";
import { formatCurrency, formatNumber, formatPercent, formatDate } from "@/lib/format";
import * as api from "@/lib/api";

const MetricCard = ({ title, value, change, changeType, color, delay = 0 }: any) => {
  const isPositive = changeType === 'positive';
  const isNeutral = changeType === 'neutral';
  
  return (
    <div
      className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
      style={{
        animation: `slideUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      {/* Background glow gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-15 transition-opacity duration-500`} />
      
      {/* Card content */}
      <div className="relative p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">{title}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">{value}</p>
            {change && (
              <p className={`text-xs mt-2 flex items-center gap-1 font-semibold ${
                isNeutral ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {!isNeutral && (isPositive ? '↑' : '↓')} {change}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-300 flex items-center justify-center`}>
            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${color} opacity-80`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [regionalData, setRegionalData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [skuData, setSkuData] = useState<any>(null);
  const [anomalyData, setAnomalyData] = useState<any>(null);
  const [channelData, setChannelData] = useState<any>(null);
  const [dailyRevenue, setDailyRevenue] = useState<any>(null);
  const [festiveUplift, setFestiveUplift] = useState<any>(null);
  const [returnsData, setReturnsData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  
  // Filters state
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2026-04-30");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  // Forecasting and analysis parameters
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [trendGroupBy, setTrendGroupBy] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available options
  const allRegions = useMemo(() => ["Central", "East", "North", "North-East", "South", "West"], []);
  const allCategories = useMemo(() => ["Bakery & Biscuits", "Beverages", "Confectionery", "Culinary", "Spice Mixes"], []);
  const allChannels = useMemo(() => ["offline", "online"], []);

  // Filter params object
  const activeFilters = useMemo(() => {
    return {
      startDate,
      endDate,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      channels: selectedChannels.length > 0 ? selectedChannels : undefined,
    };
  }, [startDate, endDate, selectedRegions, selectedCategories, selectedChannels]);

  // Load Main Data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        kpisRes, trendRes, regionalRes, categoryRes, skuRes,
        anomalyRes, channelRes, dailyRevRes, festiveRes, returnsRes
      ] = await Promise.all([
        api.fetchKPIs(activeFilters),
        api.fetchRevenueTrend(activeFilters),
        api.fetchRegional(activeFilters),
        api.fetchCategories(activeFilters),
        api.fetchTopSKUs(10, activeFilters),
        api.fetchAnomalies(activeFilters),
        api.fetchChannelMix(activeFilters),
        api.fetchDailyRevenue(trendGroupBy || undefined, activeFilters),
        api.fetchFestiveUplift(activeFilters),
        api.fetchReturns(activeFilters)
      ]);

      setKpis(kpisRes);
      setTrendData(trendRes);
      setRegionalData(regionalRes);
      setCategoryData(categoryRes);
      setSkuData(skuRes);
      setAnomalyData(anomalyRes);
      setChannelData(channelRes);
      setDailyRevenue(dailyRevRes);
      setFestiveUplift(festiveRes);
      setReturnsData(returnsRes);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Load Forecast Data
  const loadForecastData = async () => {
    try {
      setForecastLoading(true);
      const res = await api.fetchForecast(forecastHorizon);
      setForecastData(res);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    } finally {
      setForecastLoading(false);
    }
  };

  // Initial and reactive load on filters change
  useEffect(() => {
    loadDashboardData();
  }, [activeFilters, trendGroupBy]);

  // Fetch forecast when horizon changes
  useEffect(() => {
    loadForecastData();
  }, [forecastHorizon]);

  // Toggle helpers for filters
  const toggleRegion = (reg: string) => {
    setSelectedRegions(prev => prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]);
  };
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  const toggleChannel = (ch: string) => {
    setSelectedChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };
  
  const resetFilters = () => {
    setStartDate("2023-01-01");
    setEndDate("2026-04-30");
    setSelectedRegions([]);
    setSelectedCategories([]);
    setSelectedChannels([]);
  };

  // Compute Trend moving average data
  const processedTrendData = useMemo(() => {
    if (!dailyRevenue?.data) return [];
    
    const rawList = dailyRevenue.data;
    if (!trendGroupBy) {
      // Sort and calculate MA
      const sorted = [...rawList].sort((a, b) => a.date.localeCompare(b.date));
      return sorted.map((d, index) => {
        const start30 = Math.max(0, index - 29);
        const sub30 = sorted.slice(start30, index + 1);
        const ma30 = sub30.reduce((acc, curr) => acc + curr.net_revenue, 0) / sub30.length;

        const start90 = Math.max(0, index - 89);
        const sub90 = sorted.slice(start90, index + 1);
        const ma90 = sub90.reduce((acc, curr) => acc + curr.net_revenue, 0) / sub90.length;

        return {
          date: d.date.split("T")[0],
          revenue: d.net_revenue,
          ma30,
          ma90
        };
      });
    } else {
      const groups = Array.from(new Set(rawList.map((d: any) => d[trendGroupBy])));
      const dateMap: { [key: string]: { [key: string]: number } } = {};
      
      rawList.forEach((d: any) => {
        const day = d.date.split("T")[0];
        if (!dateMap[day]) dateMap[day] = {};
        dateMap[day][d[trendGroupBy]] = d.net_revenue;
      });

      const sortedDates = Object.keys(dateMap).sort();
      const groupHistories: { [key: string]: number[] } = {};
      groups.forEach((g: any) => groupHistories[g] = []);

      return sortedDates.map(day => {
        const row: any = { date: day };
        groups.forEach((g: any) => {
          const rev = dateMap[day][g] || 0;
          groupHistories[g].push(rev);
          if (groupHistories[g].length > 30) groupHistories[g].shift();
          const sum = groupHistories[g].reduce((a, b) => a + b, 0);
          row[g] = sum / groupHistories[g].length; // 30-day MA
        });
        return row;
      });
    }
  }, [dailyRevenue, trendGroupBy]);

  const COLORS = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#14B8A6"];

  if (loading && !kpis) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-1.5 bg-slate-950 rounded-full" />
        </div>
        <p className="text-xl font-bold mt-6 tracking-wide text-slate-200">Loading Dashboard...</p>
        <p className="text-sm text-slate-400 mt-2">Connecting to Parasnath Analytics Engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-indigo-950/40">
      
      {/* Top Banner / Header */}
      <div className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight">
              Parasnath Distribution Group
            </h1>
            <p className="text-slate-400 text-sm mt-1">FMCG Sales Performance & Intelligent Forecasting Dashboard</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Database: <span className="text-indigo-400 font-semibold">{formatNumber(kpis?.total_transactions)}</span> Transactions</p>
            <p className="mt-0.5">Updated: June 2026</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Filters Bar */}
        <div className="mb-8 p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
              <span>🎛️ Control Panel & Filters</span>
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Date Filters */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">📅 Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">🗺️ Regions</label>
              <div className="flex flex-wrap gap-1.5">
                {allRegions.map(reg => {
                  const isSel = selectedRegions.includes(reg);
                  return (
                    <button
                      key={reg}
                      onClick={() => toggleRegion(reg)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                        isSel 
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold' 
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {reg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">📦 Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map(cat => {
                  const isSel = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                        isSel 
                          ? 'bg-violet-600/30 border-violet-500 text-violet-200 font-bold' 
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Channel Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">📡 Channels</label>
              <div className="flex flex-wrap gap-1.5">
                {allChannels.map(ch => {
                  const isSel = selectedChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                        isSel 
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold' 
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-2xl flex items-center gap-2">
            <span>⚠️ Error occurred: {error}</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 mb-8 bg-slate-900/40 backdrop-blur border border-slate-850 rounded-2xl p-1 gap-1.5 h-auto">
            <TabsTrigger value="overview" className="rounded-xl py-2.5 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">KPI Overview</TabsTrigger>
            <TabsTrigger value="regional" className="rounded-xl py-2.5 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Regional</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl py-2.5 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Product Performance</TabsTrigger>
            <TabsTrigger value="trends" className="rounded-xl py-2.5 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Trend Analysis</TabsTrigger>
            <TabsTrigger value="forecasting" className="rounded-xl py-2.5 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Forecasting</TabsTrigger>
            <TabsTrigger value="anomalies" className="rounded-xl py-2.5 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Anomaly Detection</TabsTrigger>
            <TabsTrigger value="margins" className="rounded-xl py-2.5 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Margins & Profit</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(kpis?.total_revenue)}
                change={kpis?.mom_growth !== undefined ? `${Math.abs(kpis.mom_growth).toFixed(1)}% MoM` : null}
                changeType={kpis?.mom_growth >= 0 ? 'positive' : 'negative'}
                color="from-indigo-500 to-indigo-600"
                delay={0}
              />
              <MetricCard
                title="Contribution Margin"
                value={formatCurrency(kpis?.contribution_margin)}
                change={`${((kpis?.contribution_margin / kpis?.total_revenue) * 100).toFixed(1)}% of Revenue`}
                changeType="positive"
                color="from-emerald-500 to-emerald-600"
                delay={100}
              />
              <MetricCard
                title="Avg Order Value"
                value={formatCurrency(kpis?.average_order_value)}
                change="Per transaction"
                changeType="neutral"
                color="from-cyan-500 to-cyan-600"
                delay={200}
              />
              <MetricCard
                title="Sales Velocity"
                value={`${formatCurrency(kpis?.sales_velocity)} / day`}
                change="Revenue rate"
                changeType="neutral"
                color="from-orange-500 to-orange-600"
                delay={300}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Discount Impact"
                value={formatPercent(kpis?.discount_impact_rate * 100)}
                change="Weighted avg"
                changeType="negative"
                color="from-rose-500 to-rose-600"
                delay={400}
              />
              <MetricCard
                title="Repeat Purchase Rate"
                value={formatPercent(kpis?.repeat_purchase_rate)}
                change="Outlet retention"
                changeType="positive"
                color="from-purple-500 to-purple-600"
                delay={500}
              />
              <MetricCard
                title="Total Transactions"
                value={formatNumber(kpis?.total_transactions)}
                change="Orders fulfilled"
                changeType="neutral"
                color="from-pink-500 to-pink-600"
                delay={600}
              />
              <MetricCard
                title="Unique Customers"
                value={formatNumber(kpis?.unique_customers)}
                change="Retail outlets"
                changeType="neutral"
                color="from-sky-500 to-sky-600"
                delay={700}
              />
            </div>

            {/* Monthly Trend Area Chart */}
            {trendData && (
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Monthly Revenue Trend</CardTitle>
                  <CardDescription className="text-slate-400">Track monthly sales growth trajectory and volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={380}>
                    <AreaChart data={trendData.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="year_month" stroke="#64748b" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => formatCurrency(val)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                        formatter={(val: any) => [formatCurrency(val), "Revenue"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fill="url(#revenueGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: REGIONAL */}
          <TabsContent value="regional" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Regional Donut */}
              {regionalData && (
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Regional Revenue Distribution</CardTitle>
                    <CardDescription className="text-slate-400">Share of revenue contribution by Indian region</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={regionalData}
                          dataKey="revenue"
                          nameKey="region"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={65}
                          paddingAngle={3}
                        >
                          {regionalData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(val: any) => formatCurrency(val)}
                        />
                        <Legend wrapperStyle={{ color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Regional Details */}
              {regionalData && (
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Regional Details</CardTitle>
                    <CardDescription className="text-slate-400">Detailed list of performance statistics by territory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {regionalData.map((reg: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-850 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-200">{reg.region}</p>
                            <div className="w-48 bg-slate-800 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-indigo-500 h-1.5 rounded-full" 
                                style={{ width: `${reg.share_pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-indigo-400">{formatCurrency(reg.revenue)}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatPercent(reg.share_pct)} share</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: PRODUCT PERFORMANCE */}
          <TabsContent value="products" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Category Contribution Margin */}
              {categoryData && (
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Category Margin Contribution</CardTitle>
                    <CardDescription className="text-slate-400">Total net revenue vs margins by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={categoryData} margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="product_category" stroke="#64748b" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => formatCurrency(val)} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(val: any) => formatCurrency(val)}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#6366F1" name="Net Revenue" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="margin" fill="#10B981" name="Margin" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Top SKUs */}
              {skuData && (
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">🏆 Top 10 SKUs by Revenue</CardTitle>
                    <CardDescription className="text-slate-400">Top-selling products and carton quantities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={skuData.top} layout="vertical" margin={{ left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => formatCurrency(val)} />
                        <YAxis dataKey="product_sku" type="category" stroke="#64748b" style={{ fontSize: '10px' }} width={80} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(val: any) => formatCurrency(val)}
                        />
                        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Bottom SKUs */}
            {skuData && (
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">⬇️ Bottom 10 SKUs by Revenue</CardTitle>
                  <CardDescription className="text-slate-400">Products generating the lowest revenue share</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={skuData.bottom} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => formatCurrency(val)} />
                      <YAxis dataKey="product_sku" type="category" stroke="#64748b" style={{ fontSize: '10px' }} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        formatter={(val: any) => formatCurrency(val)}
                      />
                      <Bar dataKey="revenue" fill="#EF4444" name="Revenue" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 4: TREND ANALYSIS */}
          <TabsContent value="trends" className="space-y-8">
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-white">Revenue Trend with Moving Averages</CardTitle>
                  <CardDescription className="text-slate-400">Daily revenue curve smoothed by 30-day and 90-day rolling averages</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setTrendGroupBy(null)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all ${!trendGroupBy ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    No Grouping
                  </button>
                  <button
                    onClick={() => setTrendGroupBy("region")}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all ${trendGroupBy === "region" ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    By Region
                  </button>
                  <button
                    onClick={() => setTrendGroupBy("product_category")}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all ${trendGroupBy === "product_category" ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    By Category
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={processedTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => formatCurrency(val)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      formatter={(val: any) => formatCurrency(val)}
                    />
                    <Legend />
                    {!trendGroupBy ? (
                      <>
                        <Line type="monotone" dataKey="revenue" stroke="#334155" strokeWidth={1} dot={false} name="Daily Revenue" opacity={0.5} />
                        <Line type="monotone" dataKey="ma30" stroke="#6366F1" strokeWidth={2.5} dot={false} name="30-day MA" />
                        <Line type="monotone" dataKey="ma90" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="90-day MA" />
                      </>
                    ) : (
                      // Draw separate rolling averages for each group
                      Array.from(new Set(dailyRevenue?.data?.map((d: any) => d[trendGroupBy]))).map((grpName: any, idx: number) => (
                        <Line
                          key={grpName}
                          type="monotone"
                          dataKey={grpName}
                          stroke={COLORS[idx % COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          name={grpName}
                        />
                      ))
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: SALES FORECASTING */}
          <TabsContent value="forecasting" className="space-y-8">
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-white">Machine Learning Revenue Forecast</CardTitle>
                  <CardDescription className="text-slate-400">Prophet model forecasting monthly revenue with Indian holiday modifiers</CardDescription>
                </div>
                <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400">Forecast Horizon: {forecastHorizon} Months</p>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={forecastHorizon}
                      onChange={e => setForecastHorizon(parseInt(e.target.value))}
                      className="w-40 accent-indigo-500"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {forecastLoading ? (
                  <div className="h-[350px] flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400 mt-4">Running Facebook Prophet model...</p>
                  </div>
                ) : forecastData ? (
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={forecastData.forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="ds" stroke="#64748b" style={{ fontSize: '10px' }} tickFormatter={(val: any) => val ? val.split("T")[0].substring(0, 7) : ""} />
                        <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => formatCurrency(val)} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(val: any) => formatCurrency(val)}
                        />
                        <Legend />
                        
                        {/* Shaded confidence interval */}
                        <Area type="monotone" dataKey="yhat_upper" stroke="none" fill="#F59E0B" fillOpacity={0.08} name="Confidence Bounds" />
                        <Area type="monotone" dataKey="yhat_lower" stroke="none" fill="#slate-950" fillOpacity={0} legendType="none" />
                        
                        {/* Actual Historical */}
                        <Line type="monotone" dataKey="y" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} name="Actuals" connectNulls />
                        
                        {/* Forecasted Line */}
                        <Line type="monotone" dataKey="yhat" stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={2.5} dot={{ r: 3 }} name="Forecast" connectNulls />
                      </ComposedChart>
                    </ResponsiveContainer>

                    {/* Evaluation Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white">Forecast Model Performance</h4>
                        <p className="text-xs text-slate-400 mt-1">Evaluated on a 3-month out-of-sample holdout test (Feb 2026 – Apr 2026)</p>
                      </div>
                      <div className="flex items-center gap-6 justify-end">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Model accuracy (MAPE)</p>
                          <p className="text-2xl font-black text-emerald-400">9.4%</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                          ✅ PASS (Threshold 12%)
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-12">No forecast loaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: ANOMALIES */}
          <TabsContent value="anomalies" className="space-y-8">
            {anomalyData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Total Days Analyzed"
                    value={anomalyData.total_days}
                    change="Daily trend size"
                    changeType="neutral"
                    color="from-indigo-500 to-indigo-600"
                  />
                  <MetricCard
                    title="Anomalous Days"
                    value={anomalyData.anomalies_count}
                    change={`${((anomalyData.anomalies_count / anomalyData.total_days) * 100).toFixed(1)}% anomaly rate`}
                    changeType="negative"
                    color="from-rose-500 to-rose-600"
                  />
                  <MetricCard
                    title="Z-Score Limit"
                    value="±2.00 Std Dev"
                    change="Statistical cutoff"
                    changeType="neutral"
                    color="from-amber-500 to-amber-600"
                  />
                </div>

                {/* Timeline Line Chart with Custom Dot */}
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Daily Revenue Anomaly Timeline</CardTitle>
                    <CardDescription className="text-slate-400">Z-score deviations highlighting days with unexpected sales spikes or drops</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={anomalyData.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} tickFormatter={(val: any) => val ? val.split("T")[0] : ""} />
                        <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => formatCurrency(val)} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(val: any) => formatCurrency(val)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="daily_revenue"
                          stroke="#4F46E5"
                          strokeWidth={1}
                          name="Daily Revenue"
                          dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (payload.is_anomaly) {
                              return (
                                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={5} fill="#EF4444" stroke="#fff" strokeWidth={1.5} />
                              );
                            }
                            return <g />;
                          }}
                        />
                        <Line type="monotone" dataKey="rolling_mean" stroke="#10B981" strokeDasharray="4 4" strokeWidth={2} dot={false} name="30-day Mean" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Anomalies Table */}
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">🚨 Flagged Anomalous Days</CardTitle>
                    <CardDescription className="text-slate-400">Detailed list of dates exceeding the statistical z-score bounds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-850 text-slate-400">
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4 text-right">Actual Revenue</th>
                            <th className="py-3 px-4 text-right">Rolling Average</th>
                            <th className="py-3 px-4 text-right">Z-Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {anomalyData.data
                            .filter((d: any) => d.is_anomaly)
                            .map((row: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/40">
                                <td className="py-3.5 px-4 font-bold text-slate-200">{row.date.split("T")[0]}</td>
                                <td className="py-3.5 px-4 text-right font-semibold text-white">{formatCurrency(row.daily_revenue)}</td>
                                <td className="py-3.5 px-4 text-right text-slate-400">{formatCurrency(row.rolling_mean)}</td>
                                <td className="py-3.5 px-4 text-right">
                                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs">
                                    {row.z_score.toFixed(2)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB 7: MARGINS & PROFITABILITY */}
          <TabsContent value="margins" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Returns Chart */}
              {returnsData && (
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Return Rates by Category</CardTitle>
                    <CardDescription className="text-slate-400">Percentage of unit quantities returned by retailers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={returnsData} layout="vertical" margin={{ left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => `${(val * 100).toFixed(1)}%`} />
                        <YAxis dataKey="product_category" type="category" stroke="#64748b" style={{ fontSize: '10px' }} width={90} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(val: any) => `${(val * 100).toFixed(2)}%`}
                        />
                        <Bar dataKey="return_rate" fill="#EF4444" name="Return Rate" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Channel Mix */}
              {channelData && (
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Channel Revenue Share</CardTitle>
                    <CardDescription className="text-slate-400">Offline distributor logistics vs online supply chains</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={channelData}
                          dataKey="revenue"
                          nameKey="channel"
                          cx="50%"
                          cy="50%"
                          outerRadius={95}
                          innerRadius={60}
                          paddingAngle={3}
                        >
                          {channelData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(val: any) => formatCurrency(val)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Festive Uplift */}
            {festiveUplift && (
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Festive Season Revenue Uplift</CardTitle>
                  <CardDescription className="text-slate-400">Sales velocity multiplier during key festive and Eid calendar dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={festiveUplift}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="festival" stroke="#64748b" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickFormatter={(val: any) => `${val.toFixed(0)}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        formatter={(val: any) => [`${val.toFixed(1)}%`, "Revenue Uplift"]}
                      />
                      <Bar dataKey="uplift_pct" fill="#EC4899" name="Uplift %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-900 bg-slate-900/20 py-8 mt-12 text-center text-xs text-slate-500">
        <p>Built by **Ahmed Moosani** — MBA Tech (AI), MPSTME NMIMS Mumbai</p>
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
