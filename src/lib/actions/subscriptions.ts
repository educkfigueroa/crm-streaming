"use server";

import { createClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionWithDetails } from "@/types";
import { sendExpirationNotification } from "./push";
import { calcularEstado, isUUID, parseDateOnly, todayDateOnly } from "@/lib/utils";

function addOneMonth(dateStr: string): string {
  const date = parseDateOnly(dateStr);
  date.setMonth(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

  const enriched = (data as unknown as SubscriptionWithDetails[]).map((sub) => ({
    ...sub,
    estadoCalculado: calcularEstado(sub.fecha_vencimiento),
  }));

  return enriched;
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

export async function createSubscription(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const clienteId = formData.get("cliente_id") as string;
  const cuentaId = formData.get("cuenta_id") as string;
  const nombrePerfil = formData.get("nombre_perfil") as string;
  const pinPerfil = formData.get("pin_perfil") as string || null;
  const fechaInicio = formData.get("fecha_inicio") as string || todayDateOnly();
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

  const vencimiento = parseDateOnly(fechaVencimiento);
  const hoy = new Date();
  const diffDays = Math.round((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
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
  id: string,
  months: number = 1
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const today = todayDateOnly();

  const { data: currentSub } = await supabase
    .from("subscriptions")
    .select("fecha_vencimiento")
    .eq("id", id)
    .single();

  const baseDate = currentSub?.fecha_vencimiento || today;
  const newStart = baseDate;
  const newDate = parseDateOnly(baseDate);
  newDate.setMonth(newDate.getMonth() + months);
  const newExpiry = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      fecha_inicio: newStart,
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
