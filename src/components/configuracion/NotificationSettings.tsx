"use client";

import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Smartphone, TriangleAlert } from "lucide-react";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (checked: boolean) => {
    setError(null);
    if (checked) {
      const ok = await subscribe();
      if (!ok) {
        setError(
          permission === "denied"
            ? "Permiso denegado en el navegador. Habilítalo en los ajustes del sitio."
            : "No se pudo activar. Revisa los permisos de notificación."
        );
      }
    } else {
      await unsubscribe();
    }
  };

  const loadingState = isSupported === null || loading;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            {isSubscribed ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Notificaciones push
            </p>
            <p className="text-xs text-muted-foreground">
              {isSupported === false
                ? "No disponibles en este navegador"
                : isSubscribed
                  ? "Activadas: te avisaremos cuando una suscripción esté por vencer."
                  : "Recibe alertas 2 días antes de cada vencimiento."}
            </p>
          </div>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleChange}
          disabled={isSupported === false || loading}
          aria-label="Activar notificaciones push"
          className={loadingState ? "opacity-50" : ""}
        />
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {isSupported === false && (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          En iOS, agrega esta app a la pantalla de inicio (Compartir → Agregar a
          pantalla de inicio) y ábrela desde ahí para recibir notificaciones.
        </p>
      )}

      {isSupported !== false && permission === "denied" && !isSubscribed && (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          El permiso está bloqueado en tu navegador. Habilítalo desde los
          ajustes del sitio para recibir avisos.
        </p>
      )}
    </div>
  );
}
