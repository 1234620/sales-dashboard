import {
  ALL_CATEGORIES,
  ALL_CHANNELS,
  ALL_REGIONS,
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
} from "@/components/dashboard/constants";
import type { FilterState } from "@/lib/types";

interface FilterPanelProps {
  filters: FilterState;
  activeFilterCount: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onToggleRegion: (region: string) => void;
  onToggleCategory: (category: string) => void;
  onToggleChannel: (channel: string) => void;
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
  onReset,
}: FilterPanelProps) {
  const { startDate, endDate, selectedRegions, selectedCategories, selectedChannels } =
    filters;

  return (
    <div className="mb-8 p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">
            🎛️ Control Panel & Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="text-xs font-bold text-indigo-200 bg-indigo-600/20 border border-indigo-500/40 px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all shrink-0"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">📅 Date Range</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">🗺️ Regions</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_REGIONS.map((reg) => {
              const isSel = selectedRegions.includes(reg);
              return (
                <button
                  key={reg}
                  onClick={() => onToggleRegion(reg)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    isSel
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold"
                      : "bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {reg}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">📦 Categories</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const isSel = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    isSel
                      ? "bg-violet-600/30 border-violet-500 text-violet-200 font-bold"
                      : "bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400">📡 Channels</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CHANNELS.map((ch) => {
              const isSel = selectedChannels.includes(ch);
              return (
                <button
                  key={ch}
                  onClick={() => onToggleChannel(ch)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    isSel
                      ? "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold"
                      : "bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600"
                  }`}
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
