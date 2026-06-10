/**
 * Utility functions for formatting numbers, currency, and dates
 */

export function formatCurrency(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined) return "₹0";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1_00_00_000) {
    // 1 Crore
    return `${sign}₹${(absValue / 1_00_00_000).toFixed(2)} Cr`;
  } else if (absValue >= 1_00_000) {
    // 1 Lakh
    return `${sign}₹${(absValue / 1_00_000).toFixed(2)} L`;
  } else if (absValue >= 1_000) {
    return `${sign}₹${(absValue / 1_000).toFixed(1)}K`;
  }
  
  return `${sign}₹${absValue.toFixed(decimals)}`;
}

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined) return "0";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1_00_00_000) {
    return `${sign}${(absValue / 1_00_00_000).toFixed(2)} Cr`;
  } else if (absValue >= 1_00_000) {
    return `${sign}${(absValue / 1_00_000).toFixed(2)} L`;
  } else if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(1)}K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "0%";
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short" });
}
