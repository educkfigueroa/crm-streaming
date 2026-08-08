"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center gap-3 text-left transition-all duration-300",
          open ? "mb-5" : "mb-0"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            !open && "rotate-180"
          )}
        />
      </button>
      {open && children}
    </div>
  );
}
