"use client";

import { useRef, useEffect, forwardRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { IntentSentence } from "./IntentSentence";
import { type Intent } from "@/lib/intent";

interface ComposerDockProps {
  value: string;
  onChange: (value: string) => void;
  threshold: number;
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  /** When true, composer is centered in viewport instead of docked at bottom */
  centered?: boolean;
  /** Cursor position to restore after layout transition */
  initialCursorPosition?: { start: number; end: number } | null;
  /** Whether meta prompt is currently being generated */
  isGenerating?: boolean;
  /** Whether meta prompt has content */
  hasContent?: boolean;
  className?: string;
}

// Helper text component
function StatusText({
  length,
  threshold,
  isGenerating,
  hasContent,
}: {
  length: number;
  threshold: number;
  isGenerating: boolean;
  hasContent: boolean;
}) {
  const remaining = threshold - length;

  // Below threshold
  if (length < threshold) {
    return <span>{remaining} chars to generate</span>;
  }

  // Generating
  if (isGenerating) {
    return <span>Generating…</span>;
  }

  // Ready (above threshold, has content, not generating)
  if (hasContent) {
    return <span>Up to date</span>;
  }

  // Fallback (shouldn't happen)
  return <span>Ready</span>;
}

export const ComposerDock = forwardRef<HTMLTextAreaElement, ComposerDockProps>(
  function ComposerDock(
    {
      value,
      onChange,
      threshold,
      intent,
      onIntentChange,
      centered = false,
      initialCursorPosition,
      isGenerating = false,
      hasContent = false,
      className,
    },
    ref
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);

    // Restore cursor position when provided (after layout transition)
    const hasRestoredRef = useRef(false);
    useEffect(() => {
      if (initialCursorPosition && !hasRestoredRef.current) {
        const textarea = textareaRef.current;
        if (textarea) {
          hasRestoredRef.current = true;
          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
              initialCursorPosition.start,
              initialCursorPosition.end
            );
          });
        }
      }
    }, [initialCursorPosition, textareaRef]);

    // Auto-grow textarea based on content
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }, [value, textareaRef]);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      onChange(e.target.value);
    }

    function handleFocus() {
      setIsTextareaFocused(true);
    }

    function handleBlur(e: React.FocusEvent) {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget?.closest("[data-intent-token]")) {
        setTimeout(() => textareaRef.current?.focus(), 0);
        return;
      }
      setIsTextareaFocused(false);
    }

    // Centered mode: for initial state before any generation
    if (centered) {
      return (
        <div className={cn("w-full max-w-2xl mx-auto px-4", className)}>
          {/* Intent sentence */}
          <IntentSentence
            intent={intent}
            onIntentChange={onIntentChange}
            isExternalActive={isTextareaFocused}
            compact
            className="mb-3"
          />

          {/* Label */}
          <label
            htmlFor="original-text"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Original text
          </label>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            id="original-text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Paste or type your message here…"
            spellCheck={false}
            autoComplete="off"
            className="min-h-[100px] text-base resize-none border bg-card shadow-sm rounded-xl p-4 placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring"
            autoFocus
          />

          {/* Status text */}
          <p className="text-xs text-muted-foreground/50 mt-2">
            <StatusText
              length={value.trim().length}
              threshold={threshold}
              isGenerating={isGenerating}
              hasContent={hasContent}
            />
          </p>
        </div>
      );
    }

    // Docked mode: sticky at bottom after generation
    return (
      <div
        className={cn(
          "sticky bottom-0 left-0 right-0 z-20",
          "bg-muted/30 border-t border-border/50",
          "backdrop-blur-sm",
          "animate-in slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        <div className="px-4 py-3 max-w-2xl mx-auto">
          {/* Intent sentence */}
          <IntentSentence
            intent={intent}
            onIntentChange={onIntentChange}
            isExternalActive={isTextareaFocused}
            compact
            className="mb-2"
          />

          {/* Label */}
          <label
            htmlFor="original-text"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Original text
          </label>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            id="original-text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Paste or type your message here…"
            spellCheck={false}
            autoComplete="off"
            className="min-h-[72px] text-base resize-none border bg-background shadow-sm rounded-xl p-3 placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring"
            autoFocus
          />

          {/* Status text */}
          <p className="text-xs text-muted-foreground/50 mt-1.5">
            <StatusText
              length={value.trim().length}
              threshold={threshold}
              isGenerating={isGenerating}
              hasContent={hasContent}
            />
          </p>
        </div>
      </div>
    );
  }
);
