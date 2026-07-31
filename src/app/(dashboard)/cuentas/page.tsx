"use client";

import { useState, useEffect } from "react";
import { Plus, Tv, Radio, ExternalLink, Trash2, Edit } from "lucide-react";
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
import { AccountsTable } from "@/components/cuentas/AccountsTable";
import { AccountForm } from "@/components/cuentas/AccountForm";
import { AccountsFilterBar } from "@/components/cuentas/AccountsFilterBar";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounts";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import type { Account, Subscription } from "@/types";

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [filterPlataforma, setFilterPlataforma] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // IPTV state
  const [iptvFormOpen, setIptvFormOpen] = useState(false);
  const [editingIptv, setEditingIptv] = useState<Account | null>(null);
  const [iptvNombre, setIptvNombre] = useState("");
  const [iptvUrl, setIptvUrl] = useState("");
  const [iptvUrlPanel, setIptvUrlPanel] = useState("");
  const [iptvLoading, setIptvLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [accountsData, subsData] = await Promise.all([
      getAccounts(),
      getSubscriptions(),
    ]);
    setAccounts(accountsData);
    setSubscriptions(subsData);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAccounts(), getSubscriptions()]).then(
      ([accountsData, subsData]) => {
        if (cancelled) return;
        setAccounts(accountsData);
        setSubscriptions(subsData);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const iptvAccounts = accounts.filter((a) => a.plataforma === "iptv");
  let streamingAccounts = accounts.filter((a) => a.plataforma !== "iptv");

  if (filterPlataforma !== "all") {
    streamingAccounts = streamingAccounts.filter((a) => a.plataforma === filterPlataforma);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    streamingAccounts = streamingAccounts.filter(
      (a) =>
        a.correo?.toLowerCase().includes(q) ||
        a.plataforma?.toLowerCase().includes(q) ||
        a.proveedor?.toLowerCase().includes(q)
    );
  }

  // IPTV handlers
  const handleIptvOpen = (account?: Account) => {
    if (account) {
      setEditingIptv(account);
      setIptvNombre(account.servidor_xtream || "");
      setIptvUrl(account.url_server || "");
      setIptvUrlPanel(account.url_panel_iptv || "");
    } else {
      setEditingIptv(null);
      setIptvNombre("");
      setIptvUrl("");
      setIptvUrlPanel("");
    }
    setIptvFormOpen(true);
  };

  const handleIptvClose = () => {
    setEditingIptv(null);
    setIptvNombre("");
    setIptvUrl("");
    setIptvUrlPanel("");
    setIptvFormOpen(false);
  };

  const handleIptvSave = async () => {
    if (!iptvUrl) return;
    setIptvLoading(true);
    const fd = new FormData();
    fd.set("plataforma", "iptv");
    fd.set("correo", "");
    fd.set("contraseña", "");
    fd.set("total_perfiles", "3");
    fd.set("proveedor", "");
    fd.set("precio_costo", "");
    fd.set("fecha_vencimiento_proveedor", "");
    fd.set("servidor_xtream", iptvNombre);
    fd.set("url_server", iptvUrl);
    fd.set("url_panel_iptv", iptvUrlPanel);
    fd.set("usuario_xtream", "");
    if (editingIptv) {
      await updateAccount(editingIptv.id, null, fd);
    } else {
      await createAccount(null, fd);
    }
    handleIptvClose();
    setIptvLoading(false);
    loadData();
  };

  const handleIptvDelete = async (id: string) => {
    if (confirm("¿Eliminar este servidor IPTV?")) {
      await deleteAccount(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Cuentas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona tus cuentas de streaming</p>
      </div>

      {/* Two-column top section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {/* Streaming Accounts */}
        <div className="rounded-2xl p-5 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Tv className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cuentas Streaming</h3>
              <p className="text-xs text-muted-foreground">{streamingAccounts.length} cuentas</p>
            </div>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
            title="Agregar cuenta"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* IPTV Servers */}
        <div className="rounded-2xl p-5 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <Radio className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Servidores IPTV</h3>
                <p className="text-xs text-muted-foreground">{iptvAccounts.length} servidores</p>
              </div>
            </div>
            <button
              onClick={() => handleIptvOpen()}
              className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400 hover:bg-purple-500/20 flex items-center justify-center transition-colors"
              title="Agregar servidor"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {iptvAccounts.length === 0 ? (
            <p className="text-muted-foreground text-xs">Sin servidores configurados.</p>
          ) : (
            <div className="space-y-1.5">
              {iptvAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2 bg-accent/30 border border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Radio className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400 shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {account.servidor_xtream || "Servidor IPTV"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {account.url_panel_iptv && (
                      <a
                        href={account.url_panel_iptv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-6 w-6 flex items-center justify-center rounded-md text-purple-500 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
                        title="Abrir panel"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      onClick={() => handleIptvOpen(account)}
                      className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleIptvDelete(account.id)}
                      className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <AccountsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterPlataforma={filterPlataforma}
        onPlataformaChange={setFilterPlataforma}
      />

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl p-12 text-center bg-card border border-border">
          <p className="text-muted-foreground">Cargando cuentas...</p>
        </div>
      ) : (
        <AccountsTable accounts={streamingAccounts} subscriptions={subscriptions} />
      )}

      {/* Streaming Account Form */}
      <AccountForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) loadData();
        }}
      />

      {/* IPTV Form Dialog */}
      <Dialog open={iptvFormOpen} onOpenChange={handleIptvClose}>
        <DialogContent className="max-w-md bg-popover border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg font-semibold">
              {editingIptv ? "Editar Servidor IPTV" : "Agregar Servidor IPTV"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingIptv ? "Modifica los datos del servidor" : "Ingresa los datos del servidor IPTV"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Nombre del Servidor</Label>
              <Input
                value={iptvNombre}
                onChange={(e) => setIptvNombre(e.target.value)}
                placeholder="Ej: Servidor Principal"
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">URL del Servidor *</Label>
              <Input
                value={iptvUrl}
                onChange={(e) => setIptvUrl(e.target.value)}
                placeholder="http://ejemplo.com:8080"
                required
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">URL Panel IPTV</Label>
              <Input
                value={iptvUrlPanel}
                onChange={(e) => setIptvUrlPanel(e.target.value)}
                placeholder="http://ejemplo.com:panel"
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleIptvClose}
              className="rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleIptvSave}
              disabled={!iptvUrl || iptvLoading}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {iptvLoading ? "Guardando..." : editingIptv ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
