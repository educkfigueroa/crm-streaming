"use server";

import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, SubscriptionWithDetails } from "@/types";

function calcularEstado(fechaVencimiento: string): string {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Vencido";
  if (diffDays <= 7) return "Por Vencer";
  return "Activo";
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [cuentasResult, clientesResult, subsResult] = await Promise.all([
    supabase.from("accounts").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("fecha_vencimiento"),
  ]);

  const subs = subsResult.data || [];
  let activas = 0;
  let porVencer = 0;
  let vencidas = 0;

  for (const sub of subs) {
    const estado = calcularEstado(sub.fecha_vencimiento);
    if (estado === "Activo") activas++;
    else if (estado === "Por Vencer") porVencer++;
    else vencidas++;
  }

  return {
    totalCuentas: cuentasResult.count ?? 0,
    totalClientes: clientesResult.count ?? 0,
    suscripcionesActivas: activas,
    porVencer,
    vencidas,
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

export async function getCalendarSubscriptions(): Promise<SubscriptionWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      clients (id, nombre_completo, whatsapp),
      accounts (id, plataforma, correo)
    `)
    .order("fecha_vencimiento", { ascending: true });

  if (error) {
    console.error("Error fetching calendar subscriptions:", error);
    return [];
  }

  return data as unknown as SubscriptionWithDetails[];
}

export interface MonthlyRevenue {
  month: string;
  label: string;
  total: number;
  inversion: number;
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const supabase = await createClient();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startDate = sixMonthsAgo.toISOString().split("T")[0];

  const [subsResult, cuentasResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("fecha_inicio, precio_cobrado")
      .gte("fecha_inicio", startDate)
      .order("fecha_inicio", { ascending: true }),
    supabase
      .from("accounts")
      .select("precio_costo, created_at")
      .not("plataforma", "eq", "iptv"),
  ]);

  const monthlyMap = new Map<string, { total: number; inversion: number }>();

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, { total: 0, inversion: 0 });
  }

  for (const sub of subsResult.data || []) {
    if (!sub.fecha_inicio || !sub.precio_cobrado) continue;
    const date = new Date(sub.fecha_inicio);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthlyMap.get(key);
    if (entry) entry.total += sub.precio_cobrado;
  }

  for (const account of cuentasResult.data || []) {
    if (!account.precio_costo || !account.created_at) continue;
    const date = new Date(account.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthlyMap.get(key);
    if (entry) entry.inversion += account.precio_costo;
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

  for (const [key, values] of monthlyMap) {
    result.push({
      month: key,
      label: monthNames[key] || key,
      total: Math.round(values.total * 100) / 100,
      inversion: Math.round(values.inversion * 100) / 100,
    });
  }

  return result;
}

export interface FinancialSummary {
  inversionTotal: number;
  gananciaTotal: number;
  gananciaNeta: number;
  margen: number;
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const supabase = await createClient();

  const [cuentasResult, subsResult] = await Promise.all([
    supabase.from("accounts").select("precio_costo").not("plataforma", "eq", "iptv"),
    supabase.from("subscriptions").select("precio_cobrado"),
  ]);

  const inversionTotal = (cuentasResult.data || [])
    .reduce((sum, a) => sum + (a.precio_costo || 0), 0);

  const gananciaTotal = (subsResult.data || [])
    .reduce((sum, s) => sum + (s.precio_cobrado || 0), 0);

  const gananciaNeta = gananciaTotal - inversionTotal;
  const margen = gananciaTotal > 0 ? Math.round((gananciaNeta / gananciaTotal) * 100) : 0;

  return {
    inversionTotal: Math.round(inversionTotal * 100) / 100,
    gananciaTotal: Math.round(gananciaTotal * 100) / 100,
    gananciaNeta: Math.round(gananciaNeta * 100) / 100,
    margen,
  };
}
