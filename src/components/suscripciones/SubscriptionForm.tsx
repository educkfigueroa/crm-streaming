"use client";

import { useState, useEffect, useActionState } from "react";
import { createSubscription, updateSubscription } from "@/lib/actions/subscriptions";
import { getClients } from "@/lib/actions/clients";
import { getAccounts } from "@/lib/actions/accounts";
import { ESTADOS_SUSCRIPCION, MONEDA, getPlataformaByValue, hasPin, PLATAFORMAS } from "@/lib/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Plus, X, Radio, User, Calendar, DollarSign } from "lucide-react";
import type { SubscriptionWithDetails, Client, Account } from "@/types";

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionWithDetails | null;
  defaultClienteId?: string;
}

interface ProfileEntry {
  platform: string;
  cuentaId: string;
  nombrePerfil: string;
  pinPerfil: string;
  precio: string;
}

function addOneMonth(dateStr: string): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0];
}

export function SubscriptionForm({ open, onOpenChange, subscription, defaultClienteId }: SubscriptionFormProps) {
  const isEditing = !!subscription;
  const isIptvEditing = isEditing && subscription?.accounts?.plataforma === "iptv";

  const [clientes, setClientes] = useState<Client[]>([]);
  const [cuentas, setCuentas] = useState<Account[]>([]);
  const [clienteId, setClienteId] = useState(subscription?.cliente_id || defaultClienteId || "");
  const [platformType, setPlatformType] = useState<"streaming" | "iptv">(isIptvEditing ? "iptv" : "streaming");
  const [selectedIptvUrl, setSelectedIptvUrl] = useState(subscription?.cuenta_id || "");
  const [estado, setEstado] = useState(subscription?.estado || "Activo");
  const [fechaInicio, setFechaInicio] = useState(
    subscription?.fecha_inicio || new Date().toISOString().split("T")[0]
  );
  const [fechaVencimiento, setFechaVencimiento] = useState(
    subscription?.fecha_vencimiento || ""
  );

  const [profiles, setProfiles] = useState<ProfileEntry[]>(
    isEditing
      ? [{ platform: subscription?.accounts?.plataforma || "", cuentaId: subscription?.cuenta_id || "", nombrePerfil: subscription?.nombre_perfil || "", pinPerfil: subscription?.pin_perfil || "", precio: subscription?.precio_cobrado?.toString() || "" }]
      : [{ platform: "", cuentaId: "", nombrePerfil: "", pinPerfil: "", precio: "" }]
  );

  const [state, formAction, isPending] = useActionState(
    isEditing
      ? (prev: unknown, formData: FormData) => updateSubscription(subscription!.id, prev, formData)
      : async (prev: unknown, formData: FormData) => {
          if (platformType === "iptv") {
            if (!selectedIptvUrl) return { error: "Selecciona un servidor IPTV" };
            const fd = new FormData();
            fd.set("cliente_id", clienteId);
            fd.set("cuenta_id", selectedIptvUrl);
            fd.set("nombre_perfil", profiles[0]?.nombrePerfil || "");
            fd.set("pin_perfil", profiles[0]?.pinPerfil || "");
            fd.set("fecha_inicio", fechaInicio);
            fd.set("fecha_vencimiento", fechaVencimiento);
            fd.set("precio_cobrado", profiles[0]?.precio || "");
            return createSubscription(prev, fd);
          }

          const results = await Promise.all(
            profiles.map(async (profile) => {
              const fd = new FormData();
              fd.set("cliente_id", clienteId);
              fd.set("cuenta_id", profile.cuentaId);
              fd.set("nombre_perfil", profile.nombrePerfil);
              fd.set("pin_perfil", profile.pinPerfil);
              fd.set("fecha_inicio", fechaInicio);
              fd.set("fecha_vencimiento", fechaVencimiento);
              fd.set("precio_cobrado", profile.precio);
              return createSubscription(prev, fd);
            })
          );
          const errors = results.filter((r) => r.error);
          if (errors.length > 0) {
            return { error: errors[0].error };
          }
          return { success: true };
        },
    null
  );

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      window.location.reload();
    }
  }, [state?.success, onOpenChange]);

  useEffect(() => {
    if (open) {
      loadData();
      if (!isEditing) {
        const today = new Date().toISOString().split("T")[0];
        setFechaInicio(today);
        setFechaVencimiento(addOneMonth(today));
        if (!defaultClienteId) {
          setClienteId("");
        }
        setPlatformType("streaming");
        setSelectedIptvUrl("");
        setProfiles([{ platform: "", cuentaId: "", nombrePerfil: "", pinPerfil: "", precio: "" }]);
      }
    }
  }, [open, isEditing, defaultClienteId]);

  useEffect(() => {
    if (defaultClienteId && open) {
      setClienteId(defaultClienteId);
    }
  }, [defaultClienteId, open]);

  useEffect(() => {
    if (!isEditing && clienteId && clientes.length > 0) {
      const selectedClient = clientes.find((c) => c.id === clienteId);
      if (selectedClient) {
        const autoName = selectedClient.alias || selectedClient.nombre_completo;
        setProfiles((prev) =>
          prev.map((p) => ({ ...p, nombrePerfil: autoName }))
        );
      }
    }
  }, [clienteId, clientes, isEditing]);

  useEffect(() => {
    if (fechaInicio) {
      setFechaVencimiento(addOneMonth(fechaInicio));
    }
  }, [fechaInicio]);

  const loadData = async () => {
    const [clientesData, cuentasData] = await Promise.all([
      getClients(),
      getAccounts(),
    ]);
    setClientes(clientesData);
    setCuentas(cuentasData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setClienteId(defaultClienteId || "");
      setPlatformType(isIptvEditing ? "iptv" : "streaming");
      setSelectedIptvUrl("");
      setEstado("Activo");
      const today = new Date().toISOString().split("T")[0];
      setFechaInicio(today);
      setFechaVencimiento(addOneMonth(today));
      setProfiles(isEditing
        ? [{ platform: subscription?.accounts?.plataforma || "", cuentaId: subscription?.cuenta_id || "", nombrePerfil: subscription?.nombre_perfil || "", pinPerfil: subscription?.pin_perfil || "", precio: subscription?.precio_cobrado?.toString() || "" }]
        : [{ platform: "", cuentaId: "", nombrePerfil: "", pinPerfil: "", precio: "" }]
      );
    }
    onOpenChange(newOpen);
  };

  const getAccountLabel = (account: Account) => {
    const credenciales = account.correo || account.usuario_xtream || "Sin credenciales";
    return credenciales;
  };

  const iptvAccounts = cuentas.filter((a) => a.plataforma === "iptv");
  const streamingAccounts = cuentas.filter((a) => a.plataforma !== "iptv");

  const availablePlatforms = [...new Set(streamingAccounts.map((a) => a.plataforma))].map((p) => ({
    value: p,
    label: getPlataformaByValue(p)?.label || p,
  }));

  const getAccountsForPlatform = (platform: string) =>
    platform ? streamingAccounts.filter((a) => a.plataforma === platform) : [];

  const getIptvLabel = (account: Account) => {
    return account.servidor_xtream || account.url_server || "Servidor IPTV";
  };

  const accountHasPin = (cuentaId: string): boolean => {
    const account = cuentas.find((a) => a.id === cuentaId);
    if (!account) return true;
    return hasPin(account.plataforma);
  };

  const addProfile = () => {
    setProfiles([...profiles, { platform: "", cuentaId: "", nombrePerfil: "", pinPerfil: "", precio: "" }]);
  };

  const removeProfile = (index: number) => {
    if (profiles.length > 1) {
      setProfiles(profiles.filter((_, i) => i !== index));
    }
  };

  const updateProfile = (index: number, field: keyof ProfileEntry, value: string) => {
    const updated = [...profiles];
    updated[index] = { ...updated[index], [field]: value };
    setProfiles(updated);
  };

  const canSubmit = platformType === "iptv"
    ? clienteId && (isEditing ? profiles[0]?.cuentaId : selectedIptvUrl) && profiles[0]?.nombrePerfil
    : clienteId && profiles.every((p) => p.platform && p.cuentaId && p.nombrePerfil);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover border border-border">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/30 border border-border">
              <Shield className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg font-semibold">
                {isEditing ? "Editar Suscripción" : "Nueva Suscripción"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {isEditing
                  ? "Modifica los datos de la suscripción"
                  : "Asigna perfiles de cuentas a un cliente"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
              {state.error}
            </div>
          )}

          <div className="rounded-xl p-5 space-y-4 bg-accent/30 border border-border">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Cliente y tipo</span>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm font-medium">Cliente *</Label>
              <Select
                value={clienteId}
                onValueChange={(value) => setClienteId(value ?? "")}
                disabled={isEditing || !!defaultClienteId}
                required
              >
                <SelectTrigger className="h-11 rounded-xl bg-background border-border">
                  <SelectValue placeholder="Seleccionar cliente" className="text-foreground" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-popover border-border">
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id} className="rounded-lg text-muted-foreground">
                      {cliente.nombre_completo}{cliente.alias ? ` (${cliente.alias})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="cliente_id" value={clienteId} />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Tipo de plataforma</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlatformType("streaming")}
                    className={`rounded-xl p-4 text-left transition-all duration-200 border ${
                      platformType === "streaming"
                        ? "bg-blue-500/10 border-blue-500/30 text-foreground shadow-lg shadow-blue-500/5"
                        : "bg-background border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <p className="font-medium text-sm">Streaming</p>
                    <p className="text-xs mt-1 opacity-60">Netflix, Disney+, HBO, etc.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformType("iptv")}
                    className={`rounded-xl p-4 text-left transition-all duration-200 border ${
                      platformType === "iptv"
                        ? "bg-purple-500/10 border-purple-500/30 text-foreground shadow-lg shadow-purple-500/5"
                        : "bg-background border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      <p className="font-medium text-sm">IPTV</p>
                    </div>
                    <p className="text-xs mt-1 opacity-60">Xtream Code</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {platformType === "iptv" && !isEditing ? (
            <div className="rounded-xl p-5 space-y-4 bg-purple-500/5 border border-purple-500/15">
              <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
                <Radio className="h-4 w-4" />
                <span className="text-sm font-medium">Xtream Code</span>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">URL del Servidor IPTV *</Label>
                <Select
                  value={selectedIptvUrl}
                  onValueChange={(value) => setSelectedIptvUrl(value ?? "")}
                  required
                >
                  <SelectTrigger className="h-11 rounded-xl bg-background border-border">
                    <SelectValue placeholder="Seleccionar servidor IPTV" className="text-foreground" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-popover border-border">
                    {iptvAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="rounded-lg text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium">{getIptvLabel(account)}</span>
                          {account.url_server && (
                            <span className="text-xs text-muted-foreground truncate max-w-[250px]">{account.url_server}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="cuenta_id" value={selectedIptvUrl} />
                {iptvAccounts.length === 0 && (
                  <p className="text-xs text-amber-500 dark:text-amber-400">No hay servidores IPTV guardados. Agrega uno en la sección de Cuentas.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Usuario *</Label>
                <Input
                  value={profiles[0]?.nombrePerfil || ""}
                  onChange={(e) => updateProfile(0, "nombrePerfil", e.target.value)}
                  placeholder="Usuario Xtream"
                  required
                  className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Contraseña</Label>
                <Input
                  value={profiles[0]?.pinPerfil || ""}
                  onChange={(e) => updateProfile(0, "pinPerfil", e.target.value)}
                  placeholder="Contraseña del usuario"
                  className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-purple-500/10"
                />
              </div>
            </div>
          ) : !isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                  <User className="h-4 w-4" />
                  <Label className="text-sm font-medium">Perfiles a asignar</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addProfile}
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-500/10 h-8 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar otro
                </Button>
              </div>

              {profiles.map((profile, index) => (
                <div
                  key={index}
                  className="rounded-xl p-4 space-y-3 bg-accent/20 border border-border"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Perfil {index + 1}
                    </span>
                    {profiles.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md"
                        onClick={() => removeProfile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Plataforma *</Label>
                      <Select
                        value={profile.platform}
                        onValueChange={(value) => {
                          const p = value ?? "";
                          const updated = [...profiles];
                          updated[index] = { ...updated[index], platform: p, cuentaId: "" };
                          setProfiles(updated);
                        }}
                        required
                      >
                        <SelectTrigger className="h-10 rounded-lg text-sm bg-background border-border">
                          <SelectValue placeholder="Plataforma" className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-popover border-border">
                          {availablePlatforms.map((p) => (
                            <SelectItem key={p.value} value={p.value} className="rounded-lg text-muted-foreground text-sm">
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Cuenta *</Label>
                      <Select
                        value={profile.cuentaId}
                        onValueChange={(value) => updateProfile(index, "cuentaId", value ?? "")}
                        required
                        disabled={!profile.platform}
                      >
                        <SelectTrigger className="h-10 rounded-lg text-sm bg-background border-border">
                          <SelectValue placeholder={profile.platform ? "Cuenta" : "Primero plataforma"} className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-popover border-border">
                          {getAccountsForPlatform(profile.platform).map((cuenta) => (
                            <SelectItem key={cuenta.id} value={cuenta.id} className="rounded-lg text-muted-foreground text-sm">
                              {getAccountLabel(cuenta)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Nombre del perfil *</Label>
                      <Input
                        value={profile.nombrePerfil}
                        onChange={(e) => updateProfile(index, "nombrePerfil", e.target.value)}
                        placeholder="Nombre en el perfil"
                        required
                        className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-emerald-500/30 focus:ring-emerald-500/10"
                      />
                    </div>

                    {accountHasPin(profile.cuentaId) && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">PIN (opcional)</Label>
                        <Input
                          value={profile.pinPerfil}
                          onChange={(e) => updateProfile(index, "pinPerfil", e.target.value)}
                          placeholder="PIN de restricción"
                          className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-emerald-500/30 focus:ring-emerald-500/10"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Precio ({MONEDA})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={profile.precio}
                      onChange={(e) => updateProfile(index, "precio", e.target.value)}
                      placeholder="0.00"
                      className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus:border-emerald-500/30 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : isEditing ? (
            <>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Tipo de plataforma</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlatformType("streaming")}
                    className={`rounded-xl p-4 text-left transition-all duration-200 border ${
                      platformType === "streaming"
                        ? "bg-blue-500/10 border-blue-500/30 text-foreground shadow-lg shadow-blue-500/5"
                        : "bg-background border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <p className="font-medium text-sm">Streaming</p>
                    <p className="text-xs mt-1 opacity-60">Netflix, Disney+, HBO, etc.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformType("iptv")}
                    className={`rounded-xl p-4 text-left transition-all duration-200 border ${
                      platformType === "iptv"
                        ? "bg-purple-500/10 border-purple-500/30 text-foreground shadow-lg shadow-purple-500/5"
                        : "bg-background border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      <p className="font-medium text-sm">IPTV</p>
                    </div>
                    <p className="text-xs mt-1 opacity-60">Xtream Code</p>
                  </button>
                </div>
              </div>

              {platformType === "iptv" ? (
                <div className="rounded-xl p-5 space-y-4 bg-purple-500/5 border border-purple-500/15">
                  <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
                    <Radio className="h-4 w-4" />
                    <span className="text-sm font-medium">Xtream Code</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm font-medium">URL del Servidor IPTV *</Label>
                    <Select
                      value={profiles[0]?.cuentaId || ""}
                      onValueChange={(value) => updateProfile(0, "cuentaId", value ?? "")}
                      required
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-background border-border">
                        <SelectValue placeholder="Seleccionar servidor IPTV" className="text-foreground" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-popover border-border">
                        {iptvAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id} className="rounded-lg text-muted-foreground">
                            <div className="flex flex-col">
                              <span className="font-medium">{getIptvLabel(account)}</span>
                              {account.url_server && (
                                <span className="text-xs text-muted-foreground truncate max-w-[250px]">{account.url_server}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="cuenta_id" value={profiles[0]?.cuentaId || ""} />
                    {iptvAccounts.length === 0 && (
                      <p className="text-xs text-amber-500 dark:text-amber-400">No hay servidores IPTV guardados.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm font-medium">Plataforma *</Label>
                    <Select
                      value={profiles[0]?.platform || ""}
                      onValueChange={(value) => {
                        const p = value ?? "";
                        setProfiles((prev) => prev.map((pr, i) => i === 0 ? { ...pr, platform: p, cuentaId: "" } : pr));
                      }}
                      required
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-background border-border">
                        <SelectValue placeholder="Seleccionar plataforma" className="text-foreground" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-popover border-border">
                        {availablePlatforms.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="rounded-lg text-muted-foreground">
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(profiles[0]?.platform || "") && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm font-medium">Cuenta *</Label>
                      <Select
                        value={profiles[0]?.cuentaId || ""}
                        onValueChange={(value) => updateProfile(0, "cuentaId", value ?? "")}
                        required
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-background border-border">
                          <SelectValue placeholder="Seleccionar cuenta" className="text-foreground" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-popover border-border">
                          {getAccountsForPlatform(profiles[0]?.platform || "").map((cuenta) => (
                            <SelectItem key={cuenta.id} value={cuenta.id} className="rounded-lg text-muted-foreground">
                              {getAccountLabel(cuenta)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="cuenta_id" value={profiles[0]?.cuentaId || ""} />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">{platformType === "iptv" ? "Usuario" : "Nombre del Perfil"} *</Label>
                  <Input
                    name="nombre_perfil"
                    value={profiles[0]?.nombrePerfil || ""}
                    onChange={(e) => updateProfile(0, "nombrePerfil", e.target.value)}
                    placeholder={platformType === "iptv" ? "Usuario Xtream" : "Nombre que aparece en el perfil"}
                    required
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:ring-emerald-500/10"
                  />
                </div>

                {platformType === "iptv" || accountHasPin(profiles[0]?.cuentaId || "") ? (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm font-medium">{platformType === "iptv" ? "Contraseña" : "PIN del Perfil"}</Label>
                    <Input
                      name="pin_perfil"
                      value={profiles[0]?.pinPerfil || ""}
                      onChange={(e) => updateProfile(0, "pinPerfil", e.target.value)}
                      placeholder={platformType === "iptv" ? "Contraseña del usuario" : "PIN de restricción"}
                      className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-emerald-500/30 focus:ring-emerald-500/10"
                    />
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          <div className="rounded-xl p-5 space-y-4 bg-accent/30 border border-border">
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Fechas{isEditing && " y estado"}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Fecha Inicio *</Label>
                <Input
                  name="fecha_inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-background border-border text-foreground focus:border-blue-500/30 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">Fecha Vencimiento (automática)</Label>
                <Input
                  name="fecha_vencimiento"
                  type="date"
                  value={fechaVencimiento}
                  readOnly
                  tabIndex={-1}
                  className="h-11 rounded-xl bg-muted/50 border-border text-muted-foreground cursor-not-allowed focus:border-blue-500/30 focus:ring-blue-500/10"
                />
                <p className="text-xs text-muted-foreground">Se calcula automáticamente (+1 mes)</p>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${isEditing ? "md:grid-cols-2" : ""} gap-4`}>
              {isEditing && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">Precio Cobrado ({MONEDA})</Label>
                  <Input
                    name="precio_cobrado"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={subscription?.precio_cobrado || ""}
                    placeholder="0.00"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500/30 focus:ring-blue-500/10"
                  />
                </div>
              )}

              {isEditing && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">Estado *</Label>
                  <Select
                    value={estado}
                    onValueChange={(value) => setEstado(value ?? "Activo")}
                    required
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background border-border">
                      <SelectValue className="text-foreground" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-popover border-border">
                      {ESTADOS_SUSCRIPCION.map((est) => (
                        <SelectItem key={est.value} value={est.value} className="rounded-lg text-muted-foreground">
                          {est.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="estado" value={estado} />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground h-11 px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !canSubmit}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg h-11 px-6 transition-all duration-200"
            >
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Actualizar"
                  : platformType === "iptv"
                    ? "Crear IPTV"
                    : profiles.length > 1
                      ? `Crear ${profiles.length} suscripciones`
                      : "Crear suscripción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
