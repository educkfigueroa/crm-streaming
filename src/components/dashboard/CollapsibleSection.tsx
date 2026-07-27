"use client";

import type { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-card border border-border/50 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
