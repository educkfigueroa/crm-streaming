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
      <div className="rounded-xl p-10 text-center bg-card border border-border">
        <p className="text-muted-foreground">No hay clientes registrados.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Agrega un nuevo cliente para comenzar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="md:hidden space-y-1.5">
        {clients.map((client) => (
          <div
            key={`card-${client.id}`}
            className="rounded-xl p-2.5 bg-card border border-border space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => viewSubscriptions(client.id)}
                className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left truncate text-sm"
              >
                {client.nombre_completo}
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all duration-200"
                  title="Ver suscripciones"
                  onClick={() => viewSubscriptions(client.id)}
                >
                  <FileText className="h-3 w-3" />
                </Button>
                {client.whatsapp && (
                  <a
                    href={getWhatsAppLink(client.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-6 w-6 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-all duration-200"
                  >
                    <Phone className="h-3 w-3" />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200"
                  onClick={() => handleEdit(client)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200"
                  onClick={() => handleDelete(client.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {client.alias && (
              <p className="text-xs text-muted-foreground">{client.alias}</p>
            )}
            {client.whatsapp && (
              <a
                href={getWhatsAppLink(client.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
              >
                <span className="text-xs">{client.whatsapp}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block rounded-xl overflow-hidden bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium py-1 text-xs">Nombre</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-xs">WhatsApp</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right py-1 text-xs">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                <TableCell className="py-1">
                  <div>
                    <button
                      onClick={() => viewSubscriptions(client.id)}
                      className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left text-sm"
                    >
                      {client.nombre_completo}
                    </button>
                    {client.alias && (
                      <p className="text-xs text-muted-foreground mt-0">{client.alias}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-1">
                  {client.whatsapp ? (
                    <a
                      href={getWhatsAppLink(client.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                    >
                      <span className="text-xs">{client.whatsapp}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-1">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="Ver suscripciones"
                      onClick={() => viewSubscriptions(client.id)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    {client.whatsapp && (
                      <a
                        href={getWhatsAppLink(client.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-7 w-7 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
