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

const COUNTRIES = [
  { code: "+51", flag: "🇵🇪", label: "Perú" },
  { code: "+52", flag: "🇲🇽", label: "México" },
  { code: "+54", flag: "🇦🇷", label: "Argentina" },
  { code: "+56", flag: "🇨🇱", label: "Chile" },
  { code: "+57", flag: "🇨🇴", label: "Colombia" },
  { code: "+53", flag: "🇨🇺", label: "Cuba" },
  { code: "+58", flag: "🇻🇪", label: "Venezuela" },
  { code: "+593", flag: "🇪🇨", label: "Ecuador" },
  { code: "+591", flag: "🇧🇴", label: "Bolivia" },
  { code: "+595", flag: "🇵🇾", label: "Paraguay" },
  { code: "+598", flag: "🇺🇾", label: "Uruguay" },
  { code: "+1", flag: "🇺🇸", label: "USA" },
  { code: "+34", flag: "🇪🇸", label: "España" },
  { code: "+55", flag: "🇧🇷", label: "Brasil" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+33", flag: "🇫🇷", label: "Francia" },
  { code: "+49", flag: "🇩🇪", label: "Alemania" },
  { code: "+39", flag: "🇮🇹", label: "Italia" },
  { code: "+81", flag: "🇯🇵", label: "Japón" },
  { code: "+86", flag: "🇨🇳", label: "China" },
  { code: "+82", flag: "🇰🇷", label: "Corea" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
] as const;

function getCountryInfo(phone: string): { flag: string; code: string } | null {
  const cleaned = phone.replace(/\D/g, "");
  for (const country of COUNTRIES) {
    const digits = country.code.replace(/\D/g, "");
    if (cleaned.startsWith(digits) && cleaned.length > digits.length) {
      return { flag: country.flag, code: country.code };
    }
  }
  return null;
}

function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  let codeLen = 0;
  for (const country of COUNTRIES) {
    const digits = country.code.replace(/\D/g, "");
    if (cleaned.startsWith(digits)) {
      codeLen = digits.length;
      break;
    }
  }
  const local = cleaned.slice(codeLen);
  if (local.length <= 4) return local;
  const first2 = local.slice(0, 2);
  const last2 = local.slice(-2);
  const masked = "•".repeat(Math.min(local.length - 4, 4));
  return `${first2} ${masked} ${last2}`;
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
              className="rounded-xl p-2.5 bg-card border border-border flex items-start justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 min-w-0 py-0.5">
                <button
                  onClick={() => viewSubscriptions(client.id)}
                  className="font-medium text-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left truncate text-sm"
                >
                  {client.nombre_completo}
                </button>
                {client.whatsapp && (
                  <a
                    href={getWhatsAppLink(client.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors shrink-0"
                  >
                    {country && <span className="text-xs">{country.flag}</span>}
                    <span className="text-xs font-mono">{maskPhone(client.whatsapp)}</span>
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                  title="Ver suscripciones"
                  onClick={() => viewSubscriptions(client.id)}
                >
                  <FileText className="h-3.5 w-3.5" />
                </Button>
                {client.whatsapp ? (
                  <a
                    href={getWhatsAppLink(client.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-7 w-7 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div className="h-7 w-7" />
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
