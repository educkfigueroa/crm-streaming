"use client";

import { useEffect, useRef } from "react";

interface UseSwipeSidebarOptions {
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  isOpen: boolean;
  threshold?: number;
  edgeWidth?: number;
}

export function useSwipeSidebar({
  onSwipeOpen,
  onSwipeClose,
  isOpen,
  threshold = 60,
  edgeWidth = 30,
}: UseSwipeSidebarOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isTracking = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;

      if (!isOpen && touch.clientX < edgeWidth) {
        isTracking.current = true;
      } else if (isOpen) {
        isTracking.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking.current) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - startX.current;
      const diffY = Math.abs(touch.clientY - startY.current);

      if (diffY > Math.abs(diffX)) {
        isTracking.current = false;
        return;
      }

      if (!isOpen && diffX > threshold) {
        onSwipeOpen();
        isTracking.current = false;
      } else if (isOpen && diffX < -threshold) {
        onSwipeClose();
        isTracking.current = false;
      }
    };

    const handleTouchEnd = () => {
      isTracking.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, onSwipeOpen, onSwipeClose, threshold, edgeWidth]);
}
