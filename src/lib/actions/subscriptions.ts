"use server";

import { createClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionWithDetails } from "@/types";

function addOneMonth(dateStr: string): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0];
}

export async function getSubscriptions(): Promise<SubscriptionWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      clients (id, nombre_completo, whatsapp),
      accounts (id, plataforma, correo, usuario_xtream, total_perfiles, contraseña)
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
      accounts (id, plataforma, correo, usuario_xtream, total_perfiles, contraseña)
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
  const fechaInicio = formData.get("fecha_inicio") as string || new Date().toISOString().split("T")[0];
  const fechaVencimiento = formData.get("fecha_vencimiento") as string || addOneMonth(fechaInicio);
  const precioCobrado = parseFloat(formData.get("precio_cobrado") as string) || null;
  const estado = formData.get("estado") as string;

  if (!clienteId || !cuentaId || !nombrePerfil || !estado) {
    return { error: "Todos los campos obligatorios deben ser completados" };
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
