"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportBackup } from "@/lib/actions/backup";
import { Database, Download, RefreshCcw } from "lucide-react";

export function DataSettings() {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setExported(false);

    const result = await exportBackup();

    if (!result.success || !result.data) {
      setError(result.error ?? "No se pudo exportar los datos");
      setExporting(false);
      return;
    }

    const payload = JSON.stringify(result.data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split("T")[0];
    const a = document.createElement("a");
    a.href = url;
    a.download = `crm-streaming-respaldo-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setExporting(false);
    setExported(true);
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "¿Restablecer la apariencia (paleta y modo) a los valores por defecto? Esta acción no afecta tus datos."
      )
    ) {
      return;
    }
    try {
      window.localStorage.removeItem("crm-theme");
      window.localStorage.removeItem("theme");
      window.localStorage.removeItem("crm_push_asked");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Exportar respaldo (JSON)
            </p>
            <p className="text-xs text-muted-foreground">
              Descarga una copia de tus clientes, cuentas, suscripciones y
              registros de notificación.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Generando..." : "Descargar respaldo"}
        </Button>
        {exported && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Respaldo descargado
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="border-t border-border pt-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <RefreshCcw className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Restablecer apariencia
            </p>
            <p className="text-xs text-muted-foreground">
              Vuelve la paleta de color y el modo a sus valores por defecto.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="mt-3 rounded-xl"
        >
          Restablecer
        </Button>
      </div>
    </div>
  );
}
