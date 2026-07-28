"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

function usePullToRefresh({ onRefresh, threshold = 80, resistance = 2.5 }: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isMobile) return;
      const el = containerRef.current;
      if (!el || el.scrollTop > 0 || isRefreshing) return;
      startY.current = e.touches[0].clientY;
    },
    [isMobile, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isMobile || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff / resistance, threshold * 1.5));
      }
    },
    [isMobile, isRefreshing, resistance, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile) return;
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isMobile, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile) return;

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isMobile]);

  return { containerRef, pullDistance, isRefreshing, isMobile };
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { containerRef, pullDistance, isRefreshing, isMobile } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    resistance: 2.5,
  });

  if (!isMobile) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / 80, 1);
  const rotation = pullDistance * 3;

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] overflow-y-auto overscroll-none">
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
