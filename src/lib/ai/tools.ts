"use server";

import { createClient } from "@/lib/supabase/server";
import { getPlataformaByValue, isIptv } from "@/lib/constants";
import type { SubscriptionWithDetails } from "@/types";

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

function getPlatformLabel(sub: SubscriptionWithDetails): string {
  const p = sub.accounts ? getPlataformaByValue(sub.accounts.plataforma) : null;
  return p?.label || sub.accounts?.plataforma || "Desconocido";
}

function buildWelcomeMessage(sub: SubscriptionWithDetails): string {
  const platform = getPlatformLabel(sub);
  const isIptvSub = isIptv(sub.accounts?.plataforma || "");
  const credential = isIptvSub
    ? sub.accounts?.usuario_xtream || ""
    : sub.accounts?.correo || "";
  const password = sub.accounts?.contraseña || "";
  const fecha = new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE");

  if (isIptvSub) {
    const url = sub.accounts?.url_server || sub.accounts?.servidor_xtream || "";
    let msg = `📺 Datos de acceso a ${platform}:\n\n`;
    if (url) msg += `🌐 URL: ${url}\n`;
    msg += `👤 Usuario: ${credential}\n`;
    msg += `🔑 Contraseña: ${password}\n`;
    msg += `\n📅 Vence: ${fecha}`;
    return msg;
  }

  let msg = `📺 Datos de acceso a ${platform}:\n\n`;
  msg += `👤 Usuario: ${credential}\n`;
  if (password) msg += `🔑 Contraseña: ${password}\n`;
  msg += `🎭 Perfil: ${sub.nombre_perfil}\n`;
  if (sub.pin_perfil) msg += `🔒 PIN: ${sub.pin_perfil}\n`;
  msg += `\n📅 Vence: ${fecha}`;
  return msg;
}

function buildRenewalMessage(sub: SubscriptionWithDetails): string {
  const clientName =
    (sub.clients as { nombre_completo?: string })?.nombre_completo || "";
  const platform = getPlatformLabel(sub);
  const fecha = new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE");
  return (
    `¡Hola ${clientName}! 👋\n\n` +
    `📅 Tu suscripción a *${platform}* vence el *${fecha}*.\n\n` +
    `💰 Para continuar disfrutando del servicio, por favor realiza el pago correspondiente.\n\n` +
    `¿Deseas renovar? Responde a este mensaje y te atiendo. 😊`
  );
}

export async function getDashboardStatsAction() {
  const supabase = await createClient();
  const [cuentas, clientes, subs, cuentasCosto, subsCobrado] = await Promise.all([
    supabase.from("accounts").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("fecha_vencimiento"),
    supabase.from("accounts").select("precio_costo").not("plataforma", "eq", "iptv"),
    supabase.from("subscriptions").select("precio_cobrado"),
  ]);

  let activas = 0;
  let porVencer = 0;
  let vencidas = 0;

  for (const sub of subs.data || []) {
    const estado = calcularEstado(sub.fecha_vencimiento);
    if (estado === "Activo") activas++;
    else if (estado === "Por Vencer") porVencer++;
    else vencidas++;
  }

  const inversionTotal = (cuentasCosto.data || []).reduce((s, a) => s + (a.precio_costo || 0), 0);
  const gananciaTotal = (subsCobrado.data || []).reduce((s, s2) => s + (s2.precio_cobrado || 0), 0);

  return {
    totalCuentas: cuentas.count ?? 0,
    totalClientes: clientes.count ?? 0,
    suscripcionesActivas: activas,
    porVencer,
    vencidas,
    inversionTotal: Math.round(inversionTotal * 100) / 100,
    gananciaTotal: Math.round(gananciaTotal * 100) / 100,
    gananciaNeta: Math.round((gananciaTotal - inversionTotal) * 100) / 100,
  };
}

