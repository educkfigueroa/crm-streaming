"use client";

import { useState } from "react";
import { Trash2, Edit, RotateCw, Send, Key, Bell, AlertTriangle, Check, Copy, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MONEDA, getPlataformaByValue, getPlatformColorClasses, isIptv } from "@/lib/constants";
import {
  generateWelcomeMessage,
  generatePasswordUpdateMessage,
  generateRenewalMessage,
  generateExpiryMessage,
  getWhatsAppUrl,
} from "@/lib/whatsapp";
import { SubscriptionForm } from "./SubscriptionForm";
import { FilterBar } from "./FilterBar";
import {
  deleteSubscription,
  renewSubscription,
} from "@/lib/actions/subscriptions";
import type { SubscriptionWithDetails } from "@/types";

interface SubscriptionsTableProps {
  subscriptions: SubscriptionWithDetails[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterEstado: string;
  onEstadoChange: (v: string) => void;
}

function getStatusColor(estado: string) {
  switch (estado) {
    case "Activo":
      return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20";
    case "Por Vencer":
      return "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20";
    case "Vencido":
      return "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20";
    case "Suspendido":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getDaysUntilExpiry(fechaVencimiento: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(fechaVencimiento);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getCalculatedEstado(fechaVencimiento: string): string {
  const days = getDaysUntilExpiry(fechaVencimiento);
  if (days <= 0) return "Vencido";
  if (days <= 7) return "Por Vencer";
  return "Activo";
}

function getCredenciales(sub: SubscriptionWithDetails): { correo: string; contraseña: string } {
  const account = sub.accounts;
  if (!account) return { correo: "", contraseña: "" };
  if (isIptv(account.plataforma)) {
    return {
      correo: sub.nombre_perfil || account.usuario_xtream || "",
      contraseña: sub.pin_perfil || account.contraseña || "",
    };
  }
  return { correo: account.correo || "", contraseña: account.contraseña || "" };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-PE");
}

function getClientName(sub: SubscriptionWithDetails): string {
  return (sub.clients as { nombre_completo?: string })?.nombre_completo ?? "Sin cliente";
}

function getWhatsAppPhone(sub: SubscriptionWithDetails): string {
  return (sub.clients as { whatsapp?: string })?.whatsapp || "";
}

/* ---------- Detalles (panel desktop y sheet mobile) ---------- */

interface DetailsPanelProps {
  sub: SubscriptionWithDetails;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onRenew: (id: string) => void;
  onEdit: (sub: SubscriptionWithDetails) => void;
  onDelete: (id: string) => void;
  onWhatsApp: (url: string) => void;
  onClose: () => void;
}

function FieldRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
        <p className="text-xs font-mono text-foreground truncate">{value}</p>
      </div>
      {onCopy && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-xs font-semibold", highlight ? "text-amber-500 dark:text-amber-400" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function DetailsPanel({
  sub,
  copiedId,
  onCopy,
  onRenew,
  onEdit,
  onDelete,
  onWhatsApp,
  onClose,
}: DetailsPanelProps) {
  const plataforma = sub.accounts ? getPlataformaByValue(sub.accounts.plataforma) : null;
  const colorKey = plataforma?.color ?? "slate";
  const { correo, contraseña } = getCredenciales(sub);
  const phone = getWhatsAppPhone(sub);
  const clientName = getClientName(sub);
  const initials = (plataforma?.label ?? "N/A").split(" ")[0].slice(0, 3).toUpperCase();
  const days = getDaysUntilExpiry(sub.fecha_vencimiento);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Detalles de la suscripción</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3.5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", getPlatformColorClasses(colorKey).badge)}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{sub.nombre_perfil}</p>
          <p className="truncate text-xs text-muted-foreground">
            {plataforma?.label ?? sub.accounts?.plataforma ?? "N/A"} · {clientName}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <FieldRow
          label="Correo"
          value={correo || "-"}
          onCopy={correo ? () => onCopy(correo, `d-correo-${sub.id}`) : undefined}
          copied={copiedId === `d-correo-${sub.id}`}
        />
        <FieldRow
          label="Contraseña"
          value={contraseña ? "••••••••••" : "-"}
          onCopy={contraseña ? () => onCopy(contraseña, `d-pass-${sub.id}`) : undefined}
          copied={copiedId === `d-pass-${sub.id}`}
        />
        {sub.pin_perfil && (
          <FieldRow
            label="Pin"
            value={sub.pin_perfil}
            onCopy={() => onCopy(sub.pin_perfil!, `d-pin-${sub.id}`)}
            copied={copiedId === `d-pin-${sub.id}`}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          label="Precio cobrado"
          value={sub.precio_cobrado ? `${MONEDA} ${sub.precio_cobrado.toFixed(2)}` : "-"}
        />
        <MiniStat label="Inicio" value={sub.fecha_inicio ? formatDate(sub.fecha_inicio) : "-"} />
        <MiniStat label="Vence" value={formatDate(sub.fecha_vencimiento)} highlight={days <= 5} />
      </div>

      {phone && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Acciones de WhatsApp
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onWhatsApp(getWhatsAppUrl(phone, generateWelcomeMessage(sub)))}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-accent transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              Enviar credenciales
            </button>
            <button
              type="button"
              onClick={() => onWhatsApp(getWhatsAppUrl(phone, generatePasswordUpdateMessage(sub)))}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-accent transition-colors"
            >
              <Key className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              Actualizar contraseña
            </button>
            <button
              type="button"
              onClick={() => onWhatsApp(getWhatsAppUrl(phone, generateRenewalMessage(sub)))}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-accent transition-colors"
            >
              <Bell className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              Recordar renovación
            </button>
            <button
              type="button"
              onClick={() => onWhatsApp(getWhatsAppUrl(phone, generateExpiryMessage(sub)))}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-accent transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
              Aviso de vencimiento
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button className="flex-1 h-9" onClick={() => onRenew(sub.id)}>
          <RotateCw className="h-3.5 w-3.5 mr-1.5" />
          Renovar
        </Button>
        <Button variant="outline" className="flex-1 h-9" onClick={() => onEdit(sub)}>
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-red-500 hover:text-red-500 hover:bg-red-500/10"
          onClick={() => onDelete(sub.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Sugerencia: el estado se marca &quot;Por Vencer&quot; cuando quedan 7 días o menos.
      </p>
    </div>
  );
}

/* ---------- Tabla principal ---------- */

export function SubscriptionsTable({
  subscriptions,
  searchQuery,
  onSearchChange,
  filterEstado,
  onEstadoChange,
}: SubscriptionsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelHidden, setPanelHidden] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionWithDetails | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeId =
    selectedId && subscriptions.some((s) => s.id === selectedId)
      ? selectedId
      : (subscriptions[0]?.id ?? null);
  const activeSub = subscriptions.find((s) => s.id === activeId) ?? null;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta suscripción?")) {
      await deleteSubscription(id);
      window.location.reload();
    }
  };

  const handleRenew = async (id: string) => {
    if (
      confirm(
        "¿Renovar esta suscripción? Se establecerá una nueva fecha de vencimiento (hoy + 1 mes)."
      )
    ) {
      await renewSubscription(id);
      window.location.reload();
    }
  };

  const handleEdit = (subscription: SubscriptionWithDetails) => {
    setEditingSubscription(subscription);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setEditingSubscription(null);
    setFormOpen(false);
    window.location.reload();
  };

  const openWhatsApp = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openDetails = (sub: SubscriptionWithDetails, mobile: boolean) => {
    setSelectedId(sub.id);
    if (mobile) {
      setMobileOpen(true);
    } else {
      setPanelHidden(false);
    }
  };

  const detailProps = activeSub
    ? {
        sub: activeSub,
        copiedId,
        onCopy: handleCopy,
        onRenew: handleRenew,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onWhatsApp: openWhatsApp,
        onClose: () => setMobileOpen(false),
      }
    : null;

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl p-10 text-center bg-card border border-border">
        <p className="text-muted-foreground">No hay suscripciones registradas.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Crea una nueva suscripción para asignar un perfil.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start">
        <div className="w-full lg:flex-1 lg:min-w-0 transition-all duration-300 ease-in-out">
          <div className="space-y-4">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              filterEstado={filterEstado}
              onEstadoChange={onEstadoChange}
            />

            {/* Desktop table */}
          <div className="hidden lg:block rounded-xl overflow-hidden bg-card border border-border">
            <div className="overflow-x-auto">
              <Table className="min-w-[680px]">
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium py-1 text-xs">Perfil</TableHead>
                    <TableHead className="text-muted-foreground font-medium py-1 text-xs">Cliente</TableHead>
                    <TableHead className="text-muted-foreground font-medium py-1 text-xs">Vence</TableHead>
                    <TableHead className="text-muted-foreground font-medium py-1 text-xs">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => {
                    const plataforma = sub.accounts
                      ? getPlataformaByValue(sub.accounts.plataforma)
                      : null;
                    const days = getDaysUntilExpiry(sub.fecha_vencimiento);
                    const isActive = activeSub?.id === sub.id;

                    return (
                      <TableRow
                        key={sub.id}
                        onClick={() => openDetails(sub, false)}
                        className={cn(
                          "border-b border-border transition-all duration-200 cursor-pointer",
                          isActive
                            ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                            : "hover:bg-accent/30"
                        )}
                      >
                        <TableCell className="py-1">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="secondary"
                              className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-[10px] shrink-0`}
                            >
                              {plataforma?.label || sub.accounts?.plataforma || "N/A"}
                            </Badge>
                            <span className="font-medium text-foreground text-xs">
                              {sub.nombre_perfil}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1">
                          <span className="text-foreground text-xs">{getClientName(sub)}</span>
                        </TableCell>
                        <TableCell className="py-1">
                          <div>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                days <= 0
                                  ? "text-red-500 dark:text-red-400"
                                  : days <= 5
                                    ? "text-amber-500 dark:text-amber-400"
                                    : "text-foreground"
                              )}
                            >
                              {formatDate(sub.fecha_vencimiento)}
                            </span>
                            <p
                              className={cn(
                                "text-[10px]",
                                days <= 0
                                  ? "text-red-500 dark:text-red-400"
                                  : days <= 5
                                    ? "text-amber-500 dark:text-amber-400"
                                    : "text-muted-foreground"
                              )}
                            >
                              {days <= 0 ? "Vencido" : `${days} días`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-1">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(sub.estadoCalculado || getCalculatedEstado(sub.fecha_vencimiento))} text-[10px]`}
                          >
                            {sub.estadoCalculado || getCalculatedEstado(sub.fecha_vencimiento)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-2">
            {subscriptions.map((sub) => {
              const plataforma = sub.accounts
                ? getPlataformaByValue(sub.accounts.plataforma)
                : null;
              const colorKey = plataforma?.color ?? "slate";
              const days = getDaysUntilExpiry(sub.fecha_vencimiento);

              return (
                <div
                  key={sub.id}
                  onClick={() => openDetails(sub, true)}
                  className="rounded-xl p-3 bg-card border border-border/50 active:scale-[0.99] transition-all duration-150 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className={`${getPlatformColorClasses(colorKey).badge} font-medium text-[10px] shrink-0`}
                    >
                      {plataforma?.label || sub.accounts?.plataforma || "N/A"}
                    </Badge>
                    <span className="font-medium text-foreground text-xs truncate">
                      {sub.nombre_perfil}
                    </span>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="text-[11px] text-muted-foreground truncate">
                      {getClientName(sub)}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground shrink-0">
                      {sub.precio_cobrado ? `${MONEDA} ${sub.precio_cobrado.toFixed(2)}` : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        days <= 0
                          ? "text-red-500 dark:text-red-400"
                          : days <= 5
                            ? "text-amber-500 dark:text-amber-400"
                            : "text-foreground"
                      )}
                    >
                      {formatDate(sub.fecha_vencimiento)}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {days <= 0 ? "· Vencido" : `· ${days} días`}
                      </span>
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(sub.estadoCalculado || getCalculatedEstado(sub.fecha_vencimiento))} text-[10px] shrink-0`}
                    >
                      {sub.estadoCalculado || getCalculatedEstado(sub.fecha_vencimiento)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        {/* Desktop slide-in drawer (right to left, content adjusts, follows scroll) */}
        <aside
          className={cn(
            "hidden lg:block lg:self-stretch shrink-0 overflow-x-clip transition-all duration-300 ease-in-out border-l border-border/50",
            panelHidden ? "lg:w-0 border-l-0" : "lg:w-[340px] lg:ml-6"
          )}
        >
          <div className="w-[340px] lg:h-full">
            {activeSub && !panelHidden && detailProps && (
              <div className="rounded-2xl border border-border/50 bg-card p-5 lg:sticky lg:top-16 max-h-[calc(100vh-5rem)] overflow-y-auto">
                <DetailsPanel {...detailProps} onClose={() => setPanelHidden(true)} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[85vh] overflow-y-auto p-4 pb-6 sm:p-5">
          <SheetTitle className="sr-only">Detalles de la suscripción</SheetTitle>
          {activeSub && detailProps && (
            <DetailsPanel {...detailProps} onClose={() => setMobileOpen(false)} />
          )}
        </SheetContent>
      </Sheet>

      <SubscriptionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        subscription={editingSubscription}
      />
    </>
  );
}
