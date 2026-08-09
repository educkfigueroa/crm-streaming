"use server";

import { createClient } from "@/lib/supabase/server";

export interface BackupData {
  generado: string;
  clientes: unknown[];
  cuentas: unknown[];
  suscripciones: unknown[];
  notificaciones: unknown[];
}

export async function exportBackup(): Promise<{
  success: boolean;
  data?: BackupData;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [clientes, cuentas, suscripciones, notificaciones] =
      await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("accounts").select("*"),
        supabase.from("subscriptions").select("*"),
        supabase.from("push_subscriptions").select("*"),
      ]);

    if (clientes.error || cuentas.error || suscripciones.error || notificaciones.error) {
      console.error("Error exportando respaldo:", {
        clientes: clientes.error,
        cuentas: cuentas.error,
        suscripciones: suscripciones.error,
        notificaciones: notificaciones.error,
      });
      return { success: false, error: "Error al leer los datos" };
    }

    return {
      success: true,
      data: {
        generado: new Date().toISOString(),
        clientes: clientes.data,
        cuentas: cuentas.data,
        suscripciones: suscripciones.data,
        notificaciones: notificaciones.data,
      },
    };
  } catch (error) {
    console.error("Error exporting backup:", error);
    return { success: false, error: "Error al exportar los datos" };
  }
}
