/** Light SaaS dashboard theme (MaterialM / Saasable inspired). */
export const dashboardTheme = {
  page: "min-h-screen bg-[#f0f4f8] text-gray-800",
  header: "bg-white border-b border-gray-200/80 shadow-sm",
  headerTitle: "text-2xl md:text-3xl font-bold text-gray-900 tracking-tight",
  headerSubtitle: "text-sm text-gray-500 mt-1",
  headerMeta: "text-xs text-gray-500",
  headerMetaAccent: "text-[#5D87FF] font-semibold",
  main: "max-w-7xl mx-auto px-4 sm:px-6 py-8",
  footer: "border-t border-gray-200 bg-white py-8 mt-12 text-center text-xs text-gray-500",
  footerAccent: "font-semibold text-gray-700",
  panel:
    "mb-8 p-6 rounded-xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
  panelTitle: "text-sm font-semibold tracking-wide text-[#5D87FF] uppercase",
  panelBadge:
    "text-xs font-semibold text-[#5D87FF] bg-[#5D87FF]/10 border border-[#5D87FF]/20 px-2 py-0.5 rounded-full",
  card: "bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-xl",
  cardTitle: "text-lg font-semibold text-gray-900",
  cardDescription: "text-sm text-gray-500",
  label: "text-xs font-semibold text-gray-600",
  input:
    "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#5D87FF] focus:ring-2 focus:ring-[#5D87FF]/20",
  chipActive:
    "text-xs px-2.5 py-1.5 rounded-lg border bg-[#5D87FF]/10 border-[#5D87FF]/40 text-[#5D87FF] font-semibold",
  chipIdle:
    "text-xs px-2.5 py-1.5 rounded-lg border bg-white border-gray-200 text-gray-600 hover:border-[#5D87FF]/40 hover:text-gray-900 transition-all",
  btnSecondary:
    "text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-all",
  btnPrimary:
    "text-xs font-semibold text-white bg-[#5D87FF] hover:bg-[#4a75e6] px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-40",
  tabList:
    "inline-flex w-max min-w-full bg-white border border-gray-100 shadow-sm rounded-xl p-1 gap-1 h-auto",
  tabTrigger:
    "rounded-lg py-2.5 px-4 text-xs font-semibold text-gray-600 data-[state=active]:bg-[#5D87FF] data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap transition-all",
  insights:
    "mb-6 rounded-xl border border-amber-200 bg-amber-50/80 overflow-hidden shadow-sm",
  insightsTitle: "text-sm font-semibold text-amber-900",
  insightsText: "text-sm text-amber-800/90",
  error: "p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm",
  tableHead: "border-b border-gray-200 text-gray-500",
  tableRow: "border-b border-gray-100 hover:bg-gray-50/80",
  tableCell: "text-gray-800",
  refreshOverlay: "absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] rounded-xl",
  refreshBadge:
    "text-xs font-semibold text-[#5D87FF] bg-white border border-[#5D87FF]/20 px-2.5 py-1 rounded-lg shadow-sm",
} as const;

export const CHART_GRID_STROKE = "#e5e7eb";
