"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const open = isDesktop || isOpen;

  return (
    <div className="rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <button
        onClick={() => !isDesktop && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 sm:p-6 text-left ${isDesktop ? "cursor-default" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {!isDesktop && (
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>
  );
}
