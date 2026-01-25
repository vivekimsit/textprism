"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { IntentPopover } from "./IntentPopover";
import { OptionList, type OptionItem } from "./OptionList";

interface IntentTokenProps {
  label: string;
  value: string | null;
  options: OptionItem[];
  onChange: (value: string) => void;
  isWarning?: boolean;
  className?: string;
}

export function IntentToken({
  label,
  value,
  options,
  onChange,
  isWarning = false,
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
    [onChange],
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
        className={cn(
          // Base styles - look like inline text
          "inline-flex items-center gap-0.5",
          "text-foreground font-medium",
          "transition-all duration-150",
          // Hover: subtle underline only
          "hover:underline hover:decoration-muted-foreground/50 hover:underline-offset-2",
          // Focus: pill appearance with clear ring
          "focus:outline-none focus-visible:bg-muted/60 focus-visible:px-1.5 focus-visible:py-0.5 focus-visible:-mx-1.5 focus-visible:-my-0.5 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring",
          // Open state: pill appearance
          isOpen &&
            "bg-muted/60 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md ring-2 ring-ring/50",
          // Warning state for null/unset values
          isWarning &&
            "text-amber-600 dark:text-amber-400 underline decoration-dashed decoration-amber-400/50",
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 opacity-40 transition-transform duration-150",
            isOpen && "rotate-180 opacity-60",
          )}
        />
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
