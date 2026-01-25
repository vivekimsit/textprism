"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface IntentPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  className?: string;
}

export function IntentPopover({
  isOpen,
  onClose,
  anchorRef,
  children,
  className,
}: IntentPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Position the popover relative to anchor
  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const popover = popoverRef.current;
    if (!anchor || !popover) return;

    const anchorRect = anchor.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    // Calculate position below the anchor, aligned to left
    let left = anchorRect.left;
    let top = anchorRect.bottom + 4;

    // Adjust if popover goes off right edge
    if (left + popoverRect.width > window.innerWidth - 16) {
      left = window.innerWidth - popoverRect.width - 16;
    }

    // Adjust if popover goes off left edge
    if (left < 16) {
      left = 16;
    }

    // Adjust if popover goes off bottom edge
    if (top + popoverRect.height > window.innerHeight - 16) {
      // Position above the anchor instead
      top = anchorRect.top - popoverRect.height - 4;
    }

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }, [anchorRef]);

  // Update position on open and resize
  useEffect(() => {
    if (!isOpen) return;

    // Initial position update (with a small delay for DOM to settle)
    const timeoutId = setTimeout(updatePosition, 0);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const anchor = anchorRef.current;
      const popover = popoverRef.current;

      if (
        anchor &&
        !anchor.contains(target) &&
        popover &&
        !popover.contains(target)
      ) {
        onClose();
      }
    }

    // Use setTimeout to avoid immediate close from the click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, anchorRef, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const popoverContent = (
    <div
      ref={popoverRef}
      className={cn(
        "fixed z-50 min-w-[140px] max-w-[200px]",
        "bg-popover text-popover-foreground",
        "rounded-lg border shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        className,
      )}
      role="listbox"
    >
      {children}
    </div>
  );

  // Use portal to render at document body
  if (typeof document !== "undefined") {
    return createPortal(popoverContent, document.body);
  }

  return null;
}
