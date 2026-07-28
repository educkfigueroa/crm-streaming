import { getDashboardStats, getExpiringSoon, getMonthlyRevenue, getFinancialSummary } from "@/lib/actions/dashboard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ExpiringSoon } from "@/components/dashboard/ExpiringSoon";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { ExpirationCalendar } from "@/components/dashboard/ExpirationCalendar";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { DashboardRefresh } from "@/components/dashboard/DashboardRefresh";
import { Calendar, PieChart, ListOrdered } from "lucide-react";

export default async function DashboardPage() {
  const [stats, expiringSoon, monthlyRevenue, financial] = await Promise.all([
    getDashboardStats(),
    getExpiringSoon(),
    getMonthlyRevenue(),
    getFinancialSummary(),
  ]);

  const revenueSparkline = monthlyRevenue.map((d) => d.total);

  return (
    <DashboardRefresh>
      <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gradient tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">Vista general de tu negocio</p>
      </div>

      <StatsCards stats={stats} revenueData={revenueSparkline} />

      <RevenueChart data={monthlyRevenue} financial={financial} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollapsibleSection
          title="Estado de Suscripciones"
          subtitle="Distribución actual"
          icon={<PieChart className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />}
        >
          <StatusPieChart
            activas={stats.suscripcionesActivas}
            porVencer={stats.porVencer}
            vencidas={stats.vencidas}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Próximos Vencimientos"
          subtitle={`${expiringSoon.length} suscripciones por vencer`}
          icon={<ListOrdered className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
        >
          <ExpiringSoon subscriptions={expiringSoon} />
        </CollapsibleSection>
      </div>

      <CollapsibleSection
        title="Calendario de Vencimientos"
        subtitle="Vista mensual"
        icon={<Calendar className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
      >
        <ExpirationCalendar subscriptions={expiringSoon} />
      </CollapsibleSection>
    </div>
    </DashboardRefresh>
  );
}
