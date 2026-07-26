"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MONEDA } from "@/lib/constants";
import type { MonthlyRevenue } from "@/lib/actions/dashboard";

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 bg-popover border border-border shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {MONEDA} {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="rounded-2xl p-6 bg-card border border-border">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">
            Ganancias Mensuales
          </h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Sin datos de ganancias aún</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-card border border-border transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">
          Ganancias Mensuales
        </h3>
        <div className="text-right">
          <p className="text-xs text-foreground/60">Total 7 meses</p>
          <p className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
            {MONEDA} {total.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12, opacity: 0.6 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${MONEDA}${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
            <Bar
              dataKey="total"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
