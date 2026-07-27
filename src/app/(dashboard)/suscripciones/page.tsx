"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { SubscriptionsTable } from "@/components/suscripciones/SubscriptionsTable";
import { SubscriptionForm } from "@/components/suscripciones/SubscriptionForm";
import { FilterBar } from "@/components/suscripciones/FilterBar";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { getClients } from "@/lib/actions/clients";
import type { SubscriptionWithDetails, Client } from "@/types";

function SuscripcionesContent() {
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");
  const estadoParam = searchParams.get("estado");

  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [filteredClient, setFilteredClient] = useState<Client | null>(null);
  const [filterPlataforma, setFilterPlataforma] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>(estadoParam || "all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSubscriptions();
  }, [clienteId]);

  useEffect(() => {
    if (estadoParam) {
      setFilterEstado(estadoParam);
    }
  }, [estadoParam]);

  useEffect(() => {
    if (clienteId) {
      getClients().then((clients) => {
        const client = clients.find((c) => c.id === clienteId);
        setFilteredClient(client || null);
      });
    } else {
      setFilteredClient(null);
    }
  }, [clienteId]);

  const loadSubscriptions = async () => {
    setLoading(true);
    const data = await getSubscriptions();
    setSubscriptions(data);
    setLoading(false);
  };

  let filteredSubscriptions = clienteId
    ? subscriptions.filter((sub) => sub.cliente_id === clienteId)
    : subscriptions;

  if (filterPlataforma !== "all") {
    filteredSubscriptions = filteredSubscriptions.filter(
      (sub) => sub.accounts?.plataforma === filterPlataforma
    );
  }

  if (filterEstado !== "all") {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    filteredSubscriptions = filteredSubscriptions.filter((sub) => {
      const venc = new Date(sub.fecha_vencimiento);
      venc.setHours(0, 0, 0, 0);
      const diff = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      const estado = diff > 7 ? "Activo" : diff > 0 ? "Por Vencer" : "Vencido";
      return estado === filterEstado;
    });
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredSubscriptions = filteredSubscriptions.filter(
      (sub) =>
        sub.nombre_perfil?.toLowerCase().includes(q) ||
        sub.clients?.nombre_completo?.toLowerCase().includes(q) ||
        sub.accounts?.plataforma?.toLowerCase().includes(q) ||
        sub.accounts?.correo?.toLowerCase().includes(q)
    );
  }

  const hasActiveFilters = filterPlataforma !== "all" || filterEstado !== "all" || !!clienteId || searchQuery.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Suscripciones</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredClient
                ? `Suscripciones de ${filteredClient.nombre_completo}`
                : "Perfiles asignados a clientes"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0"
          title="Nueva Suscripción"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterPlataforma={filterPlataforma}
        onPlataformaChange={setFilterPlataforma}
        filterEstado={filterEstado}
        onEstadoChange={setFilterEstado}
      />

      {loading ? (
        <div className="rounded-2xl p-12 text-center bg-card border border-border">
          <p className="text-muted-foreground">Cargando suscripciones...</p>
        </div>
      ) : (
        <SubscriptionsTable subscriptions={filteredSubscriptions} />
      )}

      <SubscriptionForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) loadSubscriptions();
        }}
        defaultClienteId={clienteId || undefined}
      />
    </div>
  );
}

export default function SuscripcionesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Suscripciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <SuscripcionesContent />
    </Suspense>
  );
}
