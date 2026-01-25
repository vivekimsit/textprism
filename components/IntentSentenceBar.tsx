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

interface IntentSentenceBarProps {
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  className?: string;
}

interface NudgeState {
  message: string;
  previousIntent: Intent;
}

export function IntentSentenceBar({
  intent,
  onIntentChange,
  className,
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
    [intent, onIntentChange],
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
    [intent, onIntentChange],
  );

  const handleToneChange = useCallback(
    (value: string) => {
      onIntentChange({
        ...intent,
        tone: value as Tone,
      });
    },
    [intent, onIntentChange],
  );

  const handlePersonaChange = useCallback(
    (value: string) => {
      onIntentChange({
        ...intent,
        persona: value as Persona,
      });
    },
    [intent, onIntentChange],
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

  // Get article "a" or "an" based on channel
  const channelLabel = getChannelLabel(intent.channel);
  const channelSuffix = getChannelSuffix(intent.channel);
  const article = /^[aeiou]/i.test(channelLabel) ? "an" : "a";

  return (
    <div className={className}>
      {/* Sentence bar */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        Writing {article}{" "}
        <IntentToken
          label={channelLabel}
          value={intent.channel}
          options={CHANNEL_OPTIONS}
          onChange={handleChannelChange}
        />
        {channelSuffix ? ` ${channelSuffix}` : ""}
        {showAudienceDropdown ? (
          <>
            {" "}
            to{" "}
            <IntentToken
              label={getAudienceLabel(intent.audience)}
              value={intent.audience}
              options={audienceOptions}
              onChange={handleAudienceChange}
              isWarning={intent.audience === null}
            />
          </>
        ) : null}
        , tone{" "}
        <IntentToken
          label={getToneLabel(intent.tone)}
          value={intent.tone}
          options={TONE_OPTIONS}
          onChange={handleToneChange}
        />
        , as{" "}
        <IntentToken
          label={getPersonaLabel(intent.persona)}
          value={intent.persona}
          options={PERSONA_OPTIONS}
          onChange={handlePersonaChange}
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
