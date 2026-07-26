"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, FileText } from "lucide-react";
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const COUNTRY_FLAGS: Record<string, string> = {
  "+51": "🇵🇪",
  "+52": "🇲🇽",
  "+54": "🇦🇷",
  "+56": "🇨🇱",
  "+57": "🇨🇴",
  "+53": "🇨🇺",
  "+58": "🇻🇪",
  "+593": "🇪🇨",
  "+591": "🇧🇴",
  "+595": "🇵🇾",
  "+598": "🇺🇾",
  "+1": "🇺🇸",
  "+34": "🇪🇸",
  "+55": "🇧🇷",
  "+44": "🇬🇧",
  "+33": "🇫🇷",
  "+49": "🇩🇪",
  "+39": "🇮🇹",
  "+81": "🇯🇵",
  "+86": "🇨🇳",
  "+82": "🇰🇷",
  "+91": "🇮🇳",
  "+61": "🇦🇺",
};

function getCountryInfo(phone: string): { flag: string; code: string } | null {
  const cleaned = phone.replace(/\D/g, "");
  // Try longest codes first (3 digits), then 2, then 1
  for (const len of [3, 2, 1]) {
    for (const [code, flag] of Object.entries(COUNTRY_FLAGS)) {
      const digits = code.replace(/\D/g, "");
      if (cleaned.startsWith(digits) && cleaned.length > len) {
        return { flag, code };
      }
    }
  }
  return null;
}

function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length <= 4) return phone;
  const visible = cleaned.slice(-2);
  const prefix = cleaned.slice(0, cleaned.length > 8 ? 3 : cleaned.length - 4);
  const masked = "•".repeat(Math.min(cleaned.length - prefix.length - 2, 6));
  return `+${prefix} ${masked} ${visible}`;
}

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
        {clients.map((client) => {
          const country = client.whatsapp ? getCountryInfo(client.whatsapp) : null;
          return (
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
                      <WhatsAppIcon className="h-3.5 w-3.5" />
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
              {client.whatsapp && (
                <a
                  href={getWhatsAppLink(client.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                >
                  {country && <span className="text-xs">{country.flag}</span>}
                  <span className="text-xs font-mono">{maskPhone(client.whatsapp)}</span>
                </a>
              )}
            </div>
          );
        })}
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
            {clients.map((client) => {
              const country = client.whatsapp ? getCountryInfo(client.whatsapp) : null;
              return (
                <TableRow key={client.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <TableCell className="py-1">
                    <button
                      onClick={() => viewSubscriptions(client.id)}
                      className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left text-sm"
                    >
                      {client.nombre_completo}
                    </button>
                  </TableCell>
                  <TableCell className="py-1">
                    {client.whatsapp ? (
                      <a
                        href={getWhatsAppLink(client.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                      >
                        {country && <span className="text-sm">{country.flag}</span>}
                        <span className="text-xs font-mono">{maskPhone(client.whatsapp)}</span>
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
                          <WhatsAppIcon className="h-4 w-4" />
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
              );
            })}
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
