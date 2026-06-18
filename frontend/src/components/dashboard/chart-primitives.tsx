"use client";

import { formatPercent } from "@/lib/format";
import type { PieLabelRenderProps } from "recharts";

function num(value: string | number | undefined, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || fallback;
  return fallback;
}

export function PiePercentLabel(props: PieLabelRenderProps) {
  const cx = num(props.cx);
  const cy = num(props.cy);
  const midAngle = num(props.midAngle);
  const outerRadius = num(props.outerRadius);
  const percent = num(props.percent);
  const name = String(props.name ?? "");

  if (percent < 0.03) return null;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#e2e8f0"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${name} ${formatPercent(percent * 100, 1)}`}
    </text>
  );
}

export function PieSliceLabel(props: PieLabelRenderProps) {
  const cx = num(props.cx);
  const cy = num(props.cy);
  const midAngle = num(props.midAngle);
  const innerRadius = num(props.innerRadius);
  const outerRadius = num(props.outerRadius);
  const percent = num(props.percent);

  if (percent < 0.04) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {formatPercent(percent * 100, 0)}
    </text>
  );
}
