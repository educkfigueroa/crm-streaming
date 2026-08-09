"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import {
  THEMES,
  THEME_GROUPS,
  applyThemeVars,
  getTheme,
  loadThemeId,
  saveThemeId,
} from "@/lib/themes";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
] as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [paletteId, setPaletteId] = useState<string>(() =>
    typeof window === "undefined" ? "esmeralda" : loadThemeId()
  );

  useEffect(() => {
    applyThemeVars(document.documentElement, getTheme(loadThemeId()));
  }, []);

  const pickPalette = (id: string) => {
    setPaletteId(id);
    saveThemeId(id);
    applyThemeVars(document.documentElement, getTheme(id));
  };

  const groups = THEME_GROUPS.map((group) => ({
    group,
    items: THEMES.filter((t) => t.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Modo de apariencia</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Controla si la interfaz usa el modo claro u oscuro.
        </p>
        <div className="mt-3 inline-flex rounded-xl border border-border bg-muted p-1">
          {MODES.map((m) => {
            const isActive = theme === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setTheme(m.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Paleta de color</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Elige el color principal del CRM. Se guarda en este dispositivo.
        </p>

        <div className="mt-4 space-y-6">
          {groups.map(({ group, items }) => (
            <div key={group}>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                {group}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((t) => {
                  const isActive = paletteId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => pickPalette(t.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        isActive
                          ? "border-accent bg-accent/40 shadow-sm"
                          : "border-border hover:bg-accent/30"
                      )}
                    >
                      <span
                        className="h-9 w-9 shrink-0 rounded-lg border border-border/50"
                        style={{
                          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {t.name}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {t.accent} · {t.accent2}
                        </span>
                      </span>
                      {isActive && (
                        <Check className="h-4 w-4 shrink-0 text-accent-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
