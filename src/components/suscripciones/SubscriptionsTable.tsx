"use client";

import { useState } from "react";
import { Trash2, Edit, RotateCw, Send, Key, Bell, AlertTriangle } from "lucide-react";
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
import { CopyButton } from "@/components/shared/CopyButton";
import { MONEDA, getPlataformaByValue, getPlatformColorClasses } from "@/lib/constants";
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
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionWithDetails | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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

  const getWhatsAppPhone = (sub: SubscriptionWithDetails): string => {
    return (sub.clients as { whatsapp?: string })?.whatsapp || "";
  };

  const openWhatsApp = (phone: string, message: string) => {
    window.open(getWhatsAppUrl(phone, message), "_blank");
  };

  const handlePasswordUpdate = (sub: SubscriptionWithDetails, phone: string) => {
    const password = prompt("Ingresa la nueva contraseña:");
    if (password) {
      const msg = generatePasswordUpdateMessage(sub, password);
      openWhatsApp(phone, msg);
    }
  };

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center bg-card border border-border">
        <p className="text-muted-foreground">No hay suscripciones registradas.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Crea una nueva suscripción para asignar un perfil.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table layout (md+) */}
      <div className="hidden md:block rounded-2xl overflow-hidden bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Perfil</TableHead>
              <TableHead className="text-muted-foreground font-medium">Cliente</TableHead>
              <TableHead className="text-muted-foreground font-medium">Cuenta</TableHead>
              <TableHead className="text-muted-foreground font-medium">Vencimiento</TableHead>
              <TableHead className="text-muted-foreground font-medium">Precio</TableHead>
              <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => {
              const plataforma = sub.accounts
                ? getPlataformaByValue(sub.accounts.plataforma)
                : null;
              const days = getDaysUntilExpiry(sub.fecha_vencimiento);
              const phone = getWhatsAppPhone(sub);

              return (
                <TableRow
                  key={sub.id}
                  className="border-b border-border hover:bg-accent/30 transition-colors"
                >
                  <TableCell>
                    <div>
                      <span className="font-medium text-foreground">
                        {sub.nombre_perfil}
                      </span>
                      {sub.pin_perfil && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">PIN:</span>
                          <span className="text-xs text-muted-foreground">
                            {sub.pin_perfil}
                          </span>
                          <CopyButton
                            text={sub.pin_perfil}
                            className="h-4 w-4"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground">
                      {(sub.clients as { nombre_completo?: string })
                        ?.nombre_completo ?? "Sin cliente"}
                    </span>
                    {phone && (
                      <p className="text-xs text-muted-foreground mt-1">{phone}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge
                        variant="secondary"
                        className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-xs`}
                      >
                        {plataforma?.label ||
                          sub.accounts?.plataforma ||
                          "N/A"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                        {sub.accounts?.correo ||
                          sub.accounts?.usuario_xtream ||
                          ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span
                        className={`text-sm font-medium ${
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
                        className={`text-xs ${
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
                  <TableCell className="text-foreground font-medium">
                    {sub.precio_cobrado
                      ? `${MONEDA} ${sub.precio_cobrado.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(sub.estado)}
                    >
                      {sub.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {phone && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                            title="Enviar credenciales"
                            onClick={() =>
                              openWhatsApp(
                                phone,
                                generateWelcomeMessage(sub)
                              )
                            }
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
                            title="Actualizar contraseña"
                            onClick={() => handlePasswordUpdate(sub, phone)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                            title="Recordar renovación"
                            onClick={() =>
                              openWhatsApp(
                                phone,
                                generateRenewalMessage(sub)
                              )
                            }
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
                            title="Aviso vencimiento"
                            onClick={() =>
                              openWhatsApp(
                                phone,
                                generateExpiryMessage(sub)
                              )
                            }
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                        title="Renovar suscripción"
                        onClick={() => handleRenew(sub.id)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                        onClick={() => handleEdit(sub)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        onClick={() => handleDelete(sub.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card layout (below md) */}
      <div className="md:hidden space-y-3">
        {subscriptions.map((sub) => {
          const plataforma = sub.accounts
            ? getPlataformaByValue(sub.accounts.plataforma)
            : null;
          const days = getDaysUntilExpiry(sub.fecha_vencimiento);
          const phone = getWhatsAppPhone(sub);

          return (
            <div
              key={sub.id}
              className="rounded-2xl p-4 bg-card border border-border space-y-3"
            >
              {/* Profile name + status badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground truncate">
                  {sub.nombre_perfil}
                </span>
                <Badge
                  variant="outline"
                  className={`shrink-0 ${getStatusColor(sub.estado)}`}
                >
                  {sub.estado}
                </Badge>
              </div>

              {/* Client name + phone */}
              <div>
                <span className="text-sm text-foreground">
                  {(sub.clients as { nombre_completo?: string })
                    ?.nombre_completo ?? "Sin cliente"}
                </span>
                {phone && (
                  <p className="text-xs text-muted-foreground">{phone}</p>
                )}
              </div>

              {/* Platform badge + credentials */}
              <div className="flex flex-col gap-1">
                <Badge
                  variant="secondary"
                  className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-xs w-fit`}
                >
                  {plataforma?.label ||
                    sub.accounts?.plataforma ||
                    "N/A"}
                </Badge>
                {(sub.accounts?.correo || sub.accounts?.usuario_xtream) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {sub.accounts?.correo ||
                      sub.accounts?.usuario_xtream ||
                      ""}
                  </p>
                )}
              </div>

              {/* Expiry date + price */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span
                    className={`text-sm font-medium ${
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
                  <span
                    className={`ml-2 text-xs ${
                      days <= 0
                        ? "text-red-500 dark:text-red-400"
                        : days <= 5
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {days <= 0 ? "Vencido" : `${days} días`}
                  </span>
                </div>
                <span className="text-sm text-foreground font-medium">
                  {sub.precio_cobrado
                    ? `${MONEDA} ${sub.precio_cobrado.toFixed(2)}`
                    : "-"}
                </span>
              </div>

              {/* PIN */}
              {sub.pin_perfil && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">PIN:</span>
                  <span className="text-xs text-muted-foreground">
                    {sub.pin_perfil}
                  </span>
                  <CopyButton
                    text={sub.pin_perfil}
                    className="h-4 w-4"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-1 pt-1">
                {phone && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                      title="Enviar credenciales"
                      onClick={() =>
                        openWhatsApp(
                          phone,
                          generateWelcomeMessage(sub)
                        )
                      }
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
                      title="Actualizar contraseña"
                      onClick={() => handlePasswordUpdate(sub, phone)}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="Recordar renovación"
                      onClick={() =>
                        openWhatsApp(
                          phone,
                          generateRenewalMessage(sub)
                        )
                      }
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
                      title="Aviso vencimiento"
                      onClick={() =>
                        openWhatsApp(
                          phone,
                          generateExpiryMessage(sub)
                        )
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                  title="Renovar suscripción"
                  onClick={() => handleRenew(sub.id)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                  onClick={() => handleEdit(sub)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  onClick={() => handleDelete(sub.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <SubscriptionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        subscription={editingSubscription}
      />
    </>
  );
}
