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
      <div className="rounded-xl p-8 text-center bg-card border border-border">
        <p className="text-muted-foreground text-sm">No hay clientes registrados.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="md:hidden space-y-1">
        {clients.map((client) => (
          <div key={`card-${client.id}`} className="rounded-lg p-2 bg-card border border-border">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <button onClick={() => viewSubscriptions(client.id)} className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left text-xs truncate block">
                  {client.nombre_completo}
                </button>
                {client.alias && <p className="text-[9px] text-muted-foreground truncate">{client.alias}</p>}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md" onClick={() => viewSubscriptions(client.id)}>
                  <FileText className="h-2.5 w-2.5" />
                </Button>
                {client.whatsapp && (
                  <a href={getWhatsAppLink(client.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-5 w-5 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md">
                    <Phone className="h-2.5 w-2.5" />
                  </a>
                )}
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md" onClick={() => handleEdit(client)}>
                  <Edit className="h-2.5 w-2.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md" onClick={() => handleDelete(client.id)}>
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
            {client.whatsapp && (
              <a href={getWhatsAppLink(client.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 text-[9px]">
                {client.whatsapp}
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
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">Nombre</TableHead>
              <TableHead className="text-muted-foreground font-medium py-1 text-[11px]">WhatsApp</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right py-1 text-[11px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                <TableCell className="py-1">
                  <button onClick={() => viewSubscriptions(client.id)} className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left text-xs">
                    {client.nombre_completo}
                  </button>
                  {client.alias && <p className="text-[9px] text-muted-foreground">{client.alias}</p>}
                </TableCell>
                <TableCell className="py-1">
                  {client.whatsapp ? (
                    <a href={getWhatsAppLink(client.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 text-[10px]">
                      {client.whatsapp}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-[10px]">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-1">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md" onClick={() => viewSubscriptions(client.id)}>
                      <FileText className="h-3 w-3" />
                    </Button>
                    {client.whatsapp && (
                      <a href={getWhatsAppLink(client.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-5 w-5 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md">
                        <Phone className="h-3 w-3" />
                      </a>
                    )}
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md" onClick={() => handleEdit(client)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md" onClick={() => handleDelete(client.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ClientForm open={formOpen} onOpenChange={handleFormClose} client={editingClient} />
    </>
  );
}
