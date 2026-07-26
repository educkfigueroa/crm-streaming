"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountsTable } from "@/components/cuentas/AccountsTable";
import { AccountForm } from "@/components/cuentas/AccountForm";
import { IptvManager } from "@/components/cuentas/IptvManager";
import { AccountsFilterBar } from "@/components/cuentas/AccountsFilterBar";
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

  useEffect(() => {
    loadData();
  }, []);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Cuentas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestiona tus cuentas de streaming</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/5 transition-all duration-200 hover:scale-[1.02] shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      <IptvManager accounts={accounts} onUpdate={loadData} />

      <AccountsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterPlataforma={filterPlataforma}
        onPlataformaChange={setFilterPlataforma}
      />

      {loading ? (
        <div className="rounded-2xl p-12 text-center bg-card border border-border">
          <p className="text-muted-foreground">Cargando cuentas...</p>
        </div>
      ) : (
        <AccountsTable accounts={streamingAccounts} subscriptions={subscriptions} />
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) loadData();
        }}
      />
    </div>
  );
}
