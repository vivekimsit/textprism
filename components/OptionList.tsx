"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface OptionItem {
  value: string;
  label: string;
}

interface OptionListProps {
  options: OptionItem[];
  value: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  showSearch?: boolean;
  className?: string;
}

export function OptionList({
  options,
  value,
  onSelect,
  onClose,
  showSearch = true,
  className,
}: OptionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Reset highlight when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Focus search input on mount
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // Scroll highlighted item into view
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const highlightedElement = listElement.querySelector(
      `[data-index="${highlightedIndex}"]`,
    );
    if (highlightedElement) {
      highlightedElement.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            onSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "Tab":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredOptions, highlightedIndex, onSelect, onClose],
  );

  return (
    <div
      className={cn("flex flex-col max-h-[240px]", className)}
      onKeyDown={handleKeyDown}
    >
      {showSearch && options.length > 5 ? (
        <div className="p-2 border-b border-border/50">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-2 py-1.5 text-sm bg-transparent border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
          />
        </div>
      ) : null}
      <div ref={listRef} className="overflow-y-auto py-1">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No results found
          </div>
        ) : (
          filteredOptions.map((option, index) => (
            <button
              key={option.value}
              data-index={index}
              onClick={() => onSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "w-full px-3 py-1.5 text-left text-sm transition-colors",
                "focus:outline-none",
                index === highlightedIndex && "bg-muted",
                option.value === value && "font-medium text-foreground",
                option.value !== value && "text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
