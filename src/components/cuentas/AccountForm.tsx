"use client";

import { useState, useEffect, useActionState } from "react";
import { createAccount, updateAccount } from "@/lib/actions/accounts";
import { PLATAFORMAS, isIptv, getMaxPerfiles } from "@/lib/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tv, CreditCard, Globe, Calendar } from "lucide-react";
import type { Account } from "@/types";

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
}

export function AccountForm({ open, onOpenChange, account }: AccountFormProps) {
  const isEditing = !!account;
  const [plataforma, setPlataforma] = useState(account?.plataforma || "");
  const [perfiles, setPerfiles] = useState(account?.total_perfiles || 0);
  const [state, formAction, isPending] = useActionState(
    isEditing
      ? (prev: unknown, formData: FormData) => updateAccount(account!.id, prev, formData)
      : createAccount,
    null
  );

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      window.location.reload();
    }
  }, [state?.success, onOpenChange]);

  const showIptvFields = isIptv(plataforma);
  const isOtro = plataforma === "otro";

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPlataforma("");
      setPerfiles(0);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover border border-border rounded-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 border border-border">
              <Tv className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg font-semibold">
                {isEditing ? "Editar Cuenta" : "Nueva Cuenta"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {isEditing
                  ? "Modifica los datos de la cuenta"
                  : "Agrega una nueva cuenta de streaming"}
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

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">Plataforma</Label>
            <Select
              value={plataforma}
              onValueChange={(value) => {
                const p = value ?? "";
                setPlataforma(p);
                const m = getMaxPerfiles(p);
                if (m) {
                  setPerfiles(m);
                } else if (p === "otro") {
                  setPerfiles(account?.total_perfiles || 1);
                }
              }}
              required
            >
              <SelectTrigger className="h-11 rounded-xl bg-background border border-border">
                <SelectValue placeholder="Seleccionar plataforma" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-popover border border-border">
                {PLATAFORMAS.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="rounded-lg text-muted-foreground">
                    {p.label} {p.maxPerfiles ? `(${p.maxPerfiles} perfiles)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="plataforma" value={plataforma} />
          </div>

          {showIptvFields ? (
            <div className="rounded-xl p-5 space-y-4 bg-accent/30 border border-border">
              <div className="flex items-center gap-2 text-purple-400">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">Xtream Code</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">Servidor</Label>
                  <Input
                    name="servidor_xtream"
                    defaultValue={account?.servidor_xtream || ""}
                    placeholder="Nombre del servidor"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">URL Server</Label>
                  <Input
                    name="url_server"
                    defaultValue={account?.url_server || ""}
                    placeholder="http://ejemplo.com:8080"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">Usuario Xtream</Label>
                  <Input
                    name="usuario_xtream"
                    defaultValue={account?.usuario_xtream || ""}
                    placeholder="Usuario"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">Contraseña</Label>
                  <Input
                    name="contraseña"
                    type="password"
                    defaultValue={account?.contraseña || ""}
                    placeholder="••••••••"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
                  />
                </div>
              </div>
              <input type="hidden" name="correo" value="" />
            </div>
          ) : (
            <div className="rounded-xl p-5 space-y-4 bg-accent/30 border border-border">
              <div className="flex items-center gap-2 text-blue-400">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Credenciales</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">Correo</Label>
                  <Input
                    name="correo"
                    type="email"
                    defaultValue={account?.correo || ""}
                    placeholder="correo@ejemplo.com"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500/30 focus:ring-blue-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">Contraseña</Label>
                  <Input
                    name="contraseña"
                    type="password"
                    defaultValue={account?.contraseña || ""}
                    placeholder="••••••••"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500/30 focus:ring-blue-500/10"
                  />
                </div>
              </div>
              <input type="hidden" name="servidor_xtream" value="" />
              <input type="hidden" name="url_server" value="" />
              <input type="hidden" name="usuario_xtream" value="" />
            </div>
          )}

          {isOtro ? (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">Perfiles</Label>
              <Input
                name="total_perfiles"
                type="number"
                min={1}
                value={perfiles}
                onChange={(e) => setPerfiles(parseInt(e.target.value) || 1)}
                className="h-11 rounded-xl bg-background border-border text-foreground focus:border-border"
              />
            </div>
          ) : plataforma ? (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">Perfiles</Label>
              <div className="h-11 rounded-xl border border-border bg-background px-4 flex items-center">
                <span className="text-foreground font-medium">{perfiles} perfiles</span>
              </div>
              <input type="hidden" name="total_perfiles" value={perfiles} />
            </div>
          ) : (
            <input type="hidden" name="total_perfiles" value="1" />
          )}

          <div className="rounded-xl p-5 space-y-4 bg-accent/30 border border-border">
            <div className="flex items-center gap-2 text-amber-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Costo y vencimiento</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Costo (S/)</Label>
                <Input
                  name="precio_costo"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={account?.precio_costo || ""}
                  placeholder="0.00"
                  className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/30 focus:ring-amber-500/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Vencimiento Proveedor</Label>
                <Input
                  name="fecha_vencimiento_proveedor"
                  type="date"
                  defaultValue={account?.fecha_vencimiento_proveedor || ""}
                  className="h-11 rounded-xl bg-background border-border text-foreground focus:border-amber-500/30 focus:ring-amber-500/10"
                />
              </div>
            </div>
          </div>

          <input type="hidden" name="proveedor" value="" />

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
              disabled={isPending || !plataforma}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md shadow-primary/10 h-11 px-6 transition-all duration-200"
            >
              {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
