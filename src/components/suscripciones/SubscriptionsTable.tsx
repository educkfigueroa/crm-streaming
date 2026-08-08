"use client";

import { useState } from "react";
import { Trash2, Edit, RotateCw, Send, Key, Bell, AlertTriangle, Check, Mail, KeyRound, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MONEDA, getPlataformaByValue, getPlatformColorClasses, isIptv } from "@/lib/constants";
import {
  generateWelcomeMessage,
  generatePasswordUpdateMessage,
  generateRenewalMessage,
  generateExpiryMessage,
  getWhatsAppUrl,
} from "@/lib/whatsapp";
import { SubscriptionForm } from "./SubscriptionForm";
import {
  deleteSubscription,
  renewSubscription,
} from "@/lib/actions/subscriptions";
import type { SubscriptionWithDetails } from "@/types";

interface SubscriptionsTableProps {
  subscriptions: SubscriptionWithDetails[];
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

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionWithDetails | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const getWhatsAppPhone = (sub: SubscriptionWithDetails): string => {
    return (sub.clients as { whatsapp?: string })?.whatsapp || "";
  };

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
      <div className="rounded-xl overflow-hidden bg-card border border-border">
        <div className="overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium py-1 text-xs">Perfil</TableHead>
                <TableHead className="text-muted-foreground font-medium py-1 text-xs">Cliente</TableHead>
                <TableHead className="text-muted-foreground font-medium py-1 text-xs">Correo</TableHead>
                <TableHead className="text-muted-foreground font-medium py-1 text-xs">Contraseña</TableHead>
                <TableHead className="text-muted-foreground font-medium py-1 text-xs">Vence</TableHead>
                <TableHead className="text-muted-foreground font-medium py-1 text-xs">Precio</TableHead>
                <TableHead className="text-muted-foreground font-medium py-1 text-xs">Estado</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right py-1 text-xs">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => {
                const plataforma = sub.accounts
                  ? getPlataformaByValue(sub.accounts.plataforma)
                  : null;
                const days = getDaysUntilExpiry(sub.fecha_vencimiento);
                const phone = getWhatsAppPhone(sub);
                const { correo, contraseña } = getCredenciales(sub);
                const copyCorreoId = `sub-correo-${sub.id}`;
                const copyPassId = `sub-pass-${sub.id}`;

                return (
                  <TableRow
                    key={sub.id}
                    className="border-b border-border hover:bg-accent/30 transition-all duration-300"
                  >
                    <TableCell className="py-1">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-[10px] shrink-0`}
                        >
                          {plataforma?.label ||
                            sub.accounts?.plataforma ||
                            "N/A"}
                        </Badge>
                        <div>
                          <span className="font-medium text-foreground text-xs">
                            {sub.nombre_perfil}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-1">
                      <span className="text-foreground text-xs">
                        {(sub.clients as { nombre_completo?: string })
                          ?.nombre_completo ?? "Sin cliente"}
                      </span>
                    </TableCell>
                    <TableCell className="py-1">
                      {correo ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-foreground"
                          title={correo}
                          onClick={() => handleCopy(correo, copyCorreoId)}
                        >
                          {copiedId === copyCorreoId ? (
                            <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <Mail className="h-3 w-3" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-1">
                      {contraseña ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-foreground"
                          title="Copiar contraseña"
                          onClick={() => handleCopy(contraseña, copyPassId)}
                        >
                          {copiedId === copyPassId ? (
                            <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <KeyRound className="h-3 w-3" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-1">
                      <div>
                        <span
                          className={`text-xs font-medium ${
                            days <= 0
                              ? "text-red-500 dark:text-red-400"
                              : days <= 5
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-foreground"
                          }`}
                        >
                          {new Date(sub.fecha_vencimiento).toLocaleDateString(
                            "es-PE"
                          )}
                        </span>
                        <p
                          className={`text-[10px] ${
                            days <= 0
                              ? "text-red-500 dark:text-red-400"
                              : days <= 5
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {days <= 0 ? "Vencido" : `${days} días`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground font-medium text-xs py-1">
                      {sub.precio_cobrado
                        ? `${MONEDA} ${sub.precio_cobrado.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell className="py-1">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(sub.estadoCalculado || getCalculatedEstado(sub.fecha_vencimiento))} text-[10px]`}
                      >
                        {sub.estadoCalculado || getCalculatedEstado(sub.fecha_vencimiento)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-1">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-all duration-200"
                          title="Renovar suscripción"
                          onClick={() => handleRenew(sub.id)}
                        >
                          <RotateCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200"
                          title="Editar"
                          onClick={() => handleEdit(sub)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200"
                              />
                            }
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-44">
                            {phone && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openWhatsApp(getWhatsAppUrl(phone, generateWelcomeMessage(sub)))}
                                >
                                  <Send className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                                  Enviar credenciales
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openWhatsApp(getWhatsAppUrl(phone, generatePasswordUpdateMessage(sub)))}
                                >
                                  <Key className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                                  Actualizar contraseña
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openWhatsApp(getWhatsAppUrl(phone, generateRenewalMessage(sub)))}
                                >
                                  <Bell className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                  Recordar renovación
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openWhatsApp(getWhatsAppUrl(phone, generateExpiryMessage(sub)))}
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                                  Aviso vencimiento
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(sub.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <SubscriptionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        subscription={editingSubscription}
      />
    </>
  );
}
