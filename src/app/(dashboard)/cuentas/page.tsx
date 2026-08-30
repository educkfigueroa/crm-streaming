"use client";

import { useState, useEffect } from "react";
import { Plus, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountsTable } from "@/components/cuentas/AccountsTable";
import { AccountForm } from "@/components/cuentas/AccountForm";
import { IptvManager } from "@/components/cuentas/IptvManager";
import { TableSkeleton } from "@/components/ui/skeleton";
import { getAccounts } from "@/lib/actions/accounts";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import type { Account, Subscription } from "@/types";

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [filterPlataforma, setFilterPlataforma] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async (background = false) => {
    if (!background) setLoading(true);
    const [accountsData, subsData] = await Promise.all([
      getAccounts(),
      getSubscriptions(),
    ]);
    setAccounts(accountsData);
    setSubscriptions(subsData);
    if (!background) setLoading(false);
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

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Cuentas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona tus cuentas de streaming</p>
      </div>

      {/* Streaming accounts summary card */}
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

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <AccountsTable
          accounts={streamingAccounts}
          subscriptions={subscriptions}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterPlataforma={filterPlataforma}
          onPlataformaChange={setFilterPlataforma}
          onDataChange={() => loadData(true)}
        />
      )}

      {/* IPTV Manager (uses extracted component) */}
      <IptvManager accounts={accounts} onUpdate={() => loadData(true)} />

      {/* Streaming Account Form */}
      <AccountForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) loadData(true);
        }}
      />
    </div>
  );
}
