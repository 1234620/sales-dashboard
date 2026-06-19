export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (value: unknown, row: T) => string;
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getCellValue<T extends object>(
  row: T,
  key: keyof T | string,
): unknown {
  return (row as Record<string, unknown>)[key as string];
}

export function rowsToCsv<T extends object>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const raw = getCellValue(row, col.key);
          const formatted = col.format ? col.format(raw, row) : raw;
          return escapeCell(formatted);
        })
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportFilename(tab: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `parasnath-${tab}-${date}.csv`;
}

export function downloadRowsCsv<T extends object>(
  tab: string,
  rows: T[],
  columns: CsvColumn<T>[],
  suffix?: string,
): void {
  const base = exportFilename(tab);
  const filename = suffix ? base.replace(".csv", `-${suffix}.csv`) : base;
  downloadCsv(filename, rowsToCsv(rows, columns));
}
