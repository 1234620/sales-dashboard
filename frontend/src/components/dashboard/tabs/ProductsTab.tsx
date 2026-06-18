import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductsSection } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductsTabProps {
  section: ProductsSection;
}

function currencyTick(value: number): string {
  return formatCurrency(value);
}

export function ProductsTab({ section }: ProductsTabProps) {
  const { data, loading, error } = section;
  const categoryData = data?.categories;
  const skuData = data?.skus;

  return (
    <TabSection loading={loading} error={error} hasData={!!data}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categoryData && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Category Margin Contribution
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Total net revenue vs margins by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryData} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="product_category"
                      stroke="#64748b"
                      style={{ fontSize: "11px" }}
                    />
                    <YAxis
                      stroke="#64748b"
                      style={{ fontSize: "11px" }}
                      tickFormatter={currencyTick}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                      }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#6366F1" name="Net Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="margin" fill="#10B981" name="Margin" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {skuData && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  🏆 Top 10 SKUs by Revenue
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Top-selling products and carton quantities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={skuData.top} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      style={{ fontSize: "11px" }}
                      tickFormatter={currencyTick}
                    />
                    <YAxis
                      dataKey="product_sku"
                      type="category"
                      stroke="#64748b"
                      style={{ fontSize: "10px" }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                      }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {skuData && (
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                ⬇️ Bottom 10 SKUs by Revenue
              </CardTitle>
              <CardDescription className="text-slate-400">
                Products generating the lowest revenue share
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={skuData.bottom} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    style={{ fontSize: "11px" }}
                    tickFormatter={currencyTick}
                  />
                  <YAxis
                    dataKey="product_sku"
                    type="category"
                    stroke="#64748b"
                    style={{ fontSize: "10px" }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                    }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Bar dataKey="revenue" fill="#EF4444" name="Revenue" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </TabSection>
  );
}
