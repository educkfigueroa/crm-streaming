"use client";

import { useState } from "react";
import { Trash2, Edit, RotateCw, Send, Key, Bell, AlertTriangle, Copy, Check, Mail, KeyRound } from "lucide-react";
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

function getCredenciales(sub: SubscriptionWithDetails): { correo: string; contraseña: string } {
  const account = sub.accounts;
  if (!account) return { correo: "", contraseña: "" };
  const correo = isIptv(account.plataforma) ? account.usuario_xtream || "" : account.correo || "";
  const contraseña = account.contraseña || "";
  return { correo, contraseña };
}

function truncarCorreo(correo: string) {
  if (!correo) return "";
  return correo.length > 5 ? correo.slice(0, 5) + "..." : correo;
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionWithDetails | null>(null);
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
    if (confirm("¿Renovar esta suscripción? Se establecerá una nueva fecha de vencimiento (hoy + 1 mes).")) {
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
      <div className="rounded-xl p-8 text-center bg-card border border-border">
        <p className="text-muted-foreground text-sm">No hay suscripciones registradas.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl overflow-hidden bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Perfil</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Cliente</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Correo</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Contraseña</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Vence</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Precio</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Estado</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right py-1 text-[11px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => {
              const plataforma = sub.accounts ? getPlataformaByValue(sub.accounts.plataforma) : null;
              const days = getDaysUntilExpiry(sub.fecha_vencimiento);
              const phone = getWhatsAppPhone(sub);
              const { correo, contraseña } = getCredenciales(sub);
              const copyCorreoId = `sub-correo-${sub.id}`;
              const copyPassId = `sub-pass-${sub.id}`;

              return (
                <TableRow key={sub.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-[9px] shrink-0`}>
                        {plataforma?.label || sub.accounts?.plataforma || "N/A"}
                      </Badge>
                      <div>
                        <span className="font-medium text-foreground text-[10px]">{sub.nombre_perfil}</span>
                        {sub.pin_perfil && (
                          <div className="flex items-center gap-0.5">
                            <span className="text-[8px] text-muted-foreground">PIN: {sub.pin_perfil}</span>
                            <CopyButton text={sub.pin_perfil} className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <span className="text-foreground text-[10px]">{(sub.clients as { nombre_completo?: string })?.nombre_completo ?? "-"}</span>
                    {phone && <p className="text-[8px] text-muted-foreground">{phone}</p>}
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-[10px] font-mono" title={correo || undefined}>
                        {correo ? truncarCorreo(correo) : "-"}
                      </span>
                      {correo && (
                        <Button variant="ghost" size="icon" className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(correo, copyCorreoId)}>
                          {copiedId === copyCorreoId ? <Check className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-[10px] font-mono">
                        {contraseña ? "•••••" : "-"}
                      </span>
                      {contraseña && (
                        <Button variant="ghost" size="icon" className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(contraseña, copyPassId)}>
                          {copiedId === copyPassId ? <Check className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <span className={`font-medium text-[10px] ${days <= 0 ? "text-red-500 dark:text-red-400" : days <= 5 ? "text-amber-500 dark:text-amber-400" : "text-foreground"}`}>
                      {new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE")}
                    </span>
                    <p className={`text-[8px] ${days <= 0 ? "text-red-500 dark:text-red-400" : days <= 5 ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}`}>
                      {days <= 0 ? "Vencido" : `${days}d`}
                    </p>
                  </TableCell>
                  <TableCell className="text-foreground font-medium text-[10px] py-1">
                    {sub.precio_cobrado ? `${MONEDA} ${sub.precio_cobrado.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge variant="outline" className={`${getStatusColor(sub.estado)} text-[9px]`}>{sub.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right py-1">
                    <div className="flex items-center justify-end gap-0.5">
                      {phone && (
                        <>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md" title="Enviar credenciales" onClick={() => openWhatsApp(phone, generateWelcomeMessage(sub))}>
                            <Send className="h-2.5 w-2.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-md" title="Actualizar contraseña" onClick={() => handlePasswordUpdate(sub, phone)}>
                            <Key className="h-2.5 w-2.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md" title="Recordar renovación" onClick={() => openWhatsApp(phone, generateRenewalMessage(sub))}>
                            <Bell className="h-2.5 w-2.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10 rounded-md" title="Aviso vencimiento" onClick={() => openWhatsApp(phone, generateExpiryMessage(sub))}>
                            <AlertTriangle className="h-2.5 w-2.5" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md" title="Renovar" onClick={() => handleRenew(sub.id)}>
                        <RotateCw className="h-2.5 w-2.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md" onClick={() => handleEdit(sub)}>
                        <Edit className="h-2.5 w-2.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md" onClick={() => handleDelete(sub.id)}>
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-1">
        {subscriptions.map((sub) => {
          const plataforma = sub.accounts ? getPlataformaByValue(sub.accounts.plataforma) : null;
          const days = getDaysUntilExpiry(sub.fecha_vencimiento);
          const phone = getWhatsAppPhone(sub);
          const { correo, contraseña } = getCredenciales(sub);
          const copyCorreoId = `sub-correo-m-${sub.id}`;
          const copyPassId = `sub-pass-m-${sub.id}`;

          return (
            <div key={sub.id} className="rounded-lg p-2 bg-card border border-border space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Badge variant="secondary" className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-[9px] shrink-0`}>
                    {plataforma?.label || sub.accounts?.plataforma || "N/A"}
                  </Badge>
                  <span className="font-medium text-foreground text-[10px] truncate">{sub.nombre_perfil}</span>
                </div>
                <Badge variant="outline" className={`shrink-0 text-[9px] ${getStatusColor(sub.estado)}`}>{sub.estado}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-foreground truncate">{(sub.clients as { nombre_completo?: string })?.nombre_completo ?? "-"}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[9px] font-medium ${days <= 0 ? "text-red-500 dark:text-red-400" : days <= 5 ? "text-amber-500 dark:text-amber-400" : "text-foreground"}`}>
                    {new Date(sub.fecha_vencimiento).toLocaleDateString("es-PE")}
                  </span>
                  <span className="text-[9px] text-foreground">{sub.precio_cobrado ? `${MONEDA} ${sub.precio_cobrado.toFixed(2)}` : ""}</span>
                </div>
              </div>

              {correo && (
                <div className="flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground text-[9px] font-mono truncate" title={correo}>{truncarCorreo(correo)}</span>
                  <Button variant="ghost" size="icon" className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleCopy(correo, copyCorreoId)}>
                    {copiedId === copyCorreoId ? <Check className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                  </Button>
                </div>
              )}

              {contraseña && (
                <div className="flex items-center gap-1">
                  <KeyRound className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground text-[9px] font-mono">•••••</span>
                  <Button variant="ghost" size="icon" className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleCopy(contraseña, copyPassId)}>
                    {copiedId === copyPassId ? <Check className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                  </Button>
                </div>
              )}

              {sub.pin_perfil && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[8px] text-muted-foreground">PIN: {sub.pin_perfil}</span>
                  <CopyButton text={sub.pin_perfil} className="h-2.5 w-2.5" />
                </div>
              )}

              <div className="flex items-center justify-end gap-0.5">
                {phone && (
                  <>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md" onClick={() => openWhatsApp(phone, generateWelcomeMessage(sub))}>
                      <Send className="h-2.5 w-2.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-md" onClick={() => handlePasswordUpdate(sub, phone)}>
                      <Key className="h-2.5 w-2.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md" onClick={() => openWhatsApp(phone, generateRenewalMessage(sub))}>
                      <Bell className="h-2.5 w-2.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-500/10 rounded-md" onClick={() => openWhatsApp(phone, generateExpiryMessage(sub))}>
                      <AlertTriangle className="h-2.5 w-2.5" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md" onClick={() => handleRenew(sub.id)}>
                  <RotateCw className="h-2.5 w-2.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md" onClick={() => handleEdit(sub)}>
                  <Edit className="h-2.5 w-2.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md" onClick={() => handleDelete(sub.id)}>
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <SubscriptionForm open={formOpen} onOpenChange={handleFormClose} subscription={editingSubscription} />
    </>
  );
}
