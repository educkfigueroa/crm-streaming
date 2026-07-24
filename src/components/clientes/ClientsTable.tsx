"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientForm } from "./ClientForm";
import { deleteClient } from "@/lib/actions/clients";
import type { Client } from "@/types";

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      await deleteClient(id);
      window.location.reload();
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setEditingClient(null);
    setFormOpen(false);
    window.location.reload();
  };

  const getWhatsAppLink = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  };

  const viewSubscriptions = (clientId: string) => {
    router.push(`/suscripciones?cliente=${clientId}`);
  };

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center bg-card border border-border">
        <p className="text-muted-foreground">No hay clientes registrados.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Agrega un nuevo cliente para comenzar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {clients.map((client) => (
          <div
            key={`card-${client.id}`}
            className="rounded-2xl p-4 bg-card border border-border space-y-2"
          >
            <button
              onClick={() => viewSubscriptions(client.id)}
              className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
            >
              {client.nombre_completo}
            </button>
            {client.alias && (
              <p className="text-xs text-muted-foreground">Alias: {client.alias}</p>
            )}

            {client.whatsapp && (
              <a
                href={getWhatsAppLink(client.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                  <Phone className="h-3 w-3" />
                </div>
                <span className="text-sm">{client.whatsapp}</span>
              </a>
            )}

            {client.notas && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {client.notas}
              </p>
            )}

            <div className="flex items-center gap-1 pt-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                title="Ver suscripciones"
                onClick={() => viewSubscriptions(client.id)}
              >
                <FileText className="h-4 w-4" />
              </Button>
              {client.whatsapp && (
                <a
                  href={getWhatsAppLink(client.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                onClick={() => handleEdit(client)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                onClick={() => handleDelete(client.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block rounded-2xl overflow-hidden bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Nombre</TableHead>
              <TableHead className="text-muted-foreground font-medium">WhatsApp</TableHead>
              <TableHead className="text-muted-foreground font-medium">Notas</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                <TableCell>
                  <div>
                    <button
                      onClick={() => viewSubscriptions(client.id)}
                      className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                    >
                      {client.nombre_completo}
                    </button>
                    {client.alias && (
                      <p className="text-xs text-muted-foreground mt-0.5">{client.alias}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {client.whatsapp ? (
                    <a
                      href={getWhatsAppLink(client.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                        <Phone className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{client.whatsapp}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm line-clamp-1 max-w-[200px]">
                    {client.notas || "-"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="Ver suscripciones"
                      onClick={() => viewSubscriptions(client.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    {client.whatsapp && (
                      <a
                        href={getWhatsAppLink(client.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ClientForm
        open={formOpen}
        onOpenChange={handleFormClose}
        client={editingClient}
      />
    </>
  );
}