export async function getSubscriptionsAction(filters?: {
  cliente?: string;
  plataforma?: string;
  estado?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("subscriptions")
    .select(
      `*, clients (id, nombre_completo, whatsapp), accounts (id, plataforma, correo, usuario_xtream, total_perfiles, contraseña, url_server, servidor_xtream)`
    )
    .order("fecha_vencimiento", { ascending: true });

  if (filters?.estado) query = query.eq("estado", filters.estado);

  const { data, error } = await query;
  if (error) return [];

  let results = (data as unknown as SubscriptionWithDetails[]) || [];

  if (filters?.cliente) {
    const search = filters.cliente.toLowerCase();
    results = results.filter((s) => {
      const name =
        (s.clients as { nombre_completo?: string })?.nombre_completo || "";
      return name.toLowerCase().includes(search);
    });
  }
  if (filters?.plataforma) {
    results = results.filter(
      (s) => s.accounts?.plataforma === filters.plataforma
    );
  }

  return results.map((s) => ({
    id: s.id,
    cliente: (s.clients as { nombre_completo?: string })?.nombre_completo || "",
    plataforma: getPlatformLabel(s),
    perfil: s.nombre_perfil,
    fechaVencimiento: s.fecha_vencimiento,
    precio: s.precio_cobrado,
    estado: s.estado,
    whatsapp: (s.clients as { whatsapp?: string })?.whatsapp || null,
  }));
}

export async function getClientSubscriptionsAction(nombreCliente: string) {
  const supabase = await createClient();
  const search = nombreCliente.toLowerCase();

  const { data: clients, error: clientsErr } = await supabase
    .from("clients")
    .select("id, nombre_completo, whatsapp, alias")
    .ilike("nombre_completo", `%${search}%`)
    .limit(5);

  if (clientsErr || !clients?.length) return { found: false, clientes: [] };

  const results = [];
  for (const client of clients) {
    const { data: subs } = await supabase
      .from("subscriptions")
      .select(
        `*, accounts (id, plataforma, correo, usuario_xtream, contraseña, url_server, servidor_xtream)`
      )
      .eq("cliente_id", client.id)
      .order("fecha_vencimiento", { ascending: true });

    results.push({
      cliente: {
        id: client.id,
        nombre: client.nombre_completo,
        whatsapp: client.whatsapp,
        alias: client.alias,
      },
      suscripciones: (subs as unknown as SubscriptionWithDetails[] || []).map(
        (s) => ({
          id: s.id,
          plataforma: getPlatformLabel(s),
          perfil: s.nombre_perfil,
          fechaVencimiento: s.fecha_vencimiento,
          precio: s.precio_cobrado,
          estado: s.estado,
        })
      ),
    });
  }

  return { found: true, clientes: results };
}

export async function getClientsAction(busqueda?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, nombre_completo, whatsapp, alias")
    .order("nombre_completo", { ascending: true });

  if (busqueda) query = query.ilike("nombre_completo", `%${busqueda}%`);

  const { data, error } = await query.limit(20);
  if (error) return [];
  return data || [];
}

export async function getAccountsAction(plataforma?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("accounts")
    .select("id, plataforma, correo, usuario_xtream, total_perfiles")
    .order("created_at", { ascending: false });

  if (plataforma) query = query.eq("plataforma", plataforma);

  const { data, error } = await query.limit(20);
  if (error) return [];
  return (data || []).map((a) => ({
    id: a.id,
    plataforma: getPlataformaByValue(a.plataforma)?.label || a.plataforma,
    plataformaValue: a.plataforma,
    correo: a.correo,
    usuarioXtream: a.usuario_xtream,
    totalPerfiles: a.total_perfiles,
  }));
}

export async function getExpiringSoonAction(dias: number = 7) {
  const supabase = await createClient();
  const today = new Date();
  const limit = new Date();
  limit.setDate(today.getDate() + dias);

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `*, clients (nombre_completo, whatsapp), accounts (plataforma, correo)`
    )
    .lte("fecha_vencimiento", limit.toISOString().split("T")[0])
    .in("estado", ["Activo", "Por Vencer"])
    .order("fecha_vencimiento", { ascending: true })
    .limit(20);

  if (error) return [];
  return (data as unknown as SubscriptionWithDetails[] || []).map((s) => ({
    cliente:
      (s.clients as { nombre_completo?: string })?.nombre_completo || "",
    plataforma: getPlatformLabel(s),
    fechaVencimiento: s.fecha_vencimiento,
    estado: s.estado,
    diasRestantes: Math.ceil(
      (new Date(s.fecha_vencimiento).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  }));
}

export async function getMonthlyRevenueAction() {
  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startDate = sixMonthsAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("fecha_inicio, precio_cobrado")
    .gte("fecha_inicio", startDate)
    .order("fecha_inicio", { ascending: true });

  if (error) return [];

  const monthlyMap = new Map<string, number>();
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-PE", {
      month: "short",
      year: "2-digit",
    });
    monthlyMap.set(key, 0);
    monthlyMap.set(`${key}_label`, label as unknown as number);
  }

  for (const sub of data || []) {
    if (!sub.fecha_inicio || !sub.precio_cobrado) continue;
    const date = new Date(sub.fecha_inicio);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + sub.precio_cobrado);
    }
  }

  const result = [];
  for (const [key, total] of monthlyMap) {
    if (key.endsWith("_label")) continue;
    result.push({
      mes: monthlyMap.get(`${key}_label`) || key,
      total: Math.round((total as number) * 100) / 100,
    });
  }

  return result;
}

