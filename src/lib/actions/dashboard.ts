"use server";

import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, SubscriptionWithDetails } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const sieteDias = new Date(hoy);
  sieteDias.setDate(hoy.getDate() + 7);

  const hoyStr = hoy.toISOString().split("T")[0];
  const sieteDiasStr = sieteDias.toISOString().split("T")[0];

  const [cuentasResult, clientesResult, subsResult] = await Promise.all([
    supabase.from("accounts").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("fecha_vencimiento"),
  ]);

  const subs = subsResult.data || [];
  let activas = 0;
  let porVencer = 0;

  for (const sub of subs) {
    const venc = new Date(sub.fecha_vencimiento);
    venc.setHours(0, 0, 0, 0);
    const diff = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 7) activas++;
    else if (diff > 0) porVencer++;
  }

  return {
    totalCuentas: cuentasResult.count ?? 0,
    totalClientes: clientesResult.count ?? 0,
    suscripcionesActivas: activas,
    porVencer,
  };
}

export async function getExpiringSoon(): Promise<SubscriptionWithDetails[]> {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const todayStr = today.toISOString().split("T")[0];
  const sevenDaysStr = sevenDaysLater.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      clients (nombre_completo, whatsapp),
      accounts (plataforma, correo)
    `)
    .gte("fecha_vencimiento", todayStr)
    .lte("fecha_vencimiento", sevenDaysStr)
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
