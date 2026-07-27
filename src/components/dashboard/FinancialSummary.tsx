"use client";

import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";
import { MONEDA } from "@/lib/constants";
import type { FinancialSummary as FinancialSummaryType } from "@/lib/actions/dashboard";

interface FinancialSummaryProps {
  data: FinancialSummaryType;
}

export function FinancialSummary({ data }: FinancialSummaryProps) {
  const items = [
    {
      label: "Inversión",
      value: data.inversionTotal,
      icon: Wallet,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-500/10",
      valueColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Ganancia",
      value: data.gananciaTotal,
      icon: DollarSign,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      valueColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Ganancia Neta",
      value: data.gananciaNeta,
      icon: data.gananciaNeta >= 0 ? TrendingUp : TrendingDown,
      color: data.gananciaNeta >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
      bg: data.gananciaNeta >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      valueColor: data.gananciaNeta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="rounded-2xl p-5 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Resumen Financiero</h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
          <TrendingUp className="h-3 w-3" />
          {data.margen}% margen
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="text-center">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${item.bg} mb-2`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{item.label}</p>
              <p className={`text-sm font-bold ${item.valueColor}`}>
                {MONEDA} {item.value.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
