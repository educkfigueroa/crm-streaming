"use client";

import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Smartphone } from "lucide-react";

const PUSH_ASKED_KEY = "crm_push_asked";

export function PushPermissionDialog() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
  const { isSupported, isSubscribed, loading, subscribe } =
    usePushNotifications();

  useEffect(() => {
    if (isSupported === null) return;

    if (isSubscribed) {
      setChecked(true);
      return;
    }

    if (!isSupported) {
      const alreadyAsked = localStorage.getItem(PUSH_ASKED_KEY);
      if (!alreadyAsked) {
        const timer = setTimeout(() => setOpen(true), 1500);
        setChecked(true);
        return () => clearTimeout(timer);
      }
      setChecked(true);
      return;
    }

    const alreadyAsked = localStorage.getItem(PUSH_ASKED_KEY);
    if (!alreadyAsked) {
      const timer = setTimeout(() => setOpen(true), 1500);
      setChecked(true);
      return () => clearTimeout(timer);
    }
    setChecked(true);
  }, [isSupported, isSubscribed]);

  const handleAccept = async () => {
    setError(false);
    const success = await subscribe();
    if (success) {
      localStorage.setItem(PUSH_ASKED_KEY, "true");
      setOpen(false);
    } else {
      setError(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PUSH_ASKED_KEY, "true");
    setOpen(false);
  };

  if (!checked) return null;

  const notSupported = isSupported === false;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            {notSupported ? (
              <Smartphone className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Bell className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <DialogTitle className="text-center">
            {notSupported
              ? "Notificaciones no disponibles"
              : "Activar Notificaciones"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {notSupported ? (
              <>
                Para recibir notificaciones push en <strong>iOS</strong>, agrega
                esta app a la pantalla de inicio. Toca{" "}
                <strong>Compartir → Agregar a pantalla de inicio</strong> en
                Safari, luego abrela desde ahí.
              </>
            ) : (
              <>
                Recibe alertas cuando una suscripción esté por vencer. Te
                avisamos <strong>2 días antes</strong> del vencimiento.
              </>
            )}
            {error && (
              <p className="mt-2 text-red-500 dark:text-red-400 text-xs">
                No se pudo activar. Verifica que no hayas bloqueado los permisos
                de notificación en ajustes del navegador.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {notSupported ? (
            <Button onClick={handleDismiss} className="bg-emerald-600 hover:bg-emerald-700">
              Entendido
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleDismiss}>
                <BellOff className="h-4 w-4 mr-2" />
                Ahora no
              </Button>
              <Button
                onClick={handleAccept}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                {loading ? "Activando..." : "Activar"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
