"use server";

import { createClient } from "@/lib/supabase/server";
import { ClientSchema } from "@/lib/validations";
import type { Client } from "@/types";

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("nombre_completo", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching client:", error);
    return null;
  }

  return data as Client;
}

export async function createClientAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const parsed = ClientSchema.safeParse({
    nombre_completo: formData.get("nombre_completo") as string,
    alias: formData.get("alias") as string || null,
    whatsapp: formData.get("whatsapp") as string || null,
    notas: formData.get("notas") as string || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("clients").insert(parsed.data);

  if (error) {
    console.error("Error creating client:", error);
    return { error: "Error al crear el cliente" };
  }

  return { success: true };
}

export async function updateClient(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const parsed = ClientSchema.safeParse({
    nombre_completo: formData.get("nombre_completo") as string,
    alias: formData.get("alias") as string || null,
    whatsapp: formData.get("whatsapp") as string || null,
    notas: formData.get("notas") as string || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating client:", error);
    return { error: "Error al actualizar el cliente" };
  }

  return { success: true };
}

export async function deleteClient(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    console.error("Error deleting client:", error);
    return { error: "Error al eliminar el cliente" };
  }

  return { success: true };
}
