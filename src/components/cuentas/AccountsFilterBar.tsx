"use client";

import { Search, X, Tv, Music, Radio, MoreHorizontal } from "lucide-react";
import { PLATAFORMAS, PLATAFORMA_IPTV, getPlatformColorClasses } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Tv> = {
  Tv,
  Music,
  Radio,
  MoreHorizontal,
};

interface AccountsFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterPlataforma: string;
  onPlataformaChange: (v: string) => void;
}

export function AccountsFilterBar({
  searchQuery,
  onSearchChange,
  filterPlataforma,
  onPlataformaChange,
}: AccountsFilterBarProps) {
  const allPlatforms = [...PLATAFORMAS, PLATAFORMA_IPTV];
  const activeCount =
    (filterPlataforma !== "all" ? 1 : 0) +
    (searchQuery.length > 0 ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por correo o plataforma..."
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
