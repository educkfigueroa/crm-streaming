"use client";

import { useState, useOptimistic } from "react";
import Link from "next/link";
import { Trash2, Edit, Copy, Check, ExternalLink, Mail, KeyRound, X } from "lucide-react";
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
import { getPlataformaByValue, getPlatformColorClasses, MONEDA, isIptv, getPlataformaUrl } from "@/lib/constants";
import { AccountForm } from "./AccountForm";
import { AccountsFilterBar } from "./AccountsFilterBar";
import { deleteAccount } from "@/lib/actions/accounts";
import type { Account, Subscription } from "@/types";

interface AccountsTableProps {
  accounts: Account[];
  subscriptions: Subscription[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterPlataforma: string;
  onPlataformaChange: (v: string) => void;
  onDataChange?: () => void;
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

function getProfileLabel(status: string): string {
  return status === "active" ? "Activo" : status === "expiring" ? "Por vencer" : status === "expired" ? "Vencido" : "Suspendido";
}

const PROFILE_BADGE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
  expiring: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
  expired: "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20",
  suspended: "bg-muted text-muted-foreground border-border",
};

function getDaysUntilExpiry(fechaVencimiento: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(fechaVencimiento);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-PE");
}

/* ---------- Detalles (panel desktop y sheet mobile) ---------- */

interface AccountDetailsPanelProps {
  account: Account;
  subscriptions: Subscription[];
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
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
      <p className="text-[10px] text-muted-foreground truncate">{label}</p>
      <p className={cn("text-xs font-semibold truncate", highlight ? "text-amber-500 dark:text-amber-400" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function AccountDetailsPanel({
  account,
  subscriptions,
  copiedId,
  onCopy,
  onEdit,
  onDelete,
  onClose,
}: AccountDetailsPanelProps) {
  const plataforma = getPlataformaByValue(account.plataforma);
  const colorKey = plataforma?.color ?? "slate";
  const isIptvAccount = isIptv(account.plataforma);
  const correo = isIptvAccount ? account.usuario_xtream || "" : account.correo || "";
  const contrasena = account.contraseña || "";
  const plataformaUrl = getPlataformaUrl(account.plataforma);
  const initials = (plataforma?.label ?? "N/A").split(" ")[0].slice(0, 3).toUpperCase();
  const daysToExpiry = account.fecha_vencimiento_proveedor
    ? getDaysUntilExpiry(account.fecha_vencimiento_proveedor)
    : null;
  const accountSubs = subscriptions
    .filter((s) => s.cuenta_id === account.id)
    .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Detalles de la cuenta</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3.5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", getPlatformColorClasses(colorKey).badge)}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{plataforma?.label ?? account.plataforma}</p>
          <p className="truncate text-xs text-muted-foreground">
            {isIptvAccount ? (account.servidor_xtream || "Servidor IPTV") : (account.proveedor || "Cuenta streaming")}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <FieldRow
          label={isIptvAccount ? "Usuario Xtream" : "Correo"}
          value={correo || "-"}
          onCopy={correo ? () => onCopy(correo, `a-correo-${account.id}`) : undefined}
          copied={copiedId === `a-correo-${account.id}`}
        />
        <FieldRow
          label="Contraseña"
          value={contrasena ? "••••••••••" : "-"}
          onCopy={contrasena ? () => onCopy(contrasena, `a-pass-${account.id}`) : undefined}
          copied={copiedId === `a-pass-${account.id}`}
        />
        {isIptvAccount && account.url_server && (
          <FieldRow
            label="URL Servidor"
            value={account.url_server}
            onCopy={() => onCopy(account.url_server!, `a-url-${account.id}`)}
            copied={copiedId === `a-url-${account.id}`}
          />
        )}
        {isIptvAccount && account.url_panel_iptv && (
          <FieldRow
            label="URL Panel"
            value={account.url_panel_iptv}
            onCopy={() => onCopy(account.url_panel_iptv!, `a-panel-${account.id}`)}
            copied={copiedId === `a-panel-${account.id}`}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Costo" value={account.precio_costo ? `${MONEDA} ${account.precio_costo.toFixed(2)}` : "-"} />
        <MiniStat
          label={isIptvAccount ? "Servidor" : "Proveedor"}
          value={isIptvAccount ? (account.servidor_xtream || "-") : (account.proveedor || "-")}
        />
        <MiniStat
          label="Vence proveedor"
          value={account.fecha_vencimiento_proveedor ? formatDate(account.fecha_vencimiento_proveedor) : "-"}
          highlight={daysToExpiry !== null && daysToExpiry <= 5}
        />
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Perfiles asignados ({accountSubs.length}/{account.total_perfiles})
        </p>
        {accountSubs.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin perfiles asignados.</p>
        ) : (
          <div className="space-y-1.5">
            {accountSubs.map((sub) => {
              const status = getProfileStatus(sub);
              return (
                <div key={sub.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{sub.nombre_perfil}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(sub.fecha_vencimiento)}</p>
                  </div>
                  <Badge variant="outline" className={`${PROFILE_BADGE[status]} text-[10px] shrink-0`}>
                    {getProfileLabel(status)}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link href={`/suscripciones?plataforma=${account.plataforma}`} className="flex-1">
          <Button variant="outline" className="w-full h-9">
            Ver suscripciones
          </Button>
        </Link>
        {plataformaUrl && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="Abrir plataforma"
            onClick={() => window.open(plataformaUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="outline" className="flex-1 h-9" onClick={() => onEdit(account)}>
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-red-500 hover:text-red-500 hover:bg-red-500/10"
          onClick={() => onDelete(account.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Tabla principal ---------- */

export function AccountsTable({
  accounts,
  subscriptions,
  searchQuery,
  onSearchChange,
  filterPlataforma,
  onPlataformaChange,
  onDataChange,
}: AccountsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelHidden, setPanelHidden] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [optimisticAccounts, dispatchOptimistic] = useOptimistic(
    accounts,
    (state, action: { type: "delete"; id: string }) =>
      action.type === "delete"
        ? state.filter((a) => a.id !== action.id)
        : state
  );

  const activeAccount = optimisticAccounts.find((a) => a.id === selectedId) ?? null;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta cuenta?")) {
      dispatchOptimistic({ type: "delete", id });
      await deleteAccount(id);
      onDataChange?.();
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setEditingAccount(null);
    setFormOpen(false);
    onDataChange?.();
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

  const openDetails = (account: Account, mobile: boolean) => {
    setSelectedId(account.id);
    if (mobile) {
      setMobileOpen(true);
    } else {
      setPanelHidden(false);
    }
  };

  const detailProps = activeAccount
    ? {
        account: activeAccount,
        subscriptions,
        copiedId,
        onCopy: handleCopy,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onClose: () => setMobileOpen(false),
      }
    : null;

  if (optimisticAccounts.length === 0) {
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
      <div className="flex flex-col lg:flex-row items-start">
        <div className="w-full lg:flex-1 lg:min-w-0 transition-all duration-300 ease-in-out">
          <div className="space-y-4">
            <AccountsFilterBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              filterPlataforma={filterPlataforma}
              onPlataformaChange={onPlataformaChange}
            />

            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl overflow-hidden bg-card border border-border">
              <div className="overflow-x-auto">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium py-1 text-xs">Plataforma</TableHead>
                      <TableHead className="text-muted-foreground font-medium py-1 text-xs">Correo</TableHead>
                      <TableHead className="text-muted-foreground font-medium py-1 text-xs">Contraseña</TableHead>
                      <TableHead className="text-muted-foreground font-medium py-1 text-xs">Perfiles</TableHead>
                      <TableHead className="text-muted-foreground font-medium py-1 text-xs">Costo</TableHead>
                      <TableHead className="text-muted-foreground font-medium py-1 text-xs">Vence</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right py-1 text-xs">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="stagger-children">
                    {optimisticAccounts.map((account) => {
                      const plataforma = getPlataformaByValue(account.plataforma);
                      const correo = getCorreo(account);
                      const contrasena = account.contraseña || "";
                      const plataformaUrl = getPlataformaUrl(account.plataforma);
                      const copyCorreoId = `copy-correo-${account.id}`;
                      const copyPassId = `copy-pass-${account.id}`;
                      const profiles = getAccountProfiles(account.id, account.total_perfiles);

                      return (
                        <TableRow
                          key={account.id}
                          onClick={() => openDetails(account, false)}
                          className={cn(
                            "border-b border-border transition-all duration-200 cursor-pointer",
                            selectedId === account.id
                              ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                              : "hover:bg-accent/30"
                          )}
                        >
                          <TableCell className="py-1">
                            <Link
                              href={`/suscripciones?plataforma=${account.plataforma}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Badge variant="secondary" className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-xs hover:opacity-80 transition-opacity cursor-pointer`}>
                                {plataforma?.label || account.plataforma}
                              </Badge>
                            </Link>
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-1.5">
                              {correo ? (
                                <Link
                                  href={`/suscripciones?buscar=${encodeURIComponent(correo)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-muted-foreground text-xs font-mono hover:text-foreground transition-colors truncate max-w-[120px]"
                                  title={correo}
                                >
                                  {truncarCorreo(correo)}
                                </Link>
                              ) : (
                                <span className="text-muted-foreground text-xs font-mono">-</span>
                              )}
                              {correo && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => { e.stopPropagation(); handleCopy(correo, copyCorreoId); }}
                                >
                                  {copiedId === copyCorreoId ? <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground text-xs font-mono">
                                {contrasena ? mascararContrasena(contrasena) : "-"}
                              </span>
                              {contrasena && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => { e.stopPropagation(); handleCopy(contrasena, copyPassId); }}
                                >
                                  {copiedId === copyPassId ? <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-1">
                              {profiles.map((profile, i) => (
                                <div key={i} title={profile.tooltip} className={`h-3 w-3 rounded-full hover:scale-150 cursor-default transition-all ${profile.status === "free" ? "bg-muted border border-border" : getStatusColor(profile.status)}`} />
                              ))}
                              <span className="text-muted-foreground text-xs ml-0.5">{profiles.filter((p) => p.status !== "free").length}/{account.total_perfiles}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground text-sm py-1">
                            {account.precio_costo ? `${MONEDA} ${account.precio_costo.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell className="py-1">
                            <span className={`font-medium text-sm ${getVencimientoColor(account.fecha_vencimiento_proveedor)}`}>
                              {account.fecha_vencimiento_proveedor ? new Date(account.fecha_vencimiento_proveedor).toLocaleDateString("es-PE") : "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-1">
                            <div className="flex items-center justify-end gap-0.5">
                              {plataformaUrl && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                  title="Abrir plataforma"
                                  onClick={(e) => { e.stopPropagation(); window.open(plataformaUrl, "_blank", "noopener,noreferrer"); }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                                onClick={(e) => { e.stopPropagation(); handleEdit(account); }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}
                              >
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
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-1.5 stagger-children">
              {optimisticAccounts.map((account) => {
                const plataforma = getPlataformaByValue(account.plataforma);
                const correo = getCorreo(account);
                const contrasena = account.contraseña || "";
                const plataformaUrl = getPlataformaUrl(account.plataforma);
                const copyCorreoId = `copy-correo-m-${account.id}`;
                const copyPassId = `copy-pass-m-${account.id}`;
                const profiles = getAccountProfiles(account.id, account.total_perfiles);

                return (
                  <div
                    key={account.id}
                    onClick={() => openDetails(account, true)}
                    className="rounded-xl p-2.5 bg-card border border-border space-y-1.5 active:scale-[0.99] transition-all duration-150 cursor-pointer"
                  >
                    {/* Row 1: Platform badge + profiles + actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          href={`/suscripciones?plataforma=${account.plataforma}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge variant="secondary" className={`${getPlatformColorClasses(plataforma?.color ?? "slate").badge} font-medium text-xs shrink-0 hover:opacity-80 transition-opacity cursor-pointer`}>
                            {plataforma?.label || account.plataforma}
                          </Badge>
                        </Link>
                        <div className="flex items-center gap-1 shrink-0">
                          {profiles.map((profile, i) => (
                            <div key={i} title={profile.tooltip} className={`h-3 w-3 rounded-full cursor-default border-2 ${profile.status === "free" ? "bg-muted border-border border-dashed" : profile.status === "active" ? "bg-emerald-500 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-500" : profile.status === "expiring" ? "bg-amber-500 dark:bg-amber-400 border-amber-600 dark:border-amber-500" : profile.status === "expired" ? "bg-red-500 dark:bg-red-400 border-red-600 dark:border-red-500" : "bg-muted-foreground/50 border-muted-foreground/70"}`} />
                          ))}
                          <span className="text-muted-foreground text-[10px]">
                            {profiles.filter((p) => p.status !== "free").length}/{account.total_perfiles}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {plataformaUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all duration-200"
                            title="Abrir plataforma"
                            onClick={(e) => { e.stopPropagation(); window.open(plataformaUrl, "_blank", "noopener,noreferrer"); }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200"
                          onClick={(e) => { e.stopPropagation(); handleEdit(account); }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200"
                          onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Row 2: Email + Password + Expiry */}
                    <div className="flex items-center gap-2 text-xs">
                      {correo && (
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Link
                            href={`/suscripciones?buscar=${encodeURIComponent(correo)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground font-mono truncate hover:text-foreground transition-colors"
                            title={correo}
                          >
                            {truncarCorreo(correo)}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={(e) => { e.stopPropagation(); handleCopy(correo, copyCorreoId); }}
                          >
                            {copiedId === copyCorreoId ? <Check className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                          </Button>
                        </div>
                      )}
                      {contrasena && (
                        <div className="flex items-center gap-1 shrink-0">
                          <KeyRound className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground font-mono">{mascararContrasena(contrasena)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={(e) => { e.stopPropagation(); handleCopy(contrasena, copyPassId); }}
                          >
                            {copiedId === copyPassId ? <Check className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-foreground">
                          {account.precio_costo ? `${MONEDA} ${account.precio_costo.toFixed(0)}` : ""}
                        </span>
                        <span className={`font-medium ${getVencimientoColor(account.fecha_vencimiento_proveedor)}`}>
                          {account.fecha_vencimiento_proveedor ? new Date(account.fecha_vencimiento_proveedor).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }) : ""}
                        </span>
                      </div>
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
            {activeAccount && !panelHidden && detailProps && (
              <div className="rounded-2xl border border-border/50 bg-card p-5 lg:sticky lg:top-16 max-h-[calc(100vh-5rem)] overflow-y-auto">
                <AccountDetailsPanel {...detailProps} onClose={() => setPanelHidden(true)} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[85vh] overflow-y-auto p-4 pb-6 sm:p-5">
          <SheetTitle className="sr-only">Detalles de la cuenta</SheetTitle>
          {activeAccount && detailProps && (
            <AccountDetailsPanel {...detailProps} onClose={() => setMobileOpen(false)} />
          )}
        </SheetContent>
      </Sheet>

      <AccountForm open={formOpen} onOpenChange={handleFormClose} account={editingAccount} />
    </>
  );
}
