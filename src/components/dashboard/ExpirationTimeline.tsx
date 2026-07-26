import Link from "next/link";
import { Clock } from "lucide-react";
import type { SubscriptionWithDetails } from "@/types";
import { getPlataformaByValue, getPlatformColorClasses } from "@/lib/constants";

interface ExpirationTimelineProps {
  subscriptions: SubscriptionWithDetails[];
}

function getDaysUntilExpiry(fechaVencimiento: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(fechaVencimiento);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDotColor(days: number): string {
  if (days <= 0) return "bg-red-500 ring-4 ring-red-500/20";
  if (days <= 2) return "bg-red-400 ring-4 ring-red-400/20";
  if (days <= 5) return "bg-amber-500 ring-4 ring-amber-500/20";
  return "bg-emerald-500 ring-4 ring-emerald-500/20";
}

function getLineColor(days: number): string {
  if (days <= 2) return "bg-red-500/20";
  if (days <= 5) return "bg-amber-500/20";
  return "bg-emerald-500/20";
}

function getTextColor(days: number): string {
  if (days <= 0) return "text-red-500 dark:text-red-400";
  if (days <= 2) return "text-red-400 dark:text-red-300";
  if (days <= 5) return "text-amber-500 dark:text-amber-400";
  return "text-emerald-500 dark:text-emerald-400";
}

export function ExpirationTimeline({ subscriptions }: ExpirationTimelineProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No hay vencimientos próximos
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {subscriptions.map((sub, i) => {
        const days = getDaysUntilExpiry(sub.fecha_vencimiento);
        const plataforma = sub.accounts
          ? getPlataformaByValue(sub.accounts.plataforma)
          : null;
        const colorKey = plataforma?.color ?? "slate";
        const isLast = i === subscriptions.length - 1;

        return (
          <div key={sub.id} className="relative pb-4 last:pb-0">
            {/* Timeline line */}
            {!isLast && (
              <div className={`absolute left-[7px] top-3 h-full w-0.5 ${getLineColor(days)}`} />
            )}

            {/* Dot */}
            <div className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full ${getDotColor(days)}`} />

            {/* Content */}
            <Link
              href="/suscripciones"
              className="ml-6 block rounded-lg p-3 transition-all duration-300 hover:bg-accent/50 hover:translate-x-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {sub.nombre_perfil}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getPlatformColorClasses(colorKey).dot}`} />
                    <p className="text-xs text-muted-foreground truncate">
                      {(sub.clients as { nombre_completo?: string })?.nombre_completo ?? "Sin cliente"} · {plataforma?.label || sub.accounts?.plataforma || ""}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold tabular-nums ${getTextColor(days)}`}>
                    {days <= 0 ? "Hoy" : `${days}d`}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
