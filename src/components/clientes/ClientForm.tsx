"use client";

import { useEffect, useActionState } from "react";
import { createClientAction, updateClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, MessageCircle, FileText } from "lucide-react";
import type { Client } from "@/types";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientForm({ open, onOpenChange, client }: ClientFormProps) {
  const isEditing = !!client;
  const [state, formAction, isPending] = useActionState(
    isEditing
      ? (prev: unknown, formData: FormData) => updateClient(client!.id, prev, formData)
      : createClientAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      window.location.reload();
    }
  }, [state?.success, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg bg-popover border border-border">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/15">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg font-semibold">
                {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {isEditing
                  ? "Modifica los datos del cliente"
                  : "Agrega un nuevo cliente al directorio"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
              {state.error}
            </div>
          )}

          <div className="rounded-xl p-5 space-y-4 bg-accent/30 border border-border">
            <div className="flex items-center gap-2 text-purple-400">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Información personal</span>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">Nombre Completo *</Label>
              <Input
                name="nombre_completo"
                defaultValue={client?.nombre_completo || ""}
                placeholder="Nombre del cliente"
                required
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">Alias</Label>
              <Input
                name="alias"
                defaultValue={client?.alias || ""}
                placeholder="Nombre para el perfil (ej: Juan)"
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
              />
              <p className="text-xs text-muted-foreground">Se usa automáticamente como nombre de perfil al crear suscripciones</p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">WhatsApp</Label>
              <Input
                name="whatsapp"
                type="tel"
                defaultValue={client?.whatsapp || ""}
                placeholder="+51 999 999 999"
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
              />
            </div>
          </div>

          <div className="rounded-xl p-5 space-y-3 bg-accent/30 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Notas adicionales</span>
            </div>
            <textarea
              name="notas"
              defaultValue={client?.notas || ""}
              placeholder="Notas adicionales sobre el cliente..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/15 focus:border-purple-500/20 resize-none"
            />
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground h-11 px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg h-11 px-6 transition-all duration-200"
            >
              {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
