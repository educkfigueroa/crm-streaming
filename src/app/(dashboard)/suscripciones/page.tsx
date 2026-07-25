"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, X, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionsTable } from "@/components/suscripciones/SubscriptionsTable";
import { SubscriptionForm } from "@/components/suscripciones/SubscriptionForm";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { getClients } from "@/lib/actions/clients";
import { PLATAFORMAS, PLATAFORMA_IPTV, ESTADOS_SUSCRIPCION } from "@/lib/constants";
import type { SubscriptionWithDetails, Client } from "@/types";

function SuscripcionesContent() {
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [filteredClient, setFilteredClient] = useState<Client | null>(null);
  const [filterPlataforma, setFilterPlataforma] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");

  useEffect(() => {
    loadSubscriptions();
  }, [clienteId]);

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
    filteredSubscriptions = filteredSubscriptions.filter(
      (sub) => sub.estado === filterEstado
    );
  }

  const hasActiveFilters = filterPlataforma !== "all" || filterEstado !== "all" || !!clienteId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Suscripciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredClient
              ? `Suscripciones de ${filteredClient.nombre_completo}`
              : "Perfiles asignados a clientes"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasActiveFilters && (
            <Link href="/suscripciones">
              <Button
                variant="outline"
                className="rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </Link>
          )}
          <Button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/5 transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Suscripción
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterPlataforma} onValueChange={(v) => setFilterPlataforma(v ?? "all")}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las plataformas</SelectItem>
            {[...PLATAFORMAS, PLATAFORMA_IPTV].map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={(v) => setFilterEstado(v ?? "all")}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {ESTADOS_SUSCRIPCION.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
