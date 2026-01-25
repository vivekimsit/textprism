"use client";

import { useCallback, useState, useEffect } from "react";
import { IntentToken } from "./IntentToken";
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
import { cn } from "@/lib/utils";

interface IntentSentenceBarProps {
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  className?: string;
  /** Compact mode for embedding in composer */
  compact?: boolean;
  /** When true, show clickable tokens; when false, show plain text */
  showTokens?: boolean;
}

interface NudgeState {
  message: string;
  previousIntent: Intent;
}

export function IntentSentenceBar({
  intent,
  onIntentChange,
  className,
  compact = false,
  showTokens = true,
}: IntentSentenceBarProps) {
  const [nudgeState, setNudgeState] = useState<NudgeState | null>(null);

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

      // Apply nudge logic
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

      // Apply nudge logic
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
      onIntentChange({
        ...intent,
        tone: value as Tone,
      });
    },
    [intent, onIntentChange]
  );

  const handlePersonaChange = useCallback(
    (value: string) => {
      onIntentChange({
        ...intent,
        persona: value as Persona,
      });
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

  const audienceOptions = getAudienceOptionsForChannel(intent.channel);
  const showAudienceDropdown = audienceOptions.length > 1;

  // Get channel label and suffix for natural sentence
  const channelLabel = getChannelLabel(intent.channel);
  const channelSuffix = getChannelSuffix(intent.channel);
  const article = /^[aeiou]/i.test(channelLabel) ? "an" : "a";

  // Format audience label for natural reading (lowercase "the team" etc)
  function formatAudienceForSentence(audience: Audience | null): string {
    if (audience === null) return "someone";
    const label = getAudienceLabel(audience);
    // Make it read naturally: "the team", "my manager", etc
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

  const baseTextClass = compact
    ? "text-xs leading-relaxed"
    : "text-sm leading-relaxed";

  // Plain text version (when tokens hidden)
  if (!showTokens) {
    const audienceText = showAudienceDropdown
      ? ` to ${formatAudienceForSentence(intent.audience)}`
      : "";
    const sentenceText = `Writing ${article} ${channelLabel}${channelSuffix ? ` ${channelSuffix}` : ""}${audienceText} (${getToneLabel(intent.tone).toLowerCase()}), as ${getPersonaLabel(intent.persona)}`;

    return (
      <div className={className}>
        <p className={cn(baseTextClass, "text-muted-foreground/60")}>
          {sentenceText}
        </p>
      </div>
    );
  }

  // Interactive version with tokens (when focused)
  return (
    <div className={className}>
      {/* Natural sentence: Writing a Slack message to the team (direct), as Tech Lead */}
      <p className={cn(baseTextClass, "text-muted-foreground/80")}>
        Writing {article}{" "}
        <IntentToken
          label={channelLabel}
          value={intent.channel}
          options={CHANNEL_OPTIONS}
          onChange={handleChannelChange}
          compact={compact}
        />
        {channelSuffix ? ` ${channelSuffix}` : ""}
        {showAudienceDropdown ? (
          <>
            {" "}to{" "}
            <IntentToken
              label={formatAudienceForSentence(intent.audience)}
              value={intent.audience}
              options={audienceOptions}
              onChange={handleAudienceChange}
              isWarning={intent.audience === null}
              compact={compact}
            />
          </>
        ) : null}
        {" "}(
        <IntentToken
          label={getToneLabel(intent.tone).toLowerCase()}
          value={intent.tone}
          options={TONE_OPTIONS}
          onChange={handleToneChange}
          compact={compact}
        />
        ), as{" "}
        <IntentToken
          label={getPersonaLabel(intent.persona)}
          value={intent.persona}
          options={PERSONA_OPTIONS}
          onChange={handlePersonaChange}
          compact={compact}
        />
      </p>

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
