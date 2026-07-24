"use server";

import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, SubscriptionWithDetails } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [cuentasResult, clientesResult, activasResult, porVencerResult] =
    await Promise.all([
      supabase.from("accounts").select("id", { count: "exact", head: true }),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("estado", "Activo"),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("estado", "Por Vencer"),
    ]);

  return {
    totalCuentas: cuentasResult.count ?? 0,
    totalClientes: clientesResult.count ?? 0,
    suscripcionesActivas: activasResult.count ?? 0,
    porVencer: porVencerResult.count ?? 0,
  };
}

export async function getExpiringSoon(): Promise<SubscriptionWithDetails[]> {
  const supabase = await createClient();

  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      clients (nombre_completo, whatsapp),
      accounts (plataforma, correo)
    `)
    .lte("fecha_vencimiento", sevenDaysLater.toISOString().split("T")[0])
    .in("estado", ["Activo", "Por Vencer"])
    .order("fecha_vencimiento", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching expiring subscriptions:", error);
    return [];
  }

  return data as unknown as SubscriptionWithDetails[];
}

export interface MonthlyRevenue {
  month: string;
  label: string;
  total: number;
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const supabase = await createClient();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startDate = sixMonthsAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("fecha_inicio, precio_cobrado")
    .gte("fecha_inicio", startDate)
    .order("fecha_inicio", { ascending: true });

  if (error) {
    console.error("Error fetching monthly revenue:", error);
    return [];
  }

  const monthlyMap = new Map<string, number>();

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-PE", { month: "short", year: "2-digit" });
    monthlyMap.set(key, 0);
  }

  for (const sub of data) {
    if (!sub.fecha_inicio || !sub.precio_cobrado) continue;
    const date = new Date(sub.fecha_inicio);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + sub.precio_cobrado);
    }
  }

  const result: MonthlyRevenue[] = [];
  const monthNames: Record<string, string> = {};
  const now2 = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-PE", { month: "short", year: "2-digit" });
    monthNames[key] = label;
  }

  for (const [key, total] of monthlyMap) {
    result.push({
      month: key,
      label: monthNames[key] || key,
      total: Math.round(total * 100) / 100,
    });
  }

  return result;
}
