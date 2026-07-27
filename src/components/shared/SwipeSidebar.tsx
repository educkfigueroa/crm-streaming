"use client";

import { useCallback } from "react";
import { useSwipeSidebar } from "@/hooks/useSwipeSidebar";
import { useSidebar } from "./SidebarContext";

export function SwipeSidebar({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();

  const handleSwipeOpen = useCallback(() => setOpen(true), [setOpen]);
  const handleSwipeClose = useCallback(() => setOpen(false), [setOpen]);

  useSwipeSidebar({
    onSwipeOpen: handleSwipeOpen,
    onSwipeClose: handleSwipeClose,
    isOpen: open,
    threshold: 60,
    edgeWidth: 30,
  });

  return <>{children}</>;
}
