"use client";

import { useCallback, useState, useEffect, useRef } from "react";
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
  /** Show helper text below sentence */
  showHelper?: boolean;
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
}

function Token({
  label,
  value,
  options,
  onChange,
  isSentenceActive,
  isWarning = false,
  ariaLabel,
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

  // Show underline when sentence is active OR token is hovered/focused/open
  const showUnderline = isSentenceActive || isHovered || isFocused || isOpen;
  // Solid underline when directly interacting with this token
  const solidUnderline = isHovered || isFocused || isOpen;

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
          // Base: looks like inline text
          "transition-all duration-150 ease-out",
          // Text color
          solidUnderline
            ? "text-foreground"
            : isSentenceActive
            ? "text-foreground/90"
            : "text-foreground/80",
          // Underline: dotted when sentence active, solid when token hovered/focused/open
          showUnderline && [
            "underline underline-offset-2",
            solidUnderline
              ? "decoration-foreground/50"
              : "decoration-dotted decoration-muted-foreground/40",
          ],
          // Cursor
          "cursor-pointer",
          // Focus ring (no layout shift)
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:rounded-sm",
          // Warning state
          isWarning && "text-amber-600 dark:text-amber-400"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        {label}
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
  showHelper = false,
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

      if (nudgeResult.nudged && nudgeResult.message && nudgeResult.previousIntent) {
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

      if (nudgeResult.nudged && nudgeResult.message && nudgeResult.previousIntent) {
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
  const toneLabel = getToneLabel(intent.tone).toLowerCase();

  // Natural lowercase audience labels
  function formatAudience(audience: Audience | null): string {
    if (audience === null) return "someone";
    const label = getAudienceLabel(audience);
    const naturalForms: Record<string, string> = {
      Team: "the team",
      Manager: "my manager",
      DM: "a colleague",
      Stakeholder: "stakeholders",
      Client: "a client",
      Recruiter: "a recruiter",
      Public: "the public",
      Network: "my network",
      Community: "the community",
    };
    return naturalForms[label] || label.toLowerCase();
  }

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sentence: Writing a {channel} message to {audience} in a {tone} tone, as {role}. */}
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
        />
        {channelSuffix ? ` ${channelSuffix}` : ""}
        {showAudience ? (
          <>
            {" "}to{" "}
            <Token
              label={formatAudience(intent.audience)}
              value={intent.audience}
              options={audienceOptions}
              onChange={handleAudienceChange}
              isSentenceActive={isSentenceActive}
              isWarning={intent.audience === null}
              ariaLabel="Change audience"
            />
          </>
        ) : null}
        {" "}in a{" "}
        <Token
          label={toneLabel}
          value={intent.tone}
          options={TONE_OPTIONS}
          onChange={handleToneChange}
          isSentenceActive={isSentenceActive}
          ariaLabel="Change tone"
        />
        {" "}tone
        {personaLabel ? (
          <>
            , as{" "}
            <Token
              label={personaLabel}
              value={intent.persona}
              options={PERSONA_OPTIONS}
              onChange={handlePersonaChange}
              isSentenceActive={isSentenceActive}
              ariaLabel="Change role"
            />
          </>
        ) : null}
        .
      </p>

      {/* Helper text */}
      {showHelper ? (
        <p className="text-xs text-muted-foreground/50 mt-1">
          Paste your original text below to generate the meta prompt.
        </p>
      ) : null}

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
