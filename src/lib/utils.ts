import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Shared utilities (used across server actions and components) ---

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

// --- Date helpers ---
// "YYYY-MM-DD" strings (DATE columns de Supabase) se parsean como medianoche
// local; usando `new Date(value)` se interpretan como UTC y en zonas al oeste
// de UTC muestran/computan el día anterior.

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function formatDateOnly(
  value: string,
  locale: string = "es-PE",
  options?: Intl.DateTimeFormatOptions
): string {
  return parseDateOnly(value).toLocaleDateString(locale, options);
}

export function todayDateOnly(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function calcularEstado(fechaVencimiento: string): string {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = parseDateOnly(fechaVencimiento);
  const diffDays = Math.round((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Vencido";
  if (diffDays <= 7) return "Por Vencer";
  return "Activo";
}
