"use server";

import webPush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { formatDateOnly, todayDateOnly } from "@/lib/utils";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@crm-streaming.app",
    vapidPublicKey,
    vapidPrivateKey
  );
}

async function broadcastPush(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: string
): Promise<{ success: boolean; sent?: number; error?: string }> {
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (error || !subscriptions?.length) {
    return { success: false, error: "No hay suscripciones push registradas" };
  }

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }

  return { success: true, sent };
}

export async function sendExpirationNotification(
  clienteNombre: string,
  plataforma: string,
  fechaVencimiento: string,
  daysBefore: number = 2
): Promise<{ success: boolean; sent?: number; error?: string }> {
  try {
    const supabase = await createClient();

    const diaStr = formatDateOnly(fechaVencimiento, "es-PE", {
      day: "numeric",
      month: "long",
    });

    const payload = JSON.stringify({
      title: "⏰ Suscripción por vencer",
      body: `La suscripción de ${clienteNombre} en ${plataforma} vence en ${daysBefore} días (${diaStr}). ¡Renueva ahora!`,
      url: "/",
      tag: "expiration-warning",
      icon: "/gstreaming.png",
    });

    return await broadcastPush(supabase, payload);
  } catch (error) {
    console.error("Error sending expiration notification:", error);
    return { success: false, error: "Error al enviar notificación" };
  }
}

export async function sendRenewalNotification(
  clienteNombre: string,
  plataforma: string,
  fechaVencimiento: string
): Promise<{ success: boolean; sent?: number; error?: string }> {
  try {
    const supabase = await createClient();

    const fechaStr = formatDateOnly(fechaVencimiento, "es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).replace(/,/g, "");

    const payload = JSON.stringify({
      title: "✅ Suscripción renovada",
      body: `🎉 ¡La suscripción de ${clienteNombre} en ${plataforma} fue renovada con éxito!\n📅 Nueva fecha de vencimiento: ${fechaStr}.`,
      url: "/",
      tag: "renewal-success",
      icon: "/gstreaming.png",
    });

    return await broadcastPush(supabase, payload);
  } catch (error) {
    console.error("Error sending renewal notification:", error);
    return { success: false, error: "Error al enviar notificación" };
  }
}

export async function scheduleExpirationNotifications(): Promise<{
  success: boolean;
  notified?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const hoyStr = todayDateOnly();
    const limite = new Date();
    limite.setDate(limite.getDate() + 2);
    const limiteStr = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, "0")}-${String(limite.getDate()).padStart(2, "0")}`;

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        fecha_vencimiento,
        clients (nombre_completo, alias),
        accounts (plataforma)
      `)
      .gte("fecha_vencimiento", hoyStr)
      .lte("fecha_vencimiento", limiteStr);

    if (error || !subscriptions?.length) {
      return { success: true, notified: 0 };
    }

    let notified = 0;
    for (const sub of subscriptions) {
      const client = sub.clients as unknown as { nombre_completo: string; alias?: string } | null;
      const account = sub.accounts as unknown as { plataforma: string } | null;

      if (!client || !account) continue;

      const result = await sendExpirationNotification(
        client.alias || client.nombre_completo,
        account.plataforma,
        sub.fecha_vencimiento
      );

      if (result.success) {
        notified++;
      }
    }

    return { success: true, notified };
  } catch (error) {
    console.error("Error scheduling notifications:", error);
    return { success: false, error: "Error al programar notificaciones" };
  }
}
