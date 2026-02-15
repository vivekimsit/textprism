// Intent types for the sentence bar
export type Channel = "slack" | "email" | "linkedin" | "reddit" | "quora";
export type Audience =
  | "team"
  | "manager"
  | "dm"
  | "stakeholder"
  | "client"
  | "recruiter"
  | "public"
  | "network"
  | "community";
export type Tone = "direct" | "warm" | "casual" | "formal" | "persuasive";
export type Persona =
  | "tech_lead"
  | "senior_engineer"
  | "junior_engineer"
  | "engineering_manager"
  | "product_manager"
  | "designer"
  | "founder"
  | "freelancer";

/** Persona can be a preset or a custom string (e.g. "Data Scientist") */
export type PersonaOrCustom = Persona | (string & {});

export interface Intent {
  channel: Channel;
  audience: Audience | null;
  tone: Tone;
  persona: PersonaOrCustom;
}

export const DEFAULT_INTENT: Intent = {
  channel: "slack",
  audience: "team",
  tone: "direct",
  persona: "tech_lead",
};

// Option configurations
export interface Option<T extends string> {
  value: T;
  label: string;
}

export interface ChannelOption extends Option<Channel> {
  suffix?: string; // Optional suffix for sentence bar (e.g., "message", "post")
}

export const CHANNEL_OPTIONS: ChannelOption[] = [
  { value: "slack", label: "Slack", suffix: "message" }, // "a Slack message"
  { value: "email", label: "email" }, // "an email" (no suffix needed)
  { value: "linkedin", label: "LinkedIn", suffix: "post" }, // "a LinkedIn post"
  { value: "reddit", label: "Reddit", suffix: "post" }, // "a Reddit post"
  { value: "quora", label: "Quora", suffix: "answer" }, // "a Quora answer"
];

// Audience options vary by channel
export const AUDIENCE_OPTIONS_BY_CHANNEL: Record<Channel, Option<Audience>[]> =
  {
    slack: [
      { value: "dm", label: "DM" },
      { value: "team", label: "Team" },
      { value: "manager", label: "Manager" },
      { value: "stakeholder", label: "Stakeholder" },
    ],
    email: [
      { value: "manager", label: "Manager" },
      { value: "client", label: "Client" },
      { value: "stakeholder", label: "Stakeholder" },
      { value: "recruiter", label: "Recruiter" },
    ],
    linkedin: [
      { value: "public", label: "Public" },
      { value: "network", label: "Network" },
    ],
    reddit: [{ value: "community", label: "Community" }],
    quora: [{ value: "public", label: "Public" }],
  };

export const TONE_OPTIONS: Option<Tone>[] = [
  { value: "direct", label: "Direct" },
  { value: "warm", label: "Warm" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "persuasive", label: "Persuasive" },
];

export const PERSONA_OPTIONS: Option<Persona>[] = [
  { value: "tech_lead", label: "Tech Lead" },
  { value: "senior_engineer", label: "Senior Engineer" },
  { value: "junior_engineer", label: "Junior Engineer" },
  { value: "engineering_manager", label: "Engineering Manager" },
  { value: "product_manager", label: "Product Manager" },
  { value: "designer", label: "Designer" },
  { value: "founder", label: "Founder" },
  { value: "freelancer", label: "Freelancer" },
];

// Label getters
export function getChannelLabel(channel: Channel): string {
  return CHANNEL_OPTIONS.find((o) => o.value === channel)?.label ?? channel;
}

export function getChannelSuffix(channel: Channel): string | undefined {
  return CHANNEL_OPTIONS.find((o) => o.value === channel)?.suffix;
}

export function getChannelPhrase(channel: Channel): string {
  const label = getChannelLabel(channel);
  const suffix = getChannelSuffix(channel);
  return suffix ? `${label} ${suffix}` : label;
}

export function getAudienceLabel(audience: Audience | null): string {
  if (audience === null) return "select audience";
  for (const options of Object.values(AUDIENCE_OPTIONS_BY_CHANNEL)) {
    const found = options.find((o) => o.value === audience);
    if (found) return found.label;
  }
  return audience;
}

export function getToneLabel(tone: Tone): string {
  return TONE_OPTIONS.find((o) => o.value === tone)?.label ?? tone;
}

export function getPersonaLabel(persona: PersonaOrCustom): string {
  return PERSONA_OPTIONS.find((o) => o.value === persona)?.label ?? persona;
}

// Default audience per channel
export function getDefaultAudience(channel: Channel): Audience {
  const defaults: Record<Channel, Audience> = {
    slack: "team",
    email: "manager",
    linkedin: "public",
    reddit: "community",
    quora: "public",
  };
  return defaults[channel];
}

// Nudge logic result
export interface NudgeResult {
  intent: Intent;
  nudged: boolean;
  message: string | null;
  previousIntent: Intent | null;
}

/**
 * Nudge logic: Automatically adjust tone for certain audience combinations.
 *
 * Rules:
 * - If audience is 'recruiter' or 'client' and tone is 'direct', auto-set tone to 'warm'
 *   and return a nudge message.
 */
export function applyNudge(
  newIntent: Intent,
  previousIntent: Intent,
): NudgeResult {
  const sensitiveAudiences: Audience[] = ["recruiter", "client"];

  // Check if tone adjustment is needed
  if (
    newIntent.audience !== null &&
    sensitiveAudiences.includes(newIntent.audience) &&
    newIntent.tone === "direct"
  ) {
    const adjustedIntent: Intent = {
      ...newIntent,
      tone: "warm",
    };

    return {
      intent: adjustedIntent,
      nudged: true,
      message: `Tone adjusted to Warm for ${getAudienceLabel(newIntent.audience)}`,
      previousIntent: previousIntent,
    };
  }

  return {
    intent: newIntent,
    nudged: false,
    message: null,
    previousIntent: null,
  };
}

/**
 * Check if audience is valid for the given channel
 */
export function isAudienceValidForChannel(
  audience: Audience | null,
  channel: Channel,
): boolean {
  if (audience === null) return true;
  const validAudiences = AUDIENCE_OPTIONS_BY_CHANNEL[channel];
  return validAudiences.some((o) => o.value === audience);
}

/**
 * Get audience options for a channel
 */
export function getAudienceOptionsForChannel(
  channel: Channel,
): Option<Audience>[] {
  return AUDIENCE_OPTIONS_BY_CHANNEL[channel];
}
