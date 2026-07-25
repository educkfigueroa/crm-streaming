import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
} from "ai";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import {
  getDashboardStatsAction,
  getSubscriptionsAction,
  getClientSubscriptionsAction,
  getClientsAction,
  getAccountsAction,
  getExpiringSoonAction,
  getMonthlyRevenueAction,
  createClientAction,
  createAccountAction,
  createSubscriptionAction,
  deleteSubscriptionAction,
  updateSubscriptionAction,
  renewSubscriptionAction,
  generateWhatsAppMessageAction,
} from "@/lib/ai/tools";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("[chat] GOOGLE_GENERATIVE_AI_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY no configurada" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: google("gemini-3.5-flash"),
      instructions: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      stopWhen: isStepCount(10),
      tools: {
        getDashboardStats: {
          description: "Obtener estadísticas generales del CRM: total cuentas, total clientes, suscripciones activas, por vencer",
          inputSchema: z.object({}),
          execute: () => getDashboardStatsAction(),
        },
        getSubscriptions: {
          description: "Listar suscripciones con filtros opcionales por cliente, plataforma o estado",
          inputSchema: z.object({
            cliente: z.string().optional().describe("Filtrar por nombre del cliente (parcial)"),
            plataforma: z.string().optional().describe("Filtrar por plataforma: netflix, disney, hbo_standard, hbo_platinum, amazon, paramount, vix, crunchyroll, spotify, apple_music, iptv, otro"),
            estado: z.string().optional().describe("Filtrar por estado: Activo, Por Vencer, Vencido, Suspendido"),
          }),
          execute: (params) => getSubscriptionsAction({ cliente: params.cliente, plataforma: params.plataforma, estado: params.estado }),
        },
        getClientSubscriptions: {
          description: "Obtener todas las suscripciones de un cliente por nombre. Retorna cliente con sus datos y todas sus suscripciones agrupadas.",
          inputSchema: z.object({
            nombreCliente: z.string().describe("Nombre del cliente a buscar"),
          }),
          execute: (params) => getClientSubscriptionsAction(params.nombreCliente),
        },
        getClients: {
          description: "Listar clientes, con opción de búsqueda por nombre",
          inputSchema: z.object({
            busqueda: z.string().optional().describe("Buscar clientes por nombre (parcial)"),
          }),
          execute: (params) => getClientsAction(params.busqueda),
        },
        getAccounts: {
          description: "Listar cuentas de streaming, opcionalmente filtrar por plataforma",
          inputSchema: z.object({
            plataforma: z.string().optional().describe("Filtrar por plataforma"),
          }),
          execute: (params) => getAccountsAction(params.plataforma),
        },
        getExpiringSoon: {
          description: "Obtener suscripciones que vencen pronto (por defecto 7 días)",
          inputSchema: z.object({
            dias: z.number().optional().describe("Número de días hacia adelante (default 7)"),
          }),
          execute: (params) => getExpiringSoonAction(params.dias || 7),
        },
        getMonthlyRevenue: {
          description: "Obtener ingresos mensuales de los últimos 7 meses",
          inputSchema: z.object({}),
          execute: () => getMonthlyRevenueAction(),
        },
        createClient: {
          description: "Crear un nuevo cliente en el CRM",
          inputSchema: z.object({
            nombre_completo: z.string().describe("Nombre completo del cliente"),
            whatsapp: z.string().optional().describe("Número de WhatsApp del cliente"),
            alias: z.string().optional().describe("Alias o nombre corto del cliente"),
            notas: z.string().optional().describe("Notas adicionales sobre el cliente"),
          }),
          execute: (params) => createClientAction({ nombre_completo: params.nombre_completo, whatsapp: params.whatsapp, alias: params.alias, notas: params.notas }),
        },
        createAccount: {
          description: "Crear una nueva cuenta de streaming. Valores de plataforma: netflix, disney, hbo_standard, hbo_platinum, amazon, paramount, vix, crunchyroll, spotify, apple_music, iptv, otro",
          inputSchema: z.object({
            plataforma: z.string().describe("Plataforma: netflix, disney, hbo_standard, hbo_platinum, amazon, paramount, vix, crunchyroll, spotify, apple_music, iptv, otro"),
            correo: z.string().optional().describe("Correo de la cuenta (o usuario_xtream si es IPTV)"),
            contraseña: z.string().optional().describe("Contraseña de la cuenta"),
            total_perfiles: z.number().optional().describe("Total de perfiles disponibles (default 1)"),
            precio_costo: z.number().optional().describe("Costo mensual de la cuenta al proveedor"),
            usuario_xtream: z.string().optional().describe("Usuario Xtream (solo IPTV)"),
            url_server: z.string().optional().describe("URL del servidor (solo IPTV)"),
            servidor_xtream: z.string().optional().describe("Nombre del servidor Xtream (solo IPTV)"),
          }),
          execute: (params) => createAccountAction(params),
        },
        createSubscription: {
          description: "Crear una nueva suscripción vinculando un cliente con una cuenta. Usa getClients para obtener cliente_id y getAccounts para obtener cuenta_id. El precio_cobrado es lo que cobra al cliente (en soles).",
          inputSchema: z.object({
            cliente_id: z.string().describe("ID del cliente (obtener de getClients)"),
            cuenta_id: z.string().describe("ID de la cuenta (obtener de getAccounts)"),
            nombre_perfil: z.string().describe("Nombre del perfil en la plataforma"),
            pin_perfil: z.string().optional().describe("PIN del perfil (si aplica)"),
            precio_cobrado: z.number().optional().describe("Precio que cobra al cliente en soles (S/)"),
            fecha_inicio: z.string().optional().describe("Fecha de inicio YYYY-MM-DD (default: hoy)"),
          }),
          execute: (params) => createSubscriptionAction(params),
        },
        deleteSubscription: {
          description: "Eliminar una suscripción permanentemente. Solicita confirmación antes de ejecutar.",
          inputSchema: z.object({
            subscriptionId: z.string().describe("ID de la suscripción a eliminar"),
          }),
          execute: (params) => deleteSubscriptionAction(params.subscriptionId),
        },
        updateSubscription: {
          description: "Editar/actualizar una suscripción existente. Solo envía los campos que deseas cambiar.",
          inputSchema: z.object({
            subscriptionId: z.string().describe("ID de la suscripción a editar"),
            nombre_perfil: z.string().optional().describe("Nuevo nombre del perfil"),
            pin_perfil: z.string().optional().describe("Nuevo PIN del perfil"),
            precio_cobrado: z.number().optional().describe("Nuevo precio cobrado en soles"),
            fecha_inicio: z.string().optional().describe("Nueva fecha de inicio YYYY-MM-DD"),
            fecha_vencimiento: z.string().optional().describe("Nueva fecha de vencimiento YYYY-MM-DD"),
            estado: z.string().optional().describe("Nuevo estado: Activo, Por Vencer, Vencido, Suspendido"),
          }),
          execute: (params) => updateSubscriptionAction({
            id: params.subscriptionId,
            nombre_perfil: params.nombre_perfil,
            pin_perfil: params.pin_perfil,
            precio_cobrado: params.precio_cobrado,
            fecha_inicio: params.fecha_inicio,
            fecha_vencimiento: params.fecha_vencimiento,
            estado: params.estado,
          }),
        },
        renewSubscription: {
          description: "Renovar una suscripción: resetea fechas a hoy + 1 mes y estado a Activo",
          inputSchema: z.object({
            subscriptionId: z.string().describe("ID de la suscripción a renovar"),
          }),
          execute: (params) => renewSubscriptionAction(params.subscriptionId),
        },
        generateWhatsAppMessage: {
          description: "Generar mensaje de WhatsApp con credenciales o renovación para una o más suscripciones. Si son varias del mismo cliente, genera un solo mensaje combinado.",
          inputSchema: z.object({
            subscriptionIds: z.array(z.string()).describe("Array con los IDs de las suscripciones (uno o varios)"),
            tipo: z.enum(["credenciales", "renovacion"]).optional().describe("Tipo de mensaje"),
          }),
          execute: (params) => generateWhatsAppMessageAction(params.subscriptionIds, params.tipo || "credenciales"),
        },
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("[chat] API error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
