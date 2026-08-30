"use client";

import { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientsTable } from "@/components/clientes/ClientsTable";
import { ClientForm } from "@/components/clientes/ClientForm";
import { TableSkeleton } from "@/components/ui/skeleton";
import { getClients } from "@/lib/actions/clients";
import type { Client } from "@/types";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const loadClients = async (background = false) => {
    if (!background) setLoading(true);
    const data = await getClients();
    setClients(data);
    if (!background) setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    getClients().then((data) => {
      if (cancelled) return;
      setClients(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const exportCSV = () => {
    const headers = ["Nombre", "Alias", "WhatsApp", "Notas"];
    const rows = clients.map((c) => [
      c.nombre_completo,
      c.alias || "",
      c.whatsapp || "",
      c.notas || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Directorio de clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportCSV}
            className="rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-accent font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <ClientsTable clients={clients} onDataChange={() => loadClients(true)} />
      )}

      <ClientForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) loadClients(true);
        }}
      />
    </div>
  );
}
