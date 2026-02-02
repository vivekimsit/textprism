import type { Platform } from "./generate-prompt";

export interface ChannelRule {
  id: string;
  label: string; // Short label for chip
  promptText: string; // Text added to prompt when enabled
  defaultEnabled: boolean;
}

export const CHANNEL_RULES: Record<Platform, ChannelRule[]> = {
  slack: [
    {
      id: "markdown",
      label: "Markdown",
      promptText: "Use markdown formatting",
      defaultEnabled: true,
    },
    {
      id: "bullets",
      label: "Bullet lists",
      promptText: "Use bullets for lists",
      defaultEnabled: true,
    },
    {
      id: "scannable",
      label: "Keep scannable",
      promptText: "Keep it scannable and concise",
      defaultEnabled: true,
    },
    {
      id: "emoji",
      label: "Use emoji",
      promptText: "Use emoji sparingly for tone",
      defaultEnabled: false,
    },
    {
      id: "thread",
      label: "Thread hint",
      promptText: "Suggest threading for long discussions",
      defaultEnabled: false,
    },
  ],
  email: [
    {
      id: "subject",
      label: "Clear subject",
      promptText: "Include a clear subject line",
      defaultEnabled: true,
    },
    {
      id: "structure",
      label: "Professional structure",
      promptText: "Use professional structure with clear paragraphs",
      defaultEnabled: true,
    },
    {
      id: "greeting",
      label: "Greeting & sign-off",
      promptText: "Include appropriate greeting and sign-off",
      defaultEnabled: false,
    },
    {
      id: "concise",
      label: "Keep concise",
      promptText: "Keep under 200 words when possible",
      defaultEnabled: false,
    },
    {
      id: "formal",
      label: "Formal salutation",
      promptText: "Use formal salutation (Dear, Regards)",
      defaultEnabled: false,
    },
  ],
  linkedin: [
    {
      id: "hook",
      label: "Hook first line",
      promptText: "Start with a compelling hook in the first line",
      defaultEnabled: true,
    },
    {
      id: "whitespace",
      label: "Whitespace",
      promptText: "Use whitespace between paragraphs for readability",
      defaultEnabled: true,
    },
    {
      id: "cta",
      label: "End with CTA",
      promptText: "End with a question or call-to-action",
      defaultEnabled: true,
    },
    {
      id: "hashtags",
      label: "Hashtags",
      promptText: "Include 3-5 relevant hashtags at the end",
      defaultEnabled: false,
    },
    {
      id: "charlimit",
      label: "Under 1300 chars",
      promptText: "Keep under 1300 characters for better engagement",
      defaultEnabled: false,
    },
  ],
  reddit: [
    {
      id: "casual",
      label: "Casual tone",
      promptText: "Use casual, conversational tone",
      defaultEnabled: true,
    },
    {
      id: "lowercase",
      label: "Lowercase OK",
      promptText: "Lowercase is acceptable, avoid overly formal language",
      defaultEnabled: true,
    },
    {
      id: "noemoji",
      label: "No emojis",
      promptText: "Avoid emojis, they come across as inauthentic",
      defaultEnabled: true,
    },
    {
      id: "human",
      label: "Sound human",
      promptText: "Sound like a real person, not marketing copy",
      defaultEnabled: true,
    },
    {
      id: "tldr",
      label: "Add TL;DR",
      promptText: "Add a TL;DR summary for longer posts",
      defaultEnabled: false,
    },
  ],
  quora: [
    {
      id: "structured",
      label: "Structured",
      promptText: "Provide a structured, well-organized answer",
      defaultEnabled: true,
    },
    {
      id: "experience",
      label: "Personal experience",
      promptText: "Share personal experience when relevant",
      defaultEnabled: true,
    },
    {
      id: "comprehensive",
      label: "Comprehensive",
      promptText: "Be comprehensive and thorough in the answer",
      defaultEnabled: true,
    },
    {
      id: "headers",
      label: "Use headers",
      promptText: "Use headers to organize longer answers",
      defaultEnabled: false,
    },
    {
      id: "sources",
      label: "Cite sources",
      promptText: "Include sources or references when relevant",
      defaultEnabled: false,
    },
  ],
};

/**
 * Get default enabled rule IDs for a channel
 */
export function getDefaultEnabledRules(channel: Platform): string[] {
  return CHANNEL_RULES[channel]
    .filter((rule) => rule.defaultEnabled)
    .map((rule) => rule.id);
}

/**
 * Build the channel rules text from enabled rule IDs
 */
export function buildChannelRulesText(
  channel: Platform,
  enabledRuleIds: string[]
): string {
  const rules = CHANNEL_RULES[channel];
  const enabledRules = enabledRuleIds
    .map((id) => rules.find((r) => r.id === id))
    .filter((rule): rule is ChannelRule => rule !== undefined);

  if (enabledRules.length === 0) {
    return "";
  }

  return enabledRules.map((rule) => rule.promptText).join(", ");
}
