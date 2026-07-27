import Link from "next/link";
import type { SubscriptionWithDetails } from "@/types";
import { getPlataformaByValue, getPlatformColorClasses } from "@/lib/constants";

interface ExpiringSoonProps {
  subscriptions: SubscriptionWithDetails[];
}

function getDaysUntilExpiry(fechaVencimiento: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(fechaVencimiento);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryColor(days: number): string {
  if (days <= 2) return "text-red-500 dark:text-red-400";
  if (days <= 5) return "text-amber-500 dark:text-amber-400";
  return "text-emerald-500 dark:text-emerald-400";
}

function getExpiryDot(days: number): string {
  if (days <= 2) return "bg-red-500 dark:bg-red-400";
  if (days <= 5) return "bg-amber-500 dark:text-amber-400";
  return "bg-emerald-500 dark:bg-emerald-400";
}

export function ExpiringSoon({ subscriptions }: ExpiringSoonProps) {
  if (subscriptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No hay suscripciones por vencer
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {subscriptions.map((sub) => {
        const days = getDaysUntilExpiry(sub.fecha_vencimiento);
        const plataforma = sub.accounts
          ? getPlataformaByValue(sub.accounts.plataforma)
          : null;
        const clienteId = (sub.clients as { id?: string })?.id;

        return (
          <Link
            key={sub.id}
            href={clienteId ? `/suscripciones?cliente=${clienteId}` : "/suscripciones"}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 px-3 py-2.5 transition-all duration-200 hover:bg-accent/50 hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`h-2 w-2 rounded-full shrink-0 ${getExpiryDot(days)}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{sub.nombre_perfil}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {(sub.clients as { nombre_completo?: string })?.nombre_completo ?? "Sin cliente"}
                  {" · "}
                  <span className={getPlatformColorClasses(plataforma?.color ?? "slate").badge}>
                    {plataforma?.label || sub.accounts?.plataforma || "N/A"}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className={`text-xs font-semibold ${getExpiryColor(days)}`}>
                {days <= 0 ? "Vencido" : days === 1 ? "1 día" : `${days} días`}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
