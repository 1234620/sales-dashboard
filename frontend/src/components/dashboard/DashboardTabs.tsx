"use client";

import { TAB_OPTIONS } from "@/components/dashboard/constants";
import { dashboardTheme } from "@/components/dashboard/theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardTab } from "@/lib/types";
import type { ReactNode, RefObject } from "react";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  tabContent: Record<DashboardTab, ReactNode>;
  exportRef?: RefObject<HTMLDivElement | null>;
}

export function DashboardTabs({ activeTab, onTabChange, tabContent, exportRef }: DashboardTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as DashboardTab)}
      className="w-full"
    >
      <div className="mb-4 md:hidden">
        <label className={`${dashboardTheme.label} mb-2 block`}>Dashboard section</label>
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as DashboardTab)}
          className={dashboardTheme.input}
        >
          {TAB_OPTIONS.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:block mb-8 overflow-x-auto">
        <TabsList className={dashboardTheme.tabList}>
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={dashboardTheme.tabTrigger}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {TAB_OPTIONS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-8">
          <div
            ref={activeTab === tab.value ? exportRef : undefined}
            id={activeTab === tab.value ? "dashboard-tab-export" : undefined}
            className={activeTab === tab.value ? "pdf-export-root" : undefined}
          >
            {activeTab === tab.value ? tabContent[tab.value] : null}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
