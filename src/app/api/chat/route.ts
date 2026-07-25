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
