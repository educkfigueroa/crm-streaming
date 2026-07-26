"use client";

import { Search, X, Tv, Music, Radio, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATAFORMAS, PLATAFORMA_IPTV, getPlatformColorClasses } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Tv> = {
  Tv,
  Music,
  Radio,
  MoreHorizontal,
};

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterPlataforma: string;
  onPlataformaChange: (v: string) => void;
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
  filterPlataforma,
  onPlataformaChange,
  filterEstado,
  onEstadoChange,
}: FilterBarProps) {
  const allPlatforms = [...PLATAFORMAS, PLATAFORMA_IPTV];
  const activeCount =
    (filterPlataforma !== "all" ? 1 : 0) +
    (filterEstado !== "all" ? 1 : 0) +
    (searchQuery.length > 0 ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Search + clear */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar perfil, cliente o plataforma..."
            className={cn(
              "w-full h-9 pl-9 pr-3 rounded-xl text-sm",
              "bg-card border border-border/50 text-foreground placeholder:text-muted-foreground",
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
        {activeCount > 0 && (
          <button
            onClick={() => {
              onSearchChange("");
              onPlataformaChange("all");
              onEstadoChange("all");
            }}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-muted border border-border/50 transition-all duration-200"
          >
            <X className="h-3 w-3" />
            Limpiar
            <span className="ml-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          </button>
        )}
      </div>

      {/* Status chips */}
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
      </div>

      {/* Platform chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mr-1">
          Plataforma
        </span>
        <button
          onClick={() => onPlataformaChange("all")}
          className={cn(
            "h-7 px-3 rounded-lg text-xs font-medium border transition-all duration-200",
            filterPlataforma === "all"
              ? "bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/10"
              : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60 hover:text-foreground"
          )}
        >
          Todas
        </button>
        {allPlatforms.map((p) => {
          const isActive = filterPlataforma === p.value;
          const platformColor = getPlatformColorClasses(p.color);
          const Icon = ICONS[p.icon] ?? Tv;
          return (
            <button
              key={p.value}
              onClick={() => onPlataformaChange(isActive ? "all" : p.value)}
              className={cn(
                "h-7 px-3 rounded-lg text-xs font-medium border transition-all duration-200 inline-flex items-center gap-1.5",
                isActive
                  ? cn(platformColor.badge, "shadow-sm", platformColor.shadow)
                  : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
