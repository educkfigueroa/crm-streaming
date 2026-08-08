"use client";

import { useEffect, useState } from "react";
import { Check, Palette as PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  THEMES,
  THEME_GROUPS,
  applyThemeVars,
  getTheme,
  loadThemeId,
  saveThemeId,
} from "@/lib/themes";
import { cn } from "@/lib/utils";

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(() => loadThemeId());

  useEffect(() => {
    applyThemeVars(document.documentElement, getTheme(loadThemeId()));
  }, []);

  const pick = (id: string) => {
    setActive(id);
    saveThemeId(id);
    applyThemeVars(document.documentElement, getTheme(id));
  };

  const groups = THEME_GROUPS.map((group) => ({
    group,
    items: THEMES.filter((t) => t.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Temas de color"
        className="h-9 w-9 rounded-xl border-border bg-accent/50 text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border transition-all duration-200"
      >
        <PaletteIcon className="h-[1.1rem] w-[1.1rem]" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Temas de color</SheetTitle>
            <SheetDescription>
              Elige la paleta del CRM. Se aplica en modo claro y oscuro al
              instante.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
            {groups.map(({ group, items }) => (
              <div key={group}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  {group}
                </p>
                <div className="space-y-2">
                  {items.map((t) => {
                    const isActive = active === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => pick(t.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          isActive
                            ? "border-accent bg-accent/40 shadow-sm"
                            : "border-border hover:bg-accent/30 hover:border-border"
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
        </SheetContent>
      </Sheet>
    </>
  );
}
