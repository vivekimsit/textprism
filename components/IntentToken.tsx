"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { IntentPopover } from "./IntentPopover";
import { OptionList, type OptionItem } from "./OptionList";

interface IntentTokenProps {
  label: string;
  value: string | null;
  options: OptionItem[];
  onChange: (value: string) => void;
  isWarning?: boolean;
  /** Compact mode for smaller text contexts */
  compact?: boolean;
  className?: string;
}

export function IntentToken({
  label,
  value,
  options,
  onChange,
  isWarning = false,
  compact = false,
  className,
}: IntentTokenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
      setIsOpen(false);
      // Return focus to trigger
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        data-intent-token
        className={cn(
          // Base styles - look like plain text, no bold
          "inline-flex items-center",
          "text-foreground",
          "transition-all duration-150",
          "rounded",
          // Hover: subtle chip appearance
          "hover:bg-muted/50 hover:px-1 hover:-mx-1",
          // Focus: chip with ring
          "focus:outline-none focus-visible:bg-muted/60 focus-visible:px-1 focus-visible:-mx-1 focus-visible:ring-1 focus-visible:ring-ring/50",
          // Open state: chip appearance
          isOpen && "bg-muted/60 px-1 -mx-1 ring-1 ring-ring/50",
          // Warning state for null/unset values
          isWarning &&
            "text-amber-600 dark:text-amber-400 underline decoration-dashed decoration-amber-400/50",
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{label}</span>
      </button>

      <IntentPopover
        isOpen={isOpen}
        onClose={handleClose}
        anchorRef={triggerRef}
      >
        <OptionList
          options={options}
          value={value}
          onSelect={handleSelect}
          onClose={handleClose}
          showSearch={options.length > 5}
        />
      </IntentPopover>
    </>
  );
}
