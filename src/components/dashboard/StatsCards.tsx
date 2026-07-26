import Link from "next/link";
import { Tv, Users, Shield, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/types";
import { AnimatedCounter } from "./AnimatedCounter";
import { MiniSparkline } from "./MiniSparkline";

interface StatsCardsProps {
  stats: DashboardStats;
  revenueData?: number[];
}

export function StatsCards({ stats, revenueData = [] }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Cuentas",
      value: stats.totalCuentas,
      icon: Tv,
      color: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
      accent: "from-blue-500/20 to-transparent",
      shadow: "shadow-blue-500/5",
      sparkColor: "#3b82f6",
      href: "/cuentas",
    },
    {
      title: "Total Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10",
      accent: "from-purple-500/20 to-transparent",
      shadow: "shadow-purple-500/5",
      sparkColor: "#a855f7",
      href: "/clientes",
    },
    {
      title: "Activas",
      value: stats.suscripcionesActivas,
      icon: Shield,
      color: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
      accent: "from-emerald-500/20 to-transparent",
      shadow: "shadow-emerald-500/5",
      sparkColor: "#10b981",
      href: "/suscripciones?estado=Activo",
    },
    {
      title: "Por Vencer",
      value: stats.porVencer,
      icon: AlertTriangle,
      color: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
      accent: "from-amber-500/20 to-transparent",
      shadow: "shadow-amber-500/5",
      sparkColor: "#f59e0b",
      href: "/suscripciones?estado=Por%20Vencer",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Link
          key={card.title}
          href={card.href}
          className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:${card.shadow} bg-card border border-border/50 card-3d animate-fade-in-up animate-stagger-${Math.min(i + 1, 8)}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{card.title}</p>
              <p className={`mt-2 text-3xl font-bold tracking-tight ${card.color}`}>
                <AnimatedCounter value={card.value} />
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <MiniSparkline
                data={revenueData.length ? revenueData : [0, 0, 0, 0, 0, 0, card.value]}
                color={card.sparkColor}
                height={24}
                width={60}
              />
            </div>
          </div>
          <div className="relative mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            Ver detalle →
          </div>
        </Link>
      ))}
    </div>
  );
}
