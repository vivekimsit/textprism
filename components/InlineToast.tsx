"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface InlineToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
  className?: string;
}

export function InlineToast({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
  className,
}: InlineToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  function handleDismiss() {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 150);
  }

  function handleUndo() {
    onUndo();
    handleDismiss();
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
        "bg-muted/60 text-muted-foreground border border-border/50",
        "transition-all duration-150",
        isExiting && "opacity-0 scale-95",
        !isExiting && "animate-in fade-in slide-in-from-top-1 duration-200",
        className,
      )}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={handleUndo}
        className="font-medium text-foreground hover:underline focus:outline-none focus:underline"
      >
        Undo
      </button>
      <button
        onClick={handleDismiss}
        className="ml-1 p-0.5 rounded hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
