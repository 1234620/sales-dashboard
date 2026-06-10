import React from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";

export function Hero195() {
  return (
    <div className="relative flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background px-6 py-20 md:shadow-xl">
      <div className="z-10 flex flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50 text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          Live Data
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl text-foreground">
          Sales Performance <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            & Forecasting
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Replace manual Excel-based sales reporting with an interactive platform. Track 16 KPIs, analyze regional performance, and forecast revenue using AI.
        </p>
        <div className="flex gap-4 mt-4">
          <Button size="lg" className="font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
            Explore Dashboard
          </Button>
          <Button size="lg" variant="outline" className="font-semibold">
            View Analytics
          </Button>
        </div>
      </div>
      <BorderBeam size={250} duration={12} delay={9} />
    </div>
  );
}
