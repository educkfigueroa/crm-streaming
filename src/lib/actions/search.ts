"use server";

import { createClient } from "@/lib/supabase/server";
import type { GlobalSearchResult } from "@/types";

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export async function globalSearch(query: string): Promise<GlobalSearchResult> {
  const q = query.trim();
  if (!q) return { clients: [], subscriptions: [] };

  const supabase = await createClient();
  const like = `%${escapeLike(q)}%`;

  const [clientsRes, subsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, nombre_completo, alias, whatsapp")
      .or(`nombre_completo.ilike.${like},alias.ilike.${like},whatsapp.ilike.${like}`)
      .limit(5),
    supabase
      .from("subscriptions")
      .select(`
        id, nombre_perfil, fecha_vencimiento, cliente_id,
        clients (id, nombre_completo),
        accounts (plataforma)
      `)
      .or(`nombre_perfil.ilike.${like}`)
      .limit(5),
  ]);

  return {
    clients: (clientsRes.data ?? []) as unknown as GlobalSearchResult["clients"],
    subscriptions: (subsRes.data ?? []) as unknown as GlobalSearchResult["subscriptions"],
  };
}
