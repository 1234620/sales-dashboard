/** Light dashboard theme — maroon / pink brand palette. */
export const dashboardTheme = {
  page: "min-h-screen bg-white text-gray-900",
  header: "bg-white border-b border-gray-100 shadow-sm",
  headerTitle: "text-2xl md:text-3xl font-bold text-[#0a0a0a] tracking-tight",
  headerSubtitle: "text-sm text-gray-600 mt-1",
  headerMeta: "text-xs text-gray-500",
  headerMetaAccent: "text-[#dd2d4a] font-semibold",
  main: "max-w-7xl mx-auto px-4 sm:px-6 py-8",
  footer: "border-t border-gray-100 bg-white py-8 mt-12 text-center text-xs text-gray-500",
  footerAccent: "font-semibold text-[#0a0a0a]",
  panel:
    "mb-8 p-6 rounded-xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(136,13,30,0.06)]",
  panelTitle: "text-sm font-semibold tracking-wide uppercase text-[#880d1e]",
  panelBadge:
    "text-xs font-semibold text-[#880d1e] bg-[#f49cbb]/30 border border-[#f49cbb] px-2 py-0.5 rounded-full",
  card: "bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-xl",
  cardTitle: "text-lg font-semibold text-[#0a0a0a]",
  cardDescription: "text-sm text-gray-600",
  label: "text-xs font-semibold text-gray-700",
  input:
    "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#880d1e] focus:ring-2 focus:ring-[#f49cbb]/40",
  chipActive:
    "text-xs px-2.5 py-1.5 rounded-lg border bg-[#f49cbb]/25 border-[#880d1e]/30 text-[#880d1e] font-semibold",
  chipIdle:
    "text-xs px-2.5 py-1.5 rounded-lg border bg-white border-gray-200 text-gray-600 hover:border-[#f49cbb] hover:text-[#0a0a0a] transition-all",
  btnSecondary:
    "text-xs font-semibold text-gray-700 hover:text-[#0a0a0a] bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-all",
  btnPrimary:
    "text-xs font-semibold text-white bg-[#880d1e] hover:bg-[#6e0a18] px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-40",
  tabList:
    "inline-flex w-max min-w-full bg-white border border-gray-100 shadow-sm rounded-xl p-1 gap-1 h-auto",
  tabTrigger:
    "rounded-lg py-2.5 px-4 text-xs font-semibold text-gray-600 data-[state=active]:bg-[#880d1e] data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap transition-all",
  insights: "mb-6 rounded-xl border border-[#f49cbb] bg-[#f49cbb]/15 overflow-hidden shadow-sm",
  insightsTitle: "text-sm font-semibold text-[#880d1e]",
  insightsText: "text-sm text-gray-800",
  error: "p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm",
  tableHead: "border-b border-gray-200 text-gray-500",
  tableRow: "border-b border-gray-100 hover:bg-gray-50/80",
  tableCell: "text-gray-900",
  refreshOverlay: "absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] rounded-xl",
  refreshBadge:
    "text-xs font-semibold text-[#880d1e] bg-white border border-[#f49cbb] px-2.5 py-1 rounded-lg shadow-sm",
} as const;

export const CHART_GRID_STROKE = "#f3f4f6";
