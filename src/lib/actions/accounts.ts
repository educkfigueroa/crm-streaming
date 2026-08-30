"use server";

import { createClient } from "@/lib/supabase/server";
import { AccountSchema } from "@/lib/validations";
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

  const parsed = AccountSchema.safeParse({
    plataforma: formData.get("plataforma") as string,
    correo: formData.get("correo") as string || null,
    contraseña: formData.get("contraseña") as string || null,
    total_perfiles: parseInt(formData.get("total_perfiles") as string) || 1,
    precio_costo: parseFloat(formData.get("precio_costo") as string) || null,
    fecha_vencimiento_proveedor: formData.get("fecha_vencimiento_proveedor") as string || null,
    servidor_xtream: formData.get("servidor_xtream") as string || null,
    url_server: formData.get("url_server") as string || null,
    url_panel_iptv: formData.get("url_panel_iptv") as string || null,
    usuario_xtream: formData.get("usuario_xtream") as string || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("accounts").insert(parsed.data);

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

  const parsed = AccountSchema.safeParse({
    plataforma: formData.get("plataforma") as string,
    correo: formData.get("correo") as string || null,
    contraseña: formData.get("contraseña") as string || null,
    total_perfiles: parseInt(formData.get("total_perfiles") as string) || 1,
    precio_costo: parseFloat(formData.get("precio_costo") as string) || null,
    fecha_vencimiento_proveedor: formData.get("fecha_vencimiento_proveedor") as string || null,
    servidor_xtream: formData.get("servidor_xtream") as string || null,
    url_server: formData.get("url_server") as string || null,
    url_panel_iptv: formData.get("url_panel_iptv") as string || null,
    usuario_xtream: formData.get("usuario_xtream") as string || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("accounts")
    .update({
      ...parsed.data,
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
