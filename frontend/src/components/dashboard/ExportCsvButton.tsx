import { Button } from "@/components/ui/button";
import type { CsvColumn } from "@/lib/export-csv";
import { downloadRowsCsv } from "@/lib/export-csv";

interface ExportCsvButtonProps<T extends object> {
  tab: string;
  rows: T[];
  columns: CsvColumn<T>[];
  disabled?: boolean;
  suffix?: string;
  label?: string;
}

export function ExportCsvButton<T extends object>({
  tab,
  rows,
  columns,
  disabled = false,
  suffix,
  label = "Export CSV",
}: ExportCsvButtonProps<T>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || rows.length === 0}
      className="text-xs border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 bg-slate-900/60"
      onClick={() => downloadRowsCsv(tab, rows, columns, suffix)}
    >
      {label}
    </Button>
  );
}
