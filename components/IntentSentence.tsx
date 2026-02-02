"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntentPopover } from "./IntentPopover";
import { OptionList, type OptionItem } from "./OptionList";
import { InlineToast } from "./InlineToast";
import {
  type Intent,
  type Channel,
  type Audience,
  type Tone,
  type Persona,
  CHANNEL_OPTIONS,
  TONE_OPTIONS,
  PERSONA_OPTIONS,
  getChannelLabel,
  getChannelSuffix,
  getAudienceLabel,
  getToneLabel,
  getPersonaLabel,
  getAudienceOptionsForChannel,
  getDefaultAudience,
  isAudienceValidForChannel,
  applyNudge,
} from "@/lib/intent";

interface IntentSentenceProps {
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  /** External active state (e.g., textarea focused) */
  isExternalActive?: boolean;
  /** Compact text size */
  compact?: boolean;
  /** Input length for helper text */
  inputLength?: number;
  /** Character threshold for generation */
  threshold?: number;
  /** Whether currently generating */
  isGenerating?: boolean;
  /** Whether meta prompt has content */
  hasContent?: boolean;
  /** Tokens to highlight briefly (e.g., after preset apply) */
  highlightTokens?: Partial<
    Record<"channel" | "audience" | "tone" | "persona", boolean>
  >;
  className?: string;
}

interface NudgeState {
  message: string;
  previousIntent: Intent;
}

interface TokenProps {
  label: string;
  value: string | null;
  options: OptionItem[];
  onChange: (value: string) => void;
  /** Sentence row is active (hovered or textarea focused) */
  isSentenceActive: boolean;
  isWarning?: boolean;
  ariaLabel: string;
  highlight?: boolean;
}

