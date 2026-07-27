"use client";

import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    resistance: 2.5,
  });

  const progress = Math.min(pullDistance / 80, 1);
  const rotation = pullDistance * 3;

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] overflow-y-auto overscroll-none">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
        style={{
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: progress,
          transition: isRefreshing ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 border border-border/50 shadow-lg backdrop-blur-sm">
          <RefreshCw
            className={`h-4 w-4 text-primary ${isRefreshing ? "animate-spin" : ""}`}
            style={!isRefreshing ? { transform: `rotate(${rotation}deg)` } : undefined}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {isRefreshing ? "Actualizando..." : progress >= 1 ? "Soltar para actualizar" : "Deslizar para actualizar"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
