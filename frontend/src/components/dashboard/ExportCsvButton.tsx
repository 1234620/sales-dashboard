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
      className="text-xs border-gray-200 text-gray-700 hover:text-[#5D87FF] hover:border-[#5D87FF] bg-white"
      onClick={() => downloadRowsCsv(tab, rows, columns, suffix)}
    >
      {label}
    </Button>
  );
}
