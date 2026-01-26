"use client";

import { useRef, useEffect, forwardRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IntentSentence } from "./IntentSentence";
import {
  type Intent,
  getAudienceLabel,
  getChannelLabel,
  getPersonaLabel,
  getToneLabel,
} from "@/lib/intent";
import type { Preset } from "@/lib/presets";

interface ComposerDockProps {
  value: string;
  onChange: (value: string) => void;
  onInputBlur?: () => void;
  onGenerate?: () => void;
  threshold: number;
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  presets: Preset[];
  onApplyPreset: (preset: Preset) => void;
  activePresetId: string | null;
  highlightTokens?: Partial<Record<"channel" | "audience" | "tone" | "persona", boolean>>;
  /** When true, composer is centered in viewport instead of docked at bottom */
  centered?: boolean;
  /** Cursor position to restore after layout transition */
  initialCursorPosition?: { start: number; end: number } | null;
  /** Whether meta prompt is currently being generated */
  isGenerating?: boolean;
  /** Whether meta prompt has content */
  hasContent?: boolean;
  showGenerateCTA?: boolean;
  className?: string;
}

export const ComposerDock = forwardRef<HTMLTextAreaElement, ComposerDockProps>(
  function ComposerDock(
    {
      value,
      onChange,
      onInputBlur,
      onGenerate,
      threshold,
      intent,
      onIntentChange,
      presets,
      onApplyPreset,
      activePresetId,
      highlightTokens,
      centered = false,
      initialCursorPosition,
      isGenerating = false,
      hasContent = false,
      showGenerateCTA = false,
      className,
    },
    ref
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);

    const trimmedLength = value.trim().length;

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
      onInputBlur?.();
    }

    const showPresetList = trimmedLength === 0;
    const showGenerateHint = trimmedLength > 0 && trimmedLength < threshold;

    function renderPresets() {
      if (hasContent || trimmedLength > 0) return null;
      return (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => textareaRef.current?.focus()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={showPresetList}
          >
            Presets
          </button>
          <div
            className={cn(
              "mt-2 overflow-hidden transition-[max-height,opacity] duration-200",
              showPresetList
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            )}
          >
            <div
              className="grid gap-2"
              role="listbox"
              tabIndex={0}
              aria-label="Presets list"
            >
              {presets.map((preset) => {
                const channelLabel = getChannelLabel(preset.context.channel);
                const audienceLabel = getAudienceLabel(preset.context.audience);
                const toneLabel = getToneLabel(preset.context.tone);
                const roleLabel = getPersonaLabel(preset.context.role);
                const tags = `${channelLabel} · ${audienceLabel} · ${toneLabel} · ${roleLabel}`;
                const isActive = preset.id === activePresetId;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset)}
                    className={cn(
                      "text-left rounded-xl border px-3 py-2 transition-colors",
                      "hover:bg-muted/40",
                      isActive
                        ? "border-border bg-muted/40"
                        : "border-transparent"
                    )}
                  >
                    <div className="text-sm font-medium text-foreground">
                      {preset.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {preset.sentence}
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 mt-1">
                      {tags}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Centered mode: for initial state before any generation
    if (centered) {
      return (
        <div className={cn("w-full max-w-2xl mx-auto px-4", className)}>
          {/* Intent sentence with helper/status */}
          <IntentSentence
            intent={intent}
            onIntentChange={onIntentChange}
            isExternalActive={isTextareaFocused}
            compact
            inputLength={trimmedLength}
            threshold={threshold}
            isGenerating={isGenerating}
            hasContent={hasContent}
            highlightTokens={highlightTokens}
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

          {showGenerateCTA ? (
            <div className="mt-3 flex flex-col gap-1.5">
              <Button
                type="button"
                onClick={onGenerate}
                disabled={trimmedLength < threshold}
                className="w-fit"
              >
                Generate meta prompt
              </Button>
              {showGenerateHint ? (
                <span className="text-xs text-muted-foreground/60">
                  Generates after {threshold} chars
                </span>
              ) : null}
            </div>
          ) : null}

          {renderPresets()}
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
        <div className="px-4 pt-3 pb-8 max-w-2xl mx-auto">
          {/* Intent sentence with helper/status */}
          <IntentSentence
            intent={intent}
            onIntentChange={onIntentChange}
            isExternalActive={isTextareaFocused}
            compact
            inputLength={trimmedLength}
            threshold={threshold}
            isGenerating={isGenerating}
            hasContent={hasContent}
            highlightTokens={highlightTokens}
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

          {renderPresets()}
        </div>
      </div>
    );
  }
);
