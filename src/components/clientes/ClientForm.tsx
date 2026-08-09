"use client";

import { useEffect, useActionState, useState } from "react";
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
import { User, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Client } from "@/types";

const COUNTRIES = [
  { code: "+51", flag: "🇵🇪", label: "Perú" },
  { code: "+52", flag: "🇲🇽", label: "México" },
  { code: "+54", flag: "🇦🇷", label: "Argentina" },
  { code: "+56", flag: "🇨🇱", label: "Chile" },
  { code: "+57", flag: "🇨🇴", label: "Colombia" },
  { code: "+53", flag: "🇨🇺", label: "Cuba" },
  { code: "+58", flag: "🇻🇪", label: "Venezuela" },
  { code: "+593", flag: "🇪🇨", label: "Ecuador" },
  { code: "+591", flag: "🇧🇴", label: "Bolivia" },
  { code: "+595", flag: "🇵🇾", label: "Paraguay" },
  { code: "+598", flag: "🇺🇾", label: "Uruguay" },
  { code: "+1", flag: "🇺🇸", label: "USA" },
  { code: "+34", flag: "🇪🇸", label: "España" },
  { code: "+55", flag: "🇧🇷", label: "Brasil" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+33", flag: "🇫🇷", label: "Francia" },
  { code: "+49", flag: "🇩🇪", label: "Alemania" },
  { code: "+39", flag: "🇮🇹", label: "Italia" },
  { code: "+81", flag: "🇯🇵", label: "Japón" },
  { code: "+86", flag: "🇨🇳", label: "China" },
  { code: "+82", flag: "🇰🇷", label: "Corea" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
] as const;

function parseExistingPhone(phone: string): { countryCode: string; local: string } {
  const cleaned = phone.replace(/\D/g, "");
  for (const c of COUNTRIES) {
    const digits = c.code.replace(/\D/g, "");
    if (cleaned.startsWith(digits)) {
      return { countryCode: c.code, local: cleaned.slice(digits.length) };
    }
  }
  return { countryCode: "+51", local: cleaned };
}

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientForm({ open, onOpenChange, client }: ClientFormProps) {
  const isEditing = !!client;

  const existing = client?.whatsapp ? parseExistingPhone(client.whatsapp) : null;
  const [countryCode, setCountryCode] = useState(existing?.countryCode || "+51");
  const [localNumber, setLocalNumber] = useState(existing?.local || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const ex = client?.whatsapp ? parseExistingPhone(client.whatsapp) : null;
      setCountryCode(ex?.countryCode || "+51");
      setLocalNumber(ex?.local || "");
    }
  }

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  const fullPhone = countryCode + localNumber;

  const [state, formAction, isPending] = useActionState(
    isEditing
      ? (prev: unknown, formData: FormData) => {
          formData.set("whatsapp", fullPhone);
          return updateClient(client!.id, prev, formData);
        }
      : (prev: unknown, formData: FormData) => {
          formData.set("whatsapp", fullPhone);
          return createClientAction(prev, formData);
        },
    null
  );

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
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
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={cn(
                      "flex items-center gap-1.5 h-11 px-3 rounded-xl bg-background border border-border text-sm font-medium text-foreground transition-colors hover:bg-accent/50 min-w-[100px]",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/15 focus:border-purple-500/20"
                    )}
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="text-xs text-muted-foreground">{selectedCountry.code}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute z-50 mt-1 w-56 max-h-60 overflow-y-auto rounded-xl bg-popover border border-border shadow-xl py-1">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code);
                              setDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                              countryCode === c.code && "bg-accent text-foreground"
                            )}
                          >
                            <span>{c.flag}</span>
                            <span className="text-foreground">{c.label}</span>
                            <span className="text-muted-foreground text-xs ml-auto">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <Input
                  name="whatsapp_local"
                  type="tel"
                  value={localNumber}
                  onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="999 999 999"
                  className="flex-1 h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10 font-mono"
                />
              </div>
              <input type="hidden" name="whatsapp" value={fullPhone} />
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
