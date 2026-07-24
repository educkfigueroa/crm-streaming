"use server";

import { createClient } from "@/lib/supabase/server";
import type { Account, AccountInput } from "@/types";

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }

  return data as Account[];
}

export async function getAccount(id: string): Promise<Account | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching account:", error);
    return null;
  }

  return data as Account;
}

export async function createAccount(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma") as string;
  const correo = formData.get("correo") as string || null;
  const contraseña = formData.get("contraseña") as string || null;
  const totalPerfiles = parseInt(formData.get("total_perfiles") as string) || 1;
  const precioCosto = parseFloat(formData.get("precio_costo") as string) || null;
  const fechaVencimiento = formData.get("fecha_vencimiento_proveedor") as string || null;
  const servidorXtream = formData.get("servidor_xtream") as string || null;
  const urlServer = formData.get("url_server") as string || null;
  const usuarioXtream = formData.get("usuario_xtream") as string || null;

  if (!plataforma) {
    return { error: "La plataforma es requerida" };
  }

  const { error } = await supabase.from("accounts").insert({
    plataforma,
    correo,
    contraseña,
    total_perfiles: totalPerfiles,
    precio_costo: precioCosto,
    fecha_vencimiento_proveedor: fechaVencimiento || null,
    servidor_xtream: servidorXtream,
    url_server: urlServer,
    usuario_xtream: usuarioXtream,
  });

  if (error) {
    console.error("Error creating account:", error);
    return { error: "Error al crear la cuenta" };
  }

  return { success: true };
}

export async function updateAccount(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const plataforma = formData.get("plataforma") as string;
  const correo = formData.get("correo") as string || null;
  const contraseña = formData.get("contraseña") as string || null;
  const totalPerfiles = parseInt(formData.get("total_perfiles") as string) || 1;
  const precioCosto = parseFloat(formData.get("precio_costo") as string) || null;
  const fechaVencimiento = formData.get("fecha_vencimiento_proveedor") as string || null;
  const servidorXtream = formData.get("servidor_xtream") as string || null;
  const urlServer = formData.get("url_server") as string || null;
  const usuarioXtream = formData.get("usuario_xtream") as string || null;

  if (!plataforma) {
    return { error: "La plataforma es requerida" };
  }

  const { error } = await supabase
    .from("accounts")
    .update({
      plataforma,
      correo,
      contraseña,
      total_perfiles: totalPerfiles,
      precio_costo: precioCosto,
      fecha_vencimiento_proveedor: fechaVencimiento || null,
      servidor_xtream: servidorXtream,
      url_server: urlServer,
      usuario_xtream: usuarioXtream,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating account:", error);
    return { error: "Error al actualizar la cuenta" };
  }

  return { success: true };
}

export async function deleteAccount(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase.from("accounts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting account:", error);
    return { error: "Error al eliminar la cuenta" };
  }

  return { success: true };
}
