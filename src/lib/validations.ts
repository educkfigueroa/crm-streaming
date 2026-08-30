import { z } from "zod";

// --- Client ---
export const ClientSchema = z.object({
  nombre_completo: z
    .string()
    .min(1, "El nombre es requerido")
    .max(200, "El nombre es muy largo")
    .refine((v) => !z.string().uuid().safeParse(v).success, "El nombre no puede ser un UUID"),
  alias: z.string().max(100).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  notas: z.string().max(1000).optional().nullable(),
});

export type ClientInput = z.infer<typeof ClientSchema>;

// --- Account ---
export const AccountSchema = z.object({
  plataforma: z.string().min(1, "La plataforma es requerida"),
  correo: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  contraseña: z.string().max(200).optional().nullable(),
  total_perfiles: z.number().int().min(1).max(50).default(1),
  proveedor: z.string().max(200).optional().nullable(),
  precio_costo: z.number().min(0).optional().nullable(),
  fecha_vencimiento_proveedor: z.string().optional().nullable(),
  servidor_xtream: z.string().max(200).optional().nullable(),
  url_server: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  url_panel_iptv: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  usuario_xtream: z.string().max(200).optional().nullable(),
});

export type AccountInputValidated = z.infer<typeof AccountSchema>;

// --- Subscription ---
export const SubscriptionSchema = z.object({
  cliente_id: z.string().uuid("ID de cliente inválido"),
  cuenta_id: z.string().uuid("ID de cuenta inválido"),
  nombre_perfil: z
    .string()
    .min(1, "El nombre del perfil es requerido")
    .max(200)
    .refine((v) => !z.string().uuid().safeParse(v).success, "El nombre no puede ser un UUID"),
  pin_perfil: z.string().max(20).optional().nullable(),
  fecha_inicio: z.string().optional(),
  fecha_vencimiento: z.string().optional(),
  precio_cobrado: z.number().min(0).optional().nullable(),
  estado: z.enum(["Activo", "Por Vencer", "Vencido", "Suspendido"]).optional(),
});

export type SubscriptionInput = z.infer<typeof SubscriptionSchema>;

// --- Search ---
export const SearchSchema = z.object({
  query: z.string().min(1).max(200),
});

// --- Phone ---
export const PhoneSchema = z.string().regex(/^\+?\d{7,15}$/, "Número de teléfono inválido").optional().nullable();
