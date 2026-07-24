"use client";

import { useState } from "react";
import { Plus, Trash2, Radio, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounts";
import type { Account } from "@/types";

interface IptvManagerProps {
  accounts: Account[];
  onUpdate: () => void;
}

export function IptvManager({ accounts, onUpdate }: IptvManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [url, setUrl] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const iptvAccounts = accounts.filter((a) => a.plataforma === "iptv");

  const handleOpen = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setNombre(account.servidor_xtream || "");
      setUrl(account.url_server || "");
    } else {
      setEditingAccount(null);
      setNombre("");
      setUrl("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setEditingAccount(null);
    setNombre("");
    setUrl("");
    setOpen(false);
  };

  const handleSave = async () => {
    if (!url) return;
    setLoading(true);

    const fd = new FormData();
    fd.set("plataforma", "iptv");
    fd.set("correo", "");
    fd.set("contraseña", "");
    fd.set("total_perfiles", "3");
    fd.set("proveedor", "");
    fd.set("precio_costo", "");
    fd.set("fecha_vencimiento_proveedor", "");
    fd.set("servidor_xtream", nombre);
    fd.set("url_server", url);
    fd.set("usuario_xtream", "");

    if (editingAccount) {
      await updateAccount(editingAccount.id, null, fd);
    } else {
      await createAccount(null, fd);
    }

    handleClose();
    setLoading(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este servidor IPTV?")) {
      await deleteAccount(id);
      onUpdate();
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-card border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <Radio className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Servidores IPTV</h3>
            <p className="text-xs text-muted-foreground">URLs disponibles para suscripciones IPTV</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpen()}
          className="rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 hover:bg-purple-500/20 border-0 font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar URL
        </Button>
      </div>

      {iptvAccounts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay servidores IPTV configurados.</p>
      ) : (
        <div className="space-y-2">
          {iptvAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-xl p-3 bg-accent/30 border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Radio className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />
                <div className="min-w-0">
                  {account.servidor_xtream && (
                    <p className="text-sm font-medium text-foreground truncate">{account.servidor_xtream}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{account.url_server || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                  onClick={() => handleOpen(account)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  onClick={() => handleDelete(account.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-popover border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg font-semibold">
              {editingAccount ? "Editar Servidor IPTV" : "Agregar Servidor IPTV"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingAccount ? "Modifica los datos del servidor" : "Ingresa los datos del servidor IPTV"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Nombre del Servidor</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Servidor Principal"
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">URL del Servidor *</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://ejemplo.com:8080"
                required
                className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!url || loading}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {loading ? "Guardando..." : editingAccount ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
