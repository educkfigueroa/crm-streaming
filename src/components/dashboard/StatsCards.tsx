import Link from "next/link";
import { Tv, Users, Shield, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Cuentas",
      value: stats.totalCuentas,
      icon: Tv,
      color: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
      accent: "from-blue-500/20 to-transparent",
      href: "/cuentas",
    },
    {
      title: "Total Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10",
      accent: "from-purple-500/20 to-transparent",
      href: "/clientes",
    },
    {
      title: "Suscripciones Activas",
      value: stats.suscripcionesActivas,
      icon: Shield,
      color: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
      accent: "from-emerald-500/20 to-transparent",
      href: "/suscripciones",
    },
    {
      title: "Por Vencer",
      value: stats.porVencer,
      icon: AlertTriangle,
      color: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
      accent: "from-amber-500/20 to-transparent",
      href: "/suscripciones",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-card border border-border cursor-pointer"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">{card.title}</p>
              <p className={`mt-2 text-3xl font-bold tracking-tight ${card.color}`}>
                {card.value}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
          <div className="relative mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Ver detalle →
          </div>
        </Link>
      ))}
    </div>
  );
}