export async function createClientAction(params: {
  nombre_completo: string;
  whatsapp?: string;
  alias?: string;
  notas?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({
    nombre_completo: params.nombre_completo,
    whatsapp: params.whatsapp || null,
    alias: params.alias || null,
    notas: params.notas || null,
  });
  if (error) return { success: false, error: "Error al crear el cliente" };
  return { success: true };
}

export async function createAccountAction(params: {
  plataforma: string;
  correo?: string;
  contraseña?: string;
  total_perfiles?: number;
  precio_costo?: number;
  usuario_xtream?: string;
  url_server?: string;
  servidor_xtream?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("accounts").insert({
    plataforma: params.plataforma,
    correo: params.correo || null,
    contraseña: params.contraseña || null,
    total_perfiles: params.total_perfiles || 1,
    precio_costo: params.precio_costo || null,
    usuario_xtream: params.usuario_xtream || null,
    url_server: params.url_server || null,
    servidor_xtream: params.servidor_xtream || null,
  });
  if (error) return { success: false, error: "Error al crear la cuenta: " + error.message };
  return { success: true };
}

export async function createSubscriptionAction(params: {
  cliente_id: string;
  cuenta_id: string;
  nombre_perfil: string;
  pin_perfil?: string;
  precio_cobrado?: number;
  fecha_inicio?: string;
}) {
  const supabase = await createClient();
  const today = params.fecha_inicio || new Date().toISOString().split("T")[0];
  const venc = new Date(today);
  venc.setMonth(venc.getMonth() + 1);
  const fechaVenc = venc.toISOString().split("T")[0];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencDate = new Date(fechaVenc);
  vencDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((vencDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  let estado = "Activo";
  if (diffDays <= 0) estado = "Vencido";
  else if (diffDays <= 7) estado = "Por Vencer";

  const { error } = await supabase.from("subscriptions").insert({
    cliente_id: params.cliente_id,
    cuenta_id: params.cuenta_id,
    nombre_perfil: params.nombre_perfil,
    pin_perfil: params.pin_perfil || null,
    fecha_inicio: today,
    fecha_vencimiento: fechaVenc,
    precio_cobrado: params.precio_cobrado || null,
    estado,
  });
  if (error) return { success: false, error: "Error al crear la suscripción: " + error.message };
  return { success: true, fechaVencimiento: fechaVenc, estado };
}

export async function deleteSubscriptionAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);
  if (error) return { success: false, error: "Error al eliminar la suscripción" };
  return { success: true };
}

export async function updateSubscriptionAction(params: {
  id: string;
  nombre_perfil?: string;
  pin_perfil?: string;
  precio_cobrado?: number;
  fecha_inicio?: string;
  fecha_vencimiento?: string;
  estado?: string;
}) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.nombre_perfil !== undefined) updates.nombre_perfil = params.nombre_perfil;
  if (params.pin_perfil !== undefined) updates.pin_perfil = params.pin_perfil || null;
  if (params.precio_cobrado !== undefined) updates.precio_cobrado = params.precio_cobrado;
  if (params.fecha_inicio !== undefined) updates.fecha_inicio = params.fecha_inicio;
  if (params.fecha_vencimiento !== undefined) updates.fecha_vencimiento = params.fecha_vencimiento;
  if (params.estado !== undefined) updates.estado = params.estado;

  const { error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", params.id);
  if (error) return { success: false, error: "Error al actualizar la suscripción" };
  return { success: true };
}

export async function renewSubscriptionAction(id: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: currentSub } = await supabase
    .from("subscriptions")
    .select("fecha_vencimiento")
    .eq("id", id)
    .single();

  const baseDate = currentSub?.fecha_vencimiento || today;
  const venc = new Date(baseDate);
  venc.setMonth(venc.getMonth() + 1);
  const fechaVenc = venc.toISOString().split("T")[0];

  const { error } = await supabase
    .from("subscriptions")
    .update({
      fecha_inicio: today,
      fecha_vencimiento: fechaVenc,
      estado: "Activo",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: "Error al renovar" };
  return { success: true, fechaVencimiento: fechaVenc };
}

export async function generateWhatsAppMessageAction(
  subscriptionIds: string[],
  tipo: "credenciales" | "renovacion" = "credenciales"
) {
  const supabase = await createClient();

  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select(
      `*, clients (id, nombre_completo, whatsapp), accounts (id, plataforma, correo, usuario_xtream, contraseña, url_server, servidor_xtream)`
    )
    .in("id", subscriptionIds);

  if (error || !subs?.length)
    return { success: false, error: "No se encontraron suscripciones" };

  const allSubs = subs as unknown as SubscriptionWithDetails[];
  const client =
    (allSubs[0].clients as { nombre_completo?: string })?.nombre_completo ||
    "";
  const phone =
    (allSubs[0].clients as { whatsapp?: string })?.whatsapp || "";

  const messages =
    tipo === "renovacion"
      ? allSubs.map(buildRenewalMessage)
      : allSubs.map(buildWelcomeMessage);

  const combinedMessage =
    allSubs.length === 1
      ? messages[0]
      : `¡Hola ${client}! 👋\n\nAquí tienes todas tus credenciales:\n\n${messages.join("\n\n---\n\n")}`;

  return {
    success: true,
    message: combinedMessage,
    phone,
    clientName: client,
  };
}
