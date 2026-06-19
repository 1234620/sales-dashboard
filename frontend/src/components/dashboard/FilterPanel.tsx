import {
  ALL_CATEGORIES,
  ALL_CHANNELS,
  ALL_REGIONS,
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
} from "@/components/dashboard/constants";
import { dashboardTheme } from "@/components/dashboard/theme";
import { Label } from "@/components/ui/label";
import type { FilterState } from "@/lib/types";

interface FilterPanelProps {
  filters: FilterState;
  activeFilterCount: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onToggleRegion: (region: string) => void;
  onToggleCategory: (category: string) => void;
  onToggleChannel: (channel: string) => void;
  onCompareToPriorChange: (enabled: boolean) => void;
  onExportPdf?: () => void;
  exportPdfDisabled?: boolean;
  onReset: () => void;
}

export function FilterPanel({
  filters,
  activeFilterCount,
  onStartDateChange,
  onEndDateChange,
  onToggleRegion,
  onToggleCategory,
  onToggleChannel,
  onCompareToPriorChange,
  onExportPdf,
  exportPdfDisabled = false,
  onReset,
}: FilterPanelProps) {
  const {
    startDate,
    endDate,
    selectedRegions,
    selectedCategories,
    selectedChannels,
    compareToPrior,
  } = filters;

  return (
    <div className={dashboardTheme.panel}>
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className={dashboardTheme.panelTitle}>Filters</h2>
          {activeFilterCount > 0 && (
            <span className={dashboardTheme.panelBadge}>{activeFilterCount} active</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              disabled={exportPdfDisabled}
              className={`${dashboardTheme.btnPrimary} disabled:cursor-not-allowed`}
            >
              {exportPdfDisabled ? "Exporting…" : "Export PDF"}
            </button>
          )}
          <button type="button" onClick={onReset} className={dashboardTheme.btnSecondary}>
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="filter-start-date" className={dashboardTheme.label}>
            Date range
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={dashboardTheme.input}
            />
            <input
              id="filter-end-date"
              type="date"
              aria-label="End date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={dashboardTheme.input}
            />
          </div>
          <label
            className="flex items-center gap-2 mt-2 cursor-pointer group"
            title="Compares KPIs to the immediately preceding period of equal length. Other tabs are unchanged."
          >
            <input
              type="checkbox"
              checked={compareToPrior}
              onChange={(e) => onCompareToPriorChange(e.target.checked)}
              className="rounded border-gray-300 text-[#5D87FF] focus:ring-[#5D87FF]"
            />
            <span className="text-xs text-gray-500 group-hover:text-gray-800">
              Compare to prior period
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <Label className={dashboardTheme.label}>Regions</Label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_REGIONS.map((reg) => {
              const isSel = selectedRegions.includes(reg);
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => onToggleRegion(reg)}
                  className={isSel ? dashboardTheme.chipActive : dashboardTheme.chipIdle}
                >
                  {reg}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className={dashboardTheme.label}>Categories</Label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const isSel = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onToggleCategory(cat)}
                  className={isSel ? dashboardTheme.chipActive : dashboardTheme.chipIdle}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className={dashboardTheme.label}>Channels</Label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CHANNELS.map((ch) => {
              const isSel = selectedChannels.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => onToggleChannel(ch)}
                  className={isSel ? dashboardTheme.chipActive : dashboardTheme.chipIdle}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function getDefaultFilters(): FilterState {
  return {
    startDate: DEFAULT_START_DATE,
    endDate: DEFAULT_END_DATE,
    selectedRegions: [],
    selectedCategories: [],
    selectedChannels: [],
    compareToPrior: false,
  };
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.startDate !== DEFAULT_START_DATE) count += 1;
  if (filters.endDate !== DEFAULT_END_DATE) count += 1;
  count += filters.selectedRegions.length;
  count += filters.selectedCategories.length;
  count += filters.selectedChannels.length;
  return count;
}

export function toFilterParams(filters: FilterState) {
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    regions: filters.selectedRegions.length > 0 ? filters.selectedRegions : undefined,
    categories:
      filters.selectedCategories.length > 0 ? filters.selectedCategories : undefined,
    channels: filters.selectedChannels.length > 0 ? filters.selectedChannels : undefined,
  };
}
