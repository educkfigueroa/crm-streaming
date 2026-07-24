"use server";

import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

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

  const nombreCompleto = formData.get("nombre_completo") as string;
  const alias = formData.get("alias") as string || null;
  const whatsapp = formData.get("whatsapp") as string || null;
  const notas = formData.get("notas") as string || null;

  if (!nombreCompleto) {
    return { error: "El nombre completo es requerido" };
  }

  if (isUUID(nombreCompleto)) {
    return { error: "El nombre no puede ser un ID" };
  }

  const { error } = await supabase.from("clients").insert({
    nombre_completo: nombreCompleto,
    alias,
    whatsapp,
    notas,
  });

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

  const nombreCompleto = formData.get("nombre_completo") as string;
  const alias = formData.get("alias") as string || null;
  const whatsapp = formData.get("whatsapp") as string || null;
  const notas = formData.get("notas") as string || null;

  if (!nombreCompleto) {
    return { error: "El nombre completo es requerido" };
  }

  if (isUUID(nombreCompleto)) {
    return { error: "El nombre no puede ser un ID" };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      nombre_completo: nombreCompleto,
      alias,
      whatsapp,
      notas,
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