function Token({
  label,
  value,
  options,
  onChange,
  isSentenceActive,
  isWarning = false,
  ariaLabel,
  highlight = false,
}: TokenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleSelect(selectedValue: string) {
    onChange(selectedValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  }

  function handleClose() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  // Token is "active" when directly interacting
  const isTokenActive = isHovered || isFocused || isOpen;
  // Show chevron only when this specific token is active
  const showChevron = isTokenActive;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-intent-token
        className={cn(
          // Base: inline token with dashed underline
          "inline-flex items-center gap-0.5",
          "transition-all duration-150 ease-out",
          "cursor-pointer",
          // Border-bottom style (dashed by default, solid on hover)
          "border-b",
          isTokenActive
            ? "border-foreground/40 border-solid"
            : isSentenceActive
            ? "border-muted-foreground/40 border-dashed"
            : "border-transparent",
          // Text color
          isTokenActive
            ? "text-foreground"
            : isSentenceActive
            ? "text-foreground/85"
            : "text-foreground/70",
          // Subtle background on hover
          isTokenActive && "bg-muted/50 -mx-1 px-1 rounded",
          // Focus ring
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:rounded-sm",
          // Warning state
          isWarning && "text-amber-600 dark:text-amber-400 border-amber-400/50",
          // One-time preset highlight
          highlight && "preset-pulse"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span>{label}</span>
        {/* Chevron - only visible on hover/focus/open */}
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 transition-all duration-150",
            showChevron ? "opacity-60 w-3" : "opacity-0 w-0",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
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

export function IntentSentence({
  intent,
  onIntentChange,
  isExternalActive = false,
  compact = false,
  inputLength = 0,
  threshold = 20,
  isGenerating = false,
  hasContent = false,
  highlightTokens,
  className,
}: IntentSentenceProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [nudgeState, setNudgeState] = useState<NudgeState | null>(null);

  // Active when hovered OR external trigger (textarea focused)
  const isSentenceActive = isHovered || isExternalActive;

  // When channel changes, update audience if needed
  useEffect(() => {
    if (!isAudienceValidForChannel(intent.audience, intent.channel)) {
      onIntentChange({
        ...intent,
        audience: getDefaultAudience(intent.channel),
      });
    }
  }, [intent.channel]);

  const handleChannelChange = useCallback(
    (value: string) => {
      const newChannel = value as Channel;
      const newAudience = isAudienceValidForChannel(intent.audience, newChannel)
        ? intent.audience
        : getDefaultAudience(newChannel);

      const newIntent: Intent = {
        ...intent,
        channel: newChannel,
        audience: newAudience,
      };

      const nudgeResult = applyNudge(newIntent, intent);
      onIntentChange(nudgeResult.intent);

      if (
        nudgeResult.nudged &&
        nudgeResult.message &&
        nudgeResult.previousIntent
      ) {
        setNudgeState({
          message: nudgeResult.message,
          previousIntent: nudgeResult.previousIntent,
        });
      }
    },
    [intent, onIntentChange]
  );

  const handleAudienceChange = useCallback(
    (value: string) => {
      const newIntent: Intent = {
        ...intent,
        audience: value as Audience,
      };

      const nudgeResult = applyNudge(newIntent, intent);
      onIntentChange(nudgeResult.intent);

      if (
        nudgeResult.nudged &&
        nudgeResult.message &&
        nudgeResult.previousIntent
      ) {
        setNudgeState({
          message: nudgeResult.message,
          previousIntent: nudgeResult.previousIntent,
        });
      }
    },
    [intent, onIntentChange]
  );

  const handleToneChange = useCallback(
    (value: string) => {
      onIntentChange({ ...intent, tone: value as Tone });
    },
    [intent, onIntentChange]
  );

  const handlePersonaChange = useCallback(
    (value: string) => {
      onIntentChange({ ...intent, persona: value as Persona });
    },
    [intent, onIntentChange]
  );

  const handleUndo = useCallback(() => {
    if (nudgeState?.previousIntent) {
      onIntentChange(nudgeState.previousIntent);
    }
    setNudgeState(null);
  }, [nudgeState, onIntentChange]);

  const handleDismissNudge = useCallback(() => {
    setNudgeState(null);
  }, []);

  // Derived values
  const audienceOptions = getAudienceOptionsForChannel(intent.channel);
  const showAudience = audienceOptions.length > 1;
  const channelLabel = getChannelLabel(intent.channel);
  const channelSuffix = getChannelSuffix(intent.channel);
  const article = /^[aeiou]/i.test(channelLabel) ? "an" : "a";
  const personaLabel = getPersonaLabel(intent.persona);
  const toneLabel = getToneLabel(intent.tone);
  const audienceLabel = getAudienceLabel(intent.audience);

  // Status logic
  const isAboveThreshold = inputLength >= threshold;

  // Status text for right side of sentence row
  function renderStatus() {
    if (!isAboveThreshold) return null;
    if (isGenerating) {
      return (
        <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 bg-muted-foreground/50 rounded-full animate-pulse" />
            <span className="w-1 h-1 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-1 h-1 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:300ms]" />
          </span>
          Updating…
        </span>
      );
    }
    if (hasContent) {
      return (
        <span className="text-xs text-muted-foreground/50">Up to date</span>
      );
    }
    return null;
  }

  // Helper text logic
  function renderHelper() {
    if (isAboveThreshold) return null;
    if (inputLength === 0) {
      return (
        <p className="text-xs text-muted-foreground/50 mt-1.5">
          Paste your original text below to generate the meta prompt.
        </p>
      );
    }
    return (
      <p className="text-xs text-muted-foreground/50 mt-1.5">
        Generates after {threshold} chars.
      </p>
    );
  }

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sentence row with status on right */}
      <div className="flex items-baseline justify-between gap-4">
        {/* Sentence: Writing a {channel} {suffix} to {audience} — tone: {tone} — as {role}. */}
        <p
          className={cn(
            "leading-relaxed",
            compact ? "text-xs" : "text-sm",
            "text-muted-foreground"
          )}
        >
          Writing {article}{" "}
          <Token
            label={channelLabel}
            value={intent.channel}
            options={CHANNEL_OPTIONS}
            onChange={handleChannelChange}
            isSentenceActive={isSentenceActive}
            ariaLabel="Change channel"
            highlight={Boolean(highlightTokens?.channel)}
          />
          {channelSuffix ? ` ${channelSuffix}` : ""}
          {showAudience ? (
            <>
              {" "}
              to{" "}
              <Token
                label={audienceLabel}
                value={intent.audience}
                options={audienceOptions}
                onChange={handleAudienceChange}
                isSentenceActive={isSentenceActive}
                isWarning={intent.audience === null}
                ariaLabel="Change audience"
                highlight={Boolean(highlightTokens?.audience)}
              />
            </>
          ) : null}{" "}
          — tone:{" "}
          <Token
            label={toneLabel}
            value={intent.tone}
            options={TONE_OPTIONS}
            onChange={handleToneChange}
            isSentenceActive={isSentenceActive}
            ariaLabel="Change tone"
            highlight={Boolean(highlightTokens?.tone)}
          />{" "}
          — as{" "}
          <Token
            label={personaLabel}
            value={intent.persona}
            options={PERSONA_OPTIONS}
            onChange={handlePersonaChange}
            isSentenceActive={isSentenceActive}
            ariaLabel="Change role"
            highlight={Boolean(highlightTokens?.persona)}
          />
          .
        </p>

        {/* Status on right side */}
        {renderStatus()}
      </div>

      {/* Helper text below sentence */}
      {renderHelper()}

      {/* Nudge toast */}
      {nudgeState ? (
        <div className="mt-2">
          <InlineToast
            message={nudgeState.message}
            onUndo={handleUndo}
            onDismiss={handleDismissNudge}
          />
        </div>
      ) : null}
    </div>
  );
}
