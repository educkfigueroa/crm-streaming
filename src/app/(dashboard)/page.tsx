import { getDashboardStats, getExpiringSoon, getMonthlyRevenue, getFinancialSummary } from "@/lib/actions/dashboard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ExpiringSoon } from "@/components/dashboard/ExpiringSoon";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { ExpirationTimeline } from "@/components/dashboard/ExpirationTimeline";
import { Clock, PieChart } from "lucide-react";

export default async function DashboardPage() {
  const [stats, expiringSoon, monthlyRevenue, financial] = await Promise.all([
    getDashboardStats(),
    getExpiringSoon(),
    getMonthlyRevenue(),
    getFinancialSummary(),
  ]);

  const revenueSparkline = monthlyRevenue.map((d) => d.total);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gradient tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">Vista general de tu negocio</p>
      </div>

      <StatsCards stats={stats} revenueData={revenueSparkline} />

      <FinancialSummary data={financial} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthlyRevenue} />

        {/* Status Pie Chart */}
        <div className="rounded-2xl p-6 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <PieChart className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Estado de Suscripciones</h3>
              <p className="text-xs text-muted-foreground">Distribución actual</p>
            </div>
          </div>
          <StatusPieChart
            activas={stats.suscripcionesActivas}
            porVencer={stats.porVencer}
            vencidas={stats.vencidas}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpiringSoon subscriptions={expiringSoon} />

        {/* Expiration Timeline */}
        <div className="rounded-2xl p-6 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Línea de Tiempo</h3>
                <p className="text-xs text-muted-foreground">Próximos vencimientos</p>
              </div>
            </div>
          </div>
          <ExpirationTimeline subscriptions={expiringSoon} />
        </div>
      </div>
    </div>
  );
}
