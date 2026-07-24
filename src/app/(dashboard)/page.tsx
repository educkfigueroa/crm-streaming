import { getDashboardStats, getExpiringSoon, getMonthlyRevenue } from "@/lib/actions/dashboard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ExpiringSoon } from "@/components/dashboard/ExpiringSoon";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export default async function DashboardPage() {
  const [stats, expiringSoon, monthlyRevenue] = await Promise.all([
    getDashboardStats(),
    getExpiringSoon(),
    getMonthlyRevenue(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vista general de tu negocio</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart data={monthlyRevenue} />
        <ExpiringSoon subscriptions={expiringSoon} />
      </div>
    </div>
  );
}
