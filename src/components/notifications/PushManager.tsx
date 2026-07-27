"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff } from "lucide-react";

export function PushManager() {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported) return null;

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading}
      title={isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
        loading
          ? "animate-pulse bg-muted text-muted-foreground"
          : isSubscribed
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
            : "bg-red-500/15 text-red-500 dark:text-red-400 hover:bg-red-500/25"
      }`}
    >
      {loading ? (
        <Bell className="h-4 w-4" />
      ) : isSubscribed ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
    </button>
  );
}
