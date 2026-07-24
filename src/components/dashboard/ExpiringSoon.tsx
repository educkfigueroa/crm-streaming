import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
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
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getExpiryColor(days: number): string {
  if (days <= 0) return "text-red-500 dark:text-red-400";
  if (days <= 2) return "text-red-500 dark:text-red-400";
  if (days <= 5) return "text-amber-500 dark:text-amber-400";
  return "text-emerald-500 dark:text-emerald-400";
}

function getExpiryBg(days: number): string {
  if (days <= 0) return "bg-red-500/5 border-red-500/10";
  if (days <= 2) return "bg-red-500/5 border-red-500/10";
  if (days <= 5) return "bg-amber-500/5 border-amber-500/10";
  return "bg-emerald-500/5 border-emerald-500/10";
}

function getExpiryDot(days: number): string {
  if (days <= 0) return "bg-red-500 dark:bg-red-400";
  if (days <= 2) return "bg-red-500 dark:bg-red-400";
  if (days <= 5) return "bg-amber-500 dark:bg-amber-400";
  return "bg-emerald-500 dark:bg-emerald-400";
}

export function ExpiringSoon({ subscriptions }: ExpiringSoonProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Suscripciones Próximas a Vencer
          </h3>
        </div>
        <p className="text-muted-foreground">No hay suscripciones por vencer.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-card border border-border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Suscripciones Próximas a Vencer
          </h3>
        </div>
        <Link
          href="/suscripciones"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todas →
        </Link>
      </div>
      <div className="space-y-3">
        {subscriptions.map((sub) => {
          const days = getDaysUntilExpiry(sub.fecha_vencimiento);
          const colorClass = getExpiryColor(days);
          const bgClass = getExpiryBg(days);
          const dotClass = getExpiryDot(days);
          const plataforma = sub.accounts
            ? getPlataformaByValue(sub.accounts.plataforma)
            : null;
          const clienteId = (sub.clients as { id?: string })?.id;

          return (
            <Link
              key={sub.id}
              href={clienteId ? `/suscripciones?cliente=${clienteId}` : "/suscripciones"}
              className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${bgClass} cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${dotClass}`} />
                <div>
                  <p className="font-medium text-foreground">
                    {sub.nombre_perfil}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(sub.clients as { nombre_completo?: string })?.nombre_completo ?? "Sin cliente"} — <span className={`inline-flex items-center gap-1`}><span className={`h-1.5 w-1.5 rounded-full ${getPlatformColorClasses(plataforma?.color ?? "slate").dot}`} />{plataforma?.label || sub.accounts?.plataforma || "Sin plataforma"}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${colorClass}`}>
                  {days <= 0 ? "Vencido" : `${days} días`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
