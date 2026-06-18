"use client";

import { TAB_OPTIONS } from "@/components/dashboard/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardTab } from "@/lib/types";
import type { ReactNode } from "react";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  tabContent: Record<DashboardTab, ReactNode>;
}

export function DashboardTabs({ activeTab, onTabChange, tabContent }: DashboardTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as DashboardTab)}
      className="w-full"
    >
      <div className="mb-4 md:hidden">
        <label className="text-xs font-bold text-slate-400 mb-2 block">Dashboard Section</label>
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as DashboardTab)}
          className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          {TAB_OPTIONS.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:block mb-8 overflow-x-auto">
        <TabsList className="inline-flex w-max min-w-full bg-slate-900/40 backdrop-blur border border-slate-850 rounded-2xl p-1 gap-1.5 h-auto">
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-xl py-2.5 px-4 text-xs font-bold text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {TAB_OPTIONS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-8">
          {tabContent[tab.value]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
