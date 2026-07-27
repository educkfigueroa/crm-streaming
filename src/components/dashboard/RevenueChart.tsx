"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, DollarSign, BarChart3 } from "lucide-react";
import { MONEDA } from "@/lib/constants";
import type { MonthlyRevenue, FinancialSummary } from "@/lib/actions/dashboard";

interface RevenueChartProps {
  data: MonthlyRevenue[];
  financial: FinancialSummary;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 bg-popover border border-border shadow-xl space-y-1">
      <p className="text-xs text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-semibold text-foreground">{MONEDA} {entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data, financial }: RevenueChartProps) {
  const totalGanancia = data.reduce((sum, d) => sum + d.total, 0);
  const totalInversion = data.reduce((sum, d) => sum + d.inversion, 0);

  if (data.length === 0 && totalGanancia === 0 && totalInversion === 0) {
    return (
      <div className="rounded-2xl p-6 bg-card border border-border">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <BarChart3 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Ganancias vs Inversión</h3>
            <p className="text-xs text-muted-foreground">Análisis mensual</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Sin datos financieros aún</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <BarChart3 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Ganancias vs Inversión</h3>
          <p className="text-xs text-muted-foreground">Análisis mensual</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-3 py-2">
          <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Ingreso</p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{MONEDA} {financial.gananciaTotal.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-red-500/5 border border-red-500/10 px-3 py-2">
          <Wallet className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Inversión</p>
            <p className="text-xs font-bold text-red-600 dark:text-red-400">{MONEDA} {financial.inversionTotal.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
          {financial.gananciaNeta >= 0 ? (
            <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
          )}
          <div>
            <p className="text-[10px] text-muted-foreground">Ganancia ({financial.margen}%)</p>
            <p className={`text-xs font-bold ${financial.gananciaNeta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {MONEDA} {financial.gananciaNeta.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
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
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            <Bar
              dataKey="total"
              name="Ingreso"
              fill="url(#gainGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="inversion"
              name="Inversión"
              fill="url(#lossGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="gainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
