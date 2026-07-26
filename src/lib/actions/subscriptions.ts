"use server";

import { createClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionWithDetails } from "@/types";
import { sendExpirationNotification } from "./push";

function addOneMonth(dateStr: string): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0];
}

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

export async function getSubscriptions(): Promise<SubscriptionWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      clients (id, nombre_completo, whatsapp),
      accounts (id, plataforma, correo, usuario_xtream, total_perfiles, contraseña, servidor_xtream, url_server)
    `)
    .order("fecha_vencimiento", { ascending: true });

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }

  return data as unknown as SubscriptionWithDetails[];
}

export async function getSubscription(id: string): Promise<SubscriptionWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      clients (id, nombre_completo, whatsapp),
      accounts (id, plataforma, correo, usuario_xtream, total_perfiles, contraseña, servidor_xtream, url_server)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data as unknown as SubscriptionWithDetails;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

export async function createSubscription(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const clienteId = formData.get("cliente_id") as string;
  const cuentaId = formData.get("cuenta_id") as string;
  const nombrePerfil = formData.get("nombre_perfil") as string;
  const pinPerfil = formData.get("pin_perfil") as string || null;
  const fechaInicio = formData.get("fecha_inicio") as string || new Date().toISOString().split("T")[0];
  const fechaVencimiento = formData.get("fecha_vencimiento") as string || addOneMonth(fechaInicio);
  const precioCobrado = parseFloat(formData.get("precio_cobrado") as string) || null;
  const estado = calcularEstado(fechaVencimiento);

  if (!clienteId || !cuentaId || !nombrePerfil) {
    return { error: "Todos los campos obligatorios deben ser completados" };
  }

  if (isUUID(nombrePerfil)) {
    return { error: "El nombre del perfil no puede ser un ID" };
  }

  const { error } = await supabase.from("subscriptions").insert({
    cliente_id: clienteId,
    cuenta_id: cuentaId,
    nombre_perfil: nombrePerfil,
    pin_perfil: pinPerfil,
    fecha_inicio: fechaInicio,
    fecha_vencimiento: fechaVencimiento,
    precio_cobrado: precioCobrado,
    estado,
  });

  if (error) {
    console.error("Error creating subscription:", error);
    return { error: "Error al crear la suscripción" };
  }

  const vencimiento = new Date(fechaVencimiento);
  const hoy = new Date();
  const diffDays = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 2) {
    const { data: client } = await supabase
      .from("clients").select("nombre_completo, alias").eq("id", clienteId).single();
    const { data: account } = await supabase
      .from("accounts").select("plataforma").eq("id", cuentaId).single();
    if (client && account) {
      sendExpirationNotification(
        client.alias || client.nombre_completo,
        account.plataforma,
        fechaVencimiento,
        diffDays
      );
    }
  }

  return { success: true };
}

export async function updateSubscription(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const clienteId = formData.get("cliente_id") as string;
  const cuentaId = formData.get("cuenta_id") as string;
  const nombrePerfil = formData.get("nombre_perfil") as string;
  const pinPerfil = formData.get("pin_perfil") as string || null;
  const fechaInicio = formData.get("fecha_inicio") as string;
  const fechaVencimiento = formData.get("fecha_vencimiento") as string || addOneMonth(fechaInicio);
  const precioCobrado = parseFloat(formData.get("precio_cobrado") as string) || null;
  const estado = formData.get("estado") as string;

  if (!clienteId || !cuentaId || !nombrePerfil || !estado) {
    return { error: "Todos los campos obligatorios deben ser completados" };
  }

  if (isUUID(nombrePerfil)) {
    return { error: "El nombre del perfil no puede ser un ID" };
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      cliente_id: clienteId,
      cuenta_id: cuentaId,
      nombre_perfil: nombrePerfil,
      pin_perfil: pinPerfil,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
      precio_cobrado: precioCobrado,
      estado,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating subscription:", error);
    return { error: "Error al actualizar la suscripción" };
  }

  return { success: true };
}

export async function renewSubscription(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const newExpiry = addOneMonth(today);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      fecha_inicio: today,
      fecha_vencimiento: newExpiry,
      estado: "Activo",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error renewing subscription:", error);
    return { error: "Error al renovar la suscripción" };
  }

  const sub = await getSubscription(id);
  if (sub) {
    const clientData = sub.clients as unknown as { alias?: string; nombre_completo: string } | null;
    const accountData = sub.accounts as unknown as { plataforma: string } | null;
    const clientName = clientData?.alias || clientData?.nombre_completo || "Cliente";
    const platform = accountData?.plataforma || "N/A";
    sendExpirationNotification(clientName, platform, newExpiry);
  }

  return { success: true };
}

export async function deleteSubscription(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting subscription:", error);
    return { error: "Error al eliminar la suscripción" };
  }

  return { success: true };
}
