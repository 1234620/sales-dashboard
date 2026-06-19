export interface DateRange {
  startDate: string;
  endDate: string;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Equal-length period immediately before the given range (inclusive). */
export function priorPeriod(range: DateRange): DateRange {
  const start = parseDate(range.startDate);
  const end = parseDate(range.endDate);
  const dayMs = 24 * 60 * 60 * 1000;
  const lengthDays = Math.round((end.getTime() - start.getTime()) / dayMs) + 1;

  const priorEnd = new Date(start.getTime() - dayMs);
  const priorStart = new Date(priorEnd.getTime() - (lengthDays - 1) * dayMs);

  return {
    startDate: formatDate(priorStart),
    endDate: formatDate(priorEnd),
  };
}

export function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}
