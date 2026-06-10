"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import * as api from "@/lib/api";

const MetricCard = ({ title, value, change, changeType, color, delay = 0 }: any) => {
  const isPositive = changeType === 'positive';
  return (
    <div
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500"
      style={{
        animation: `slideUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
      <div className="relative p-6 bg-white/50 backdrop-blur-sm border border-white/20">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm mt-2 flex items-center gap-1 font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [kpisRes, trendRes, regionalRes, categoryRes, skuRes, anomalyRes, channelRes] = await Promise.all([
          api.fetchKPIs(),
          api.fetchRevenueTrend(),
          api.fetchRegional(),
          api.fetchCategories(),
          api.fetchTopSKUs(),
          api.fetchAnomalies(),
          api.fetchChannelMix(),
        ]);
        
        setKpis(kpisRes);
        setTrendData(trendRes);
        setRegionalData(regionalRes);
        setCategoryData(categoryRes);
        setSkuData(skuRes);
        setAnomalyData(anomalyRes);
        setChannelData(channelData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <style>{`
          @keyframes shimmer {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ animation: 'spin 3s linear infinite' }} />
            <div className="absolute inset-1 bg-white rounded-full" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading your dashboard...</p>
          <p className="text-gray-500 mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-white/40 backdrop-blur-sm bg-white/30">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div style={{ animation: 'slideUp 0.8s ease-out' }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Sales Dashboard</h1>
            <p className="text-gray-600 text-lg">Real-time analytics and performance insights</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-6 mt-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-fade-in">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur border border-white/40 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white">Analytics</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white">Products</TabsTrigger>
            <TabsTrigger value="anomalies" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white">Anomalies</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(kpis?.total_revenue)}
                change={formatPercent(Math.abs(kpis?.mom_growth))}
                changeType={kpis?.mom_growth >= 0 ? 'positive' : 'negative'}
                color="from-blue-400 to-blue-600"
                delay={0}
              />
              <MetricCard
                title="Avg Order Value"
                value={formatCurrency(kpis?.average_order_value)}
                change={`${formatNumber(kpis?.total_transactions)} orders`}
                changeType="positive"
                color="from-cyan-400 to-cyan-600"
                delay={100}
              />
              <MetricCard
                title="Contribution Margin"
                value={formatCurrency(kpis?.contribution_margin)}
                change="Profitability"
                changeType="positive"
                color="from-emerald-400 to-emerald-600"
                delay={200}
              />
              <MetricCard
                title="Sales Velocity"
                value={formatCurrency(kpis?.sales_velocity)}
                change="Daily avg"
                changeType="positive"
                color="from-orange-400 to-orange-600"
                delay={300}
              />
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Discount Impact"
                value={formatPercent(kpis?.discount_impact_rate * 100)}
                change="Of revenue"
                changeType="negative"
                color="from-red-400 to-red-600"
                delay={400}
              />
              <MetricCard
                title="Repeat Purchase Rate"
                value={formatPercent(kpis?.repeat_purchase_rate)}
                change="Customer loyalty"
                changeType="positive"
                color="from-purple-400 to-purple-600"
                delay={500}
              />
              <MetricCard
                title="Total Transactions"
                value={formatNumber(kpis?.total_transactions)}
                change="Orders"
                changeType="positive"
                color="from-pink-400 to-pink-600"
                delay={600}
              />
              <MetricCard
                title="Unique Customers"
                value={formatNumber(kpis?.unique_customers)}
                change="Active users"
                changeType="positive"
                color="from-indigo-400 to-indigo-600"
                delay={700}
              />
            </div>

            {/* Revenue Trend Chart */}
            {trendData && (
              <div style={{ animation: 'slideUp 0.8s ease-out 800ms both' }}>
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Monthly Revenue Trend</CardTitle>
                    <CardDescription>12-month revenue performance with growth trajectory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={trendData.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="colorRev2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="year_month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value: any) => formatCurrency(value)}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRev1)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Regional Revenue */}
              {regionalData && (
                <div style={{ animation: 'slideUp 0.8s ease-out' }}>
                  <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40 h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900">Revenue by Region</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={regionalData}
                            dataKey="revenue"
                            nameKey="region"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ region, share_pct }) => `${region} ${share_pct.toFixed(0)}%`}
                          >
                            {regionalData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Regional Breakdown */}
              {regionalData && (
                <div style={{ animation: 'slideUp 0.8s ease-out 200ms both' }}>
                  <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40 h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900">Regional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {regionalData.map((region: any, idx: number) => (
                          <div key={idx} className="group p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-102">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{region.region}</p>
                                <p className="text-sm text-gray-500">{formatPercent(region.share_pct)} share</p>
                              </div>
                              <p className="text-lg font-bold text-blue-600">{formatCurrency(region.revenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Channel Mix */}
            {channelData && (
              <div style={{ animation: 'slideUp 0.8s ease-out 400ms both' }}>
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Online vs Offline Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={channelData}
                          dataKey="revenue"
                          nameKey="channel"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ channel, share_pct }) => `${channel} ${share_pct.toFixed(0)}%`}
                        >
                          {channelData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Performance */}
              {categoryData && (
                <div style={{ animation: 'slideUp 0.8s ease-out' }}>
                  <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900">Category Margins</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 120, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis type="number" stroke="#9ca3af" />
                          <YAxis dataKey="product_category" type="category" stroke="#9ca3af" fontSize={11} width={110} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                            formatter={(value: any) => formatCurrency(value)}
                          />
                          <Bar dataKey="margin" fill="url(#gradBar)" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <svg width="0" height="0">
                        <defs>
                          <linearGradient id="gradBar" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Top SKUs */}
              {skuData && (
                <div style={{ animation: 'slideUp 0.8s ease-out 200ms both' }}>
                  <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900">🏆 Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={skuData.top} layout="vertical" margin={{ left: 80, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                          <YAxis dataKey="product_sku" type="category" stroke="#9ca3af" fontSize={9} width={70} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                            formatter={(value: any) => formatCurrency(value)}
                          />
                          <Bar dataKey="revenue" fill="url(#gradTop)" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <svg width="0" height="0">
                        <defs>
                          <linearGradient id="gradTop" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Bottom SKUs */}
            {skuData && (
              <div style={{ animation: 'slideUp 0.8s ease-out 400ms both' }}>
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">⬇️ Underperformers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={skuData.bottom} layout="vertical" margin={{ left: 80, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                        <YAxis dataKey="product_sku" type="category" stroke="#9ca3af" fontSize={9} width={70} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Bar dataKey="revenue" fill="url(#gradBottom)" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#EF4444" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ANOMALIES TAB */}
          <TabsContent value="anomalies" className="space-y-8">
            {anomalyData && (
              <>
                {/* Anomaly Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Days Analyzed"
                    value={anomalyData.total_days}
                    change="time period"
                    changeType="positive"
                    color="from-blue-400 to-blue-600"
                    delay={0}
                  />
                  <MetricCard
                    title="Anomalies Found"
                    value={anomalyData.anomalies_count}
                    change="deviations"
                    changeType="negative"
                    color="from-red-400 to-red-600"
                    delay={100}
                  />
                  <MetricCard
                    title="Anomaly Rate"
                    value={formatPercent((anomalyData.anomalies_count / anomalyData.total_days) * 100)}
                    change="of total days"
                    changeType="negative"
                    color="from-orange-400 to-orange-600"
                    delay={200}
                  />
                </div>

                {/* Anomaly Chart */}
                <div style={{ animation: 'slideUp 0.8s ease-out 300ms both' }}>
                  <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900">Revenue Anomalies Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={anomalyData.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: any) => formatCurrency(value)}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="daily_revenue" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="Daily Revenue" isAnimationActive={true} />
                          <Line type="monotone" dataKey="rolling_mean" stroke="#10B981" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Rolling Mean" isAnimationActive={true} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Anomalies Table */}
                {anomalyData.data.some((d: any) => d.is_anomaly) && (
                  <div style={{ animation: 'slideUp 0.8s ease-out 600ms both' }}>
                    <Card className="border-0 shadow-xl bg-white/60 backdrop-blur border-white/40">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-gray-900">🚨 Detected Anomalies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-gray-200">
                              <tr>
                                <th className="text-left py-4 px-4 text-gray-700 font-semibold">Date</th>
                                <th className="text-right py-4 px-4 text-gray-700 font-semibold">Revenue</th>
                                <th className="text-right py-4 px-4 text-gray-700 font-semibold">Rolling Mean</th>
                                <th className="text-right py-4 px-4 text-gray-700 font-semibold">Z-Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {anomalyData.data
                                .filter((d: any) => d.is_anomaly)
                                .map((row: any, idx: number) => (
                                  <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                                    <td className="py-4 px-4 text-gray-700 font-medium">{row.date.split("T")[0]}</td>
                                    <td className="text-right py-4 px-4 text-gray-900 font-semibold">{formatCurrency(row.daily_revenue)}</td>
                                    <td className="text-right py-4 px-4 text-gray-600">{formatCurrency(row.rolling_mean)}</td>
                                    <td className="text-right py-4 px-4">
                                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">{row.z_score.toFixed(2)}</span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
