export interface Account {
  id: string;
  plataforma: string;
  correo: string | null;
  contraseña: string | null;
  total_perfiles: number;
  proveedor: string | null;
  precio_costo: number | null;
  fecha_vencimiento_proveedor: string | null;
  servidor_xtream: string | null;
  url_server: string | null;
  url_panel_iptv: string | null;
  usuario_xtream: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  nombre_completo: string;
  alias: string | null;
  whatsapp: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  cliente_id: string;
  cuenta_id: string;
  nombre_perfil: string;
  pin_perfil: string | null;
  fecha_inicio: string;
  fecha_vencimiento: string;
  precio_cobrado: number | null;
  estado: "Activo" | "Por Vencer" | "Vencido" | "Suspendido";
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithDetails extends Subscription {
  clients?: Client;
  accounts?: Account;
  estadoCalculado?: string;
}

export interface DashboardStats {
  totalCuentas: number;
  totalClientes: number;
  suscripcionesActivas: number;
  porVencer: number;
  vencidas: number;
}

export type SubscriptionStatus = "Activo" | "Por Vencer" | "Vencido" | "Suspendido";

export interface AccountInput {
  plataforma: string;
  correo?: string | null;
  contraseña?: string | null;
  total_perfiles: number;
  proveedor?: string | null;
  precio_costo?: number | null;
  fecha_vencimiento_proveedor?: string | null;
  servidor_xtream?: string | null;
  url_server?: string | null;
  usuario_xtream?: string | null;
}

export interface GlobalSearchClient {
  id: string;
  nombre_completo: string;
  alias: string | null;
  whatsapp: string | null;
}

export interface GlobalSearchSubscription {
  id: string;
  nombre_perfil: string;
  fecha_vencimiento: string;
  cliente_id: string;
  clients?: { id: string; nombre_completo: string } | null;
  accounts?: { plataforma: string } | null;
}

export interface GlobalSearchResult {
  clients: GlobalSearchClient[];
  subscriptions: GlobalSearchSubscription[];
}
