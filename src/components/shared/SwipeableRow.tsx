"use client";

import { useState, useRef, useCallback } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = "Eliminar",
  rightLabel = "Renovar",
}: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      currentX.current = e.touches[0].clientX;
      const diff = currentX.current - startX.current;

      if (diff < 0 && onSwipeLeft) {
        setOffset(Math.max(diff, -100));
      } else if (diff > 0 && onSwipeRight) {
        setOffset(Math.min(diff, 100));
      }
    },
    [isDragging, onSwipeLeft, onSwipeRight]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (offset < -60 && onSwipeLeft) {
      onSwipeLeft();
    } else if (offset > 60 && onSwipeRight) {
      onSwipeRight();
    }
    setOffset(0);
  }, [offset, onSwipeLeft, onSwipeRight]);

  const showLeft = offset < -10;
  const showRight = offset > 10;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        <div
          className={`flex-1 flex items-center justify-start pl-4 transition-opacity duration-200 ${
            showLeft ? "opacity-100" : "opacity-0"
          } bg-red-500/10`}
        >
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
            <Trash2 className="h-4 w-4" />
            <span className="text-xs font-medium">{leftLabel}</span>
          </div>
        </div>
        <div
          className={`flex-1 flex items-center justify-end pr-4 transition-opacity duration-200 ${
            showRight ? "opacity-100" : "opacity-0"
          } bg-emerald-500/10`}
        >
          <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
            <span className="text-xs font-medium">{rightLabel}</span>
            <RotateCcw className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="relative bg-card z-10"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
