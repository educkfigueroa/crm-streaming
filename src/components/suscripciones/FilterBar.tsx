"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterEstado: string;
  onEstadoChange: (v: string) => void;
}

const ESTADOS = [
  { value: "Activo", label: "Activas", color: "emerald" },
  { value: "Por Vencer", label: "Por Vencer", color: "amber" },
  { value: "Vencido", label: "Vencidas", color: "red" },
] as const;

const ESTADO_CLASSES: Record<string, { active: string; inactive: string }> = {
  emerald: {
    active: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10",
    inactive: "bg-emerald-500/5 text-muted-foreground border-transparent hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400",
  },
  amber: {
    active: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10",
    inactive: "bg-amber-500/5 text-muted-foreground border-transparent hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400",
  },
  red: {
    active: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 shadow-sm shadow-red-500/10",
    inactive: "bg-red-500/5 text-muted-foreground border-transparent hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400",
  },
};

export function FilterBar({
  searchQuery,
  onSearchChange,
  filterEstado,
  onEstadoChange,
}: FilterBarProps) {
  const hasActive = searchQuery.length > 0 || filterEstado !== "all";

  return (
    <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
      <div className="flex flex-col gap-2.5 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar perfil, cliente o plataforma..."
            className={cn(
              "w-full h-9 pl-9 pr-3 rounded-lg text-sm",
              "bg-background border border-border/50 text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
              "transition-all duration-200"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mr-1">
            Estado
          </span>
          {ESTADOS.map((e) => {
            const isActive = filterEstado === e.value;
            const cls = ESTADO_CLASSES[e.color];
            return (
              <button
                key={e.value}
                onClick={() => onEstadoChange(isActive ? "all" : e.value)}
                className={cn(
                  "h-7 px-3 rounded-lg text-xs font-medium border transition-all duration-200",
                  isActive ? cls.active : cls.inactive
                )}
              >
                {e.label}
              </button>
            );
          })}

          {hasActive && (
            <button
              onClick={() => {
                onSearchChange("");
                onEstadoChange("all");
              }}
              className="flex items-center gap-1 h-7 px-2.5 ml-auto rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
