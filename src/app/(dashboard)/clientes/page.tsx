"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientsTable } from "@/components/clientes/ClientsTable";
import { ClientForm } from "@/components/clientes/ClientForm";
import { getClients } from "@/lib/actions/clients";
import type { Client } from "@/types";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Directorio de clientes</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground">Cargando clientes...</p>
        </div>
      ) : (
        <ClientsTable clients={clients} />
      )}

      <ClientForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) loadClients();
        }}
      />
    </div>
  );
}
