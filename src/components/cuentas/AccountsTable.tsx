"use client";

import { useState } from "react";
import { Trash2, Edit, Copy, Check, ExternalLink, Mail, KeyRound } from "lucide-react";
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
import { getPlataformaByValue, getPlatformColorClasses, MONEDA, isIptv, getPlataformaUrl } from "@/lib/constants";
import { AccountForm } from "./AccountForm";
import { deleteAccount } from "@/lib/actions/accounts";
import type { Account, Subscription } from "@/types";

interface AccountsTableProps {
  accounts: Account[];
  subscriptions: Subscription[];
}

function getProfileStatus(sub: Subscription): "active" | "expiring" | "expired" | "suspended" {
  if (sub.estado === "Suspendido") return "suspended";
  if (sub.estado === "Vencido") return "expired";
  if (sub.estado === "Por Vencer") return "expiring";
  if (sub.estado === "Activo") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vencimiento = new Date(sub.fecha_vencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((vencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "expired";
    if (diffDays <= 7) return "expiring";
    return "active";
  }
  return "active";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "bg-emerald-500 dark:bg-emerald-400";
    case "expiring": return "bg-amber-500 dark:bg-amber-400";
    case "expired": return "bg-red-500 dark:bg-red-400";
    case "suspended": return "bg-muted-foreground/50";
    default: return "bg-muted-foreground/30";
  }
}

function getStatusTooltip(sub: Subscription, status: string): string {
  const base = status === "active" ? "Activo" : status === "expiring" ? "Por vencer" : status === "expired" ? "Vencido" : "Suspendido";
  return `${sub.nombre_perfil} — ${base}`;
}

export function AccountsTable({ accounts, subscriptions }: AccountsTableProps) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta cuenta?")) {
      await deleteAccount(id);
      window.location.reload();
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setEditingAccount(null);
    setFormOpen(false);
    window.location.reload();
  };

  const getCorreo = (account: Account) => {
    if (isIptv(account.plataforma)) return account.usuario_xtream || "";
    return account.correo || "";
  };

  const truncarCorreo = (correo: string) => {
    if (!correo) return "";
    return correo.length > 5 ? correo.slice(0, 5) + "..." : correo;
  };

  const mascararContrasena = (pass: string) => {
    if (!pass) return "";
    return "•••••";
  };

  const getVencimientoColor = (fecha: string | null) => {
    if (!fecha) return "text-muted-foreground";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fecha);
    vencimiento.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((vencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "text-red-500 dark:text-red-400";
    if (diffDays <= 5) return "text-amber-500 dark:text-amber-400";
    return "text-emerald-500 dark:text-emerald-400";
  };

  const getAccountProfiles = (accountId: string, totalPerfiles: number) => {
    const accountSubs = subscriptions
      .filter((s) => s.cuenta_id === accountId)
      .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());

    const profiles: Array<{ status: string; tooltip: string }> = [];
    for (let i = 0; i < totalPerfiles; i++) {
      if (i < accountSubs.length) {
        const sub = accountSubs[i];
        const status = getProfileStatus(sub);
        profiles.push({ status, tooltip: `${sub.nombre_perfil} — ${getStatusTooltip(sub, status)}` });
      } else {
        profiles.push({ status: "free", tooltip: "Libre" });
      }
    }
    return profiles;
  };

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl p-10 text-center bg-card border border-border">
        <p className="text-muted-foreground">No hay cuentas registradas.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Crea una nueva cuenta para comenzar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl overflow-hidden bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium py-1.5 text-xs">Plataforma</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1.5 text-xs">Correo</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1.5 text-xs">Contraseña</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1.5 text-xs">Perfiles</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1.5 text-xs">Costo</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1.5 text-xs">Vence</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right py-1.5 text-xs">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const plataforma = getPlataformaByValue(account.plataforma);
              const correo = getCorreo(account);
              const contrasena = account.contraseña || "";
              const plataformaUrl = getPlataformaUrl(account.plataforma);
              const copyCorreoId = `copy-correo-${account.id}`;
              const copyPassId = `copy-pass-${account.id}`;
              const profiles = getAccountProfiles(account.id, account.total_perfiles);

              return (
                <TableRow key={account.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <TableCell className="py-1.5">
                    <Badge variant="secondary" className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-xs`}>
                      {plataforma?.label || account.plataforma}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-xs font-mono" title={correo || undefined}>
                        {correo ? truncarCorreo(correo) : "-"}
                      </span>
                      {correo && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(correo, copyCorreoId)}>
                          {copiedId === copyCorreoId ? <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-xs font-mono">
                        {contrasena ? mascararContrasena(contrasena) : "-"}
                      </span>
                      {contrasena && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(contrasena, copyPassId)}>
                          {copiedId === copyPassId ? <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-1">
                      {profiles.map((profile, i) => (
                        <div key={i} title={profile.tooltip} className={`h-3 w-3 rounded-full hover:scale-150 cursor-default transition-all ${profile.status === "free" ? "bg-muted border border-border" : getStatusColor(profile.status)}`} />
                      ))}
                      <span className="text-muted-foreground text-xs ml-0.5">{profiles.filter((p) => p.status !== "free").length}/{account.total_perfiles}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-1.5">
                    {account.precio_costo ? `${MONEDA} ${account.precio_costo.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <span className={`font-medium text-sm ${getVencimientoColor(account.fecha_vencimiento_proveedor)}`}>
                      {account.fecha_vencimiento_proveedor ? new Date(account.fecha_vencimiento_proveedor).toLocaleDateString("es-PE") : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-1.5">
                    <div className="flex items-center justify-end gap-0.5">
                      {plataformaUrl && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200" title="Abrir plataforma" onClick={() => window.open(plataformaUrl, "_blank", "noopener,noreferrer")}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200" onClick={() => handleEdit(account)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200" onClick={() => handleDelete(account.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-1.5">
        {accounts.map((account) => {
          const plataforma = getPlataformaByValue(account.plataforma);
          const correo = getCorreo(account);
          const contrasena = account.contraseña || "";
          const plataformaUrl = getPlataformaUrl(account.plataforma);
          const copyCorreoId = `copy-correo-m-${account.id}`;
          const copyPassId = `copy-pass-m-${account.id}`;
          const profiles = getAccountProfiles(account.id, account.total_perfiles);

          return (
            <div key={account.id} className="rounded-xl p-3 bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-xs`}>
                  {plataforma?.label || account.plataforma}
                </Badge>
                <div className="flex items-center gap-1">
                  {plataformaUrl && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all duration-200" title="Abrir plataforma" onClick={() => window.open(plataformaUrl, "_blank", "noopener,noreferrer")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200" onClick={() => handleEdit(account)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200" onClick={() => handleDelete(account.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {correo && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground text-xs font-mono truncate" title={correo}>{truncarCorreo(correo)}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleCopy(correo, copyCorreoId)}>
                    {copiedId === copyCorreoId ? <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}

              {contrasena && (
                <div className="flex items-center gap-1.5">
                  <KeyRound className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground text-xs font-mono truncate" title={contrasena}>{mascararContrasena(contrasena)}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleCopy(contrasena, copyPassId)}>
                    {copiedId === copyPassId ? <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profiles.map((profile, i) => (
                    <div key={i} title={profile.tooltip} className={`h-4 w-4 rounded-full cursor-default border-2 ${profile.status === "free" ? "bg-muted border-border border-dashed" : profile.status === "active" ? "bg-emerald-500 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-500" : profile.status === "expiring" ? "bg-amber-500 dark:bg-amber-400 border-amber-600 dark:border-amber-500" : profile.status === "expired" ? "bg-red-500 dark:bg-red-400 border-red-600 dark:border-red-500" : "bg-muted-foreground/50 border-muted-foreground/70"}`} />
                  ))}
                  <span className="text-muted-foreground text-xs">
                    {profiles.filter((p) => p.status !== "free").length}/{account.total_perfiles}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-xs">
                    {account.precio_costo ? `${MONEDA} ${account.precio_costo.toFixed(2)}` : "-"}
                  </span>
                  <span className={`font-medium text-xs ${getVencimientoColor(account.fecha_vencimiento_proveedor)}`}>
                    {account.fecha_vencimiento_proveedor ? new Date(account.fecha_vencimiento_proveedor).toLocaleDateString("es-PE") : "-"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AccountForm open={formOpen} onOpenChange={handleFormClose} account={editingAccount} />
    </>
  );
}
