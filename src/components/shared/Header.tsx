"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { PushManager } from "@/components/notifications/PushManager";
import { GlobalSearch } from "./GlobalSearch";
import { useSidebar } from "./SidebarContext";

export function Header() {
  const { toggle } = useSidebar();

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border/50 glass-strong sticky top-0 z-10"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold text-foreground tracking-tight">Panel de Control</h2>
      </div>

      <div className="flex items-center gap-3">
        <GlobalSearch />
        <PushManager />
        <ModeToggle />
      </div>
    </header>
  );
}
