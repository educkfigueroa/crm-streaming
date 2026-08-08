"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { globalSearch } from "@/lib/actions/search";
import { getPlataformaByValue } from "@/lib/constants";
import type { GlobalSearchResult } from "@/types";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult>({ clients: [], subscriptions: [] });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ clients: [], subscriptions: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await globalSearch(q);
    setResults(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      const isShortcut = e.key === "/" || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey));
      if (!typing && isShortcut) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setResults({ clients: [], subscriptions: [] });
    }
  };

  const goTo = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  const empty =
    query.trim().length > 0 &&
    !loading &&
    results.clients.length === 0 &&
    results.subscriptions.length === 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Buscar (/)"
        className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar clientes o suscripciones..."
              className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
            />
          </div>

          <div className="max-h-72 overflow-y-auto -mx-1 px-1">
            {loading && (
              <div className="flex items-center gap-2 py-4 justify-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            )}

            {!loading && !query.trim() && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Escribe para buscar por nombre, alias o plataforma
              </p>
            )}

            {empty && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Sin resultados para &ldquo;{query.trim()}&rdquo;
              </p>
            )}

            {!loading && results.clients.length > 0 && (
              <div className="mb-2">
                <p className="px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Clientes
                </p>
                <div className="space-y-0.5">
                  {results.clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => goTo(`/suscripciones?cliente=${client.id}`)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shrink-0">
                        <Users className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-medium truncate">{client.nombre_completo}</span>
                      {client.alias && (
                        <span className="text-xs text-muted-foreground truncate">({client.alias})</span>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground shrink-0">Ver suscripciones</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.subscriptions.length > 0 && (
              <div>
                <p className="px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Suscripciones
                </p>
                <div className="space-y-0.5">
                  {results.subscriptions.map((sub) => {
                    const plataforma = sub.accounts?.plataforma
                      ? getPlataformaByValue(sub.accounts.plataforma)?.label ?? sub.accounts.plataforma
                      : null;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => goTo(`/suscripciones?cliente=${sub.cliente_id}`)}
                        className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-500 dark:text-blue-400 shrink-0">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-medium truncate">{sub.nombre_perfil}</span>
                        {plataforma && (
                          <span className="text-xs text-muted-foreground truncate">{plataforma}</span>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                          {sub.clients?.nombre_completo ?? "Sin cliente"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
