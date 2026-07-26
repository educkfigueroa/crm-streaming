import { getPlataformaByValue, isIptv } from "./constants";
import type { SubscriptionWithDetails } from "@/types";

function getPlatformName(sub: SubscriptionWithDetails): string {
  const plataforma = sub.accounts
    ? getPlataformaByValue(sub.accounts.plataforma)
    : null;
  const label = plataforma?.label || sub.accounts?.plataforma || "el servicio";
  if (label.startsWith("HBO Max")) return "HBO Max";
  return label;
}

function getClientName(sub: SubscriptionWithDetails): string {
  return (sub.clients as { nombre_completo?: string })?.nombre_completo || "";
}

function isIptvSub(sub: SubscriptionWithDetails): boolean {
  return isIptv(sub.accounts?.plataforma || "");
}

function getCredential(sub: SubscriptionWithDetails): string {
  if (isIptvSub(sub)) return sub.nombre_perfil || sub.accounts?.usuario_xtream || "";
  return sub.accounts?.correo || "";
}

function getPassword(sub: SubscriptionWithDetails): string {
  if (isIptvSub(sub)) return sub.pin_perfil || sub.accounts?.contraseña || "";
  return sub.accounts?.contraseña || "";
}

function getServerUrl(sub: SubscriptionWithDetails): string {
  return sub.accounts?.url_server || sub.accounts?.servidor_xtream || "";
}

export function generateWelcomeMessage(sub: SubscriptionWithDetails): string {
  const platform = getPlatformName(sub);
  const credential = getCredential(sub);
  const password = getPassword(sub);
  const fecha = new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE");

  if (isIptvSub(sub)) {
    const serverUrl = getServerUrl(sub);
    let message = `📺 Datos de acceso a ${platform}:\n\n`;
    if (serverUrl) {
      message += `🌐 URL: ${serverUrl}\n`;
    }
    message += `👤 Usuario: ${credential}\n`;
    message += `🔑 Contraseña: ${password}\n`;
    message += `\n📅 Vence: ${fecha}`;
    return message;
  }

  let message = `📺 Datos de acceso a ${platform}:\n\n`;
  message += `👤 Usuario: ${credential}\n`;
  if (password) {
    message += `🔑 Contraseña: ${password}\n`;
  }
  message += `🎭 Perfil: ${sub.nombre_perfil}\n`;
  if (sub.pin_perfil) {
    message += `🔒 PIN: ${sub.pin_perfil}\n`;
  }
  message += `\n📅 Vence: ${fecha}`;
  return message;
}

export function generatePasswordUpdateMessage(
  sub: SubscriptionWithDetails
): string {
  const platform = getPlatformName(sub);
  const credential = getCredential(sub);
  const password = getPassword(sub);

  if (isIptvSub(sub)) {
    const serverUrl = getServerUrl(sub);
    let message = `🔄 Se actualizó la contraseña de ${platform}:\n\n`;
    if (serverUrl) {
      message += `🌐 URL: ${serverUrl}\n`;
    }
    message += `👤 Usuario: ${credential}\n`;
    message += `🔑 Contraseña: ${password}`;
    return message;
  }

  let message = `🔄 Se actualizó la contraseña de ${platform}:\n\n`;
  message += `👤 Usuario: ${credential}\n`;
  message += `🔑 Contraseña: ${password}\n`;
  message += `🎭 Perfil: ${sub.nombre_perfil}\n`;
  if (sub.pin_perfil) {
    message += `🔒 PIN: ${sub.pin_perfil}\n`;
  }
  return message;
}

export function generateRenewalMessage(sub: SubscriptionWithDetails): string {
  const clientName = getClientName(sub);
  const platform = getPlatformName(sub);
  const fecha = new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE");

  let message = `¡Hola ${clientName}! 👋\n\n`;
  message += `📅 Tu suscripción a *${platform}* vence el *${fecha}*.\n\n`;
  message += `💰 Para continuar disfrutando del servicio, por favor realiza el pago correspondiente.\n\n`;
  message += `¿Deseas renovar? Responde a este mensaje y te atiendo. 😊`;

  return message;
}

export function generateExpiryMessage(sub: SubscriptionWithDetails): string {
  const clientName = getClientName(sub);
  const platform = getPlatformName(sub);

  let message = `¡Hola ${clientName}! 👋\n\n`;
  message += `⚠️ Tu suscripción a *${platform}* ha vencido.\n\n`;
  message += `Si deseas reactivar el servicio, por favor contactame.\n\n`;
  message += `¡Espero verte pronto! 🙂`;

  return message;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encodedMessage}`;
}
