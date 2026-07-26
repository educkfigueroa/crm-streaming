"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

export function PushManager() {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported) return null;

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading}
      className={isSubscribed ? "bg-emerald-600 hover:bg-emerald-700" : ""}
    >
      {loading ? (
        <span className="animate-pulse">...</span>
      ) : isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Notificaciones ON
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Activar Notificaciones
        </>
      )}
    </Button>
  );
}
