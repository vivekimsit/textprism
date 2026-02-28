import type { Platform } from "./generate-prompt";

export interface ChannelRule {
  id: string;
  label: string; // Short label for chip
  icon: string; // Lucide icon name
  promptText: string; // Text added to prompt when enabled
  offPromptText: string; // Text added to prompt when disabled
  defaultEnabled: boolean;
}

export const CHANNEL_RULES: Record<Platform, ChannelRule[]> = {
  slack: [
    {
      id: "markdown",
      label: "Markdown",
      icon: "Code",
      promptText: "Use markdown formatting",
      offPromptText: "Do not use markdown formatting, use plain text",
      defaultEnabled: true,
    },
    {
      id: "bullets",
      label: "Bullet lists",
      icon: "List",
      promptText: "Use bullets for lists",
      offPromptText: "Do not use bullet points or lists",
      defaultEnabled: true,
    },
    {
      id: "scannable",
      label: "Keep scannable",
      icon: "Eye",
      promptText: "Keep it scannable and concise",
      offPromptText: "No length or scannability constraints",
      defaultEnabled: true,
    },
    {
      id: "emoji",
      label: "Use emoji",
      icon: "Smile",
      promptText: "Use emoji sparingly for tone",
      offPromptText: "Do not use emojis",
      defaultEnabled: false,
    },
    {
      id: "thread",
      label: "Thread hint",
      icon: "MessageSquare",
      promptText: "Suggest threading for long discussions",
      offPromptText: "Do not suggest threading",
      defaultEnabled: false,
    },
  ],
  email: [
    {
      id: "subject",
      label: "Clear subject",
      icon: "Mail",
      promptText: "Include a clear subject line",
      offPromptText: "Subject line is optional",
      defaultEnabled: true,
    },
    {
      id: "structure",
      label: "Professional structure",
      icon: "LayoutList",
      promptText: "Use professional structure with clear paragraphs",
      offPromptText: "No formal structure required",
      defaultEnabled: true,
    },
    {
      id: "greeting",
      label: "Greeting & sign-off",
      icon: "HandMetal",
      promptText: "Include appropriate greeting and sign-off",
      offPromptText: "Omit greeting and sign-off",
      defaultEnabled: false,
    },
    {
      id: "concise",
      label: "Keep concise",
      icon: "Minimize2",
      promptText: "Keep under 200 words when possible",
      offPromptText: "No word limit",
      defaultEnabled: false,
    },
    {
      id: "formal",
      label: "Formal salutation",
      icon: "Briefcase",
      promptText: "Use formal salutation (Dear, Regards)",
      offPromptText: "Informal salutation is fine",
      defaultEnabled: false,
    },
  ],
  linkedin: [
    {
      id: "hook",
      label: "Hook first line",
      icon: "Sparkles",
      promptText: "Start with a compelling hook in the first line",
      offPromptText: "No hook needed in first line",
      defaultEnabled: true,
    },
    {
      id: "whitespace",
      label: "Whitespace",
      icon: "AlignJustify",
      promptText: "Use whitespace between paragraphs for readability",
      offPromptText: "No whitespace formatting constraints",
      defaultEnabled: true,
    },
    {
      id: "cta",
      label: "End with CTA",
      icon: "MousePointerClick",
      promptText: "End with a question or call-to-action",
      offPromptText: "Do not end with a call-to-action or question",
      defaultEnabled: true,
    },
    {
      id: "hashtags",
      label: "Hashtags",
      icon: "Hash",
      promptText: "Include 3-5 relevant hashtags at the end",
      offPromptText: "Do not include hashtags",
      defaultEnabled: false,
    },
    {
      id: "charlimit",
      label: "Under 1300 chars",
      icon: "Ruler",
      promptText: "Keep under 1300 characters for better engagement",
      offPromptText: "No character limit",
      defaultEnabled: false,
    },
  ],
  reddit: [
    {
      id: "casual",
      label: "Casual tone",
      icon: "MessageCircle",
      promptText: "Use casual, conversational tone",
      offPromptText: "Formal tone is acceptable",
      defaultEnabled: true,
    },
    {
      id: "lowercase",
      label: "Lowercase OK",
      icon: "CaseLower",
      promptText: "Lowercase is acceptable, avoid overly formal language",
      offPromptText: "Use proper capitalization",
      defaultEnabled: true,
    },
    {
      id: "noemoji",
      label: "No emojis",
      icon: "SmilePlus",
      promptText: "Avoid emojis, they come across as inauthentic",
      offPromptText: "Emojis are acceptable",
      defaultEnabled: true,
    },
    {
      id: "human",
      label: "Sound human",
      icon: "User",
      promptText: "Sound like a real person, not marketing copy",
      offPromptText: "No tone constraints",
      defaultEnabled: true,
    },
    {
      id: "tldr",
      label: "Add TL;DR",
      icon: "FileText",
      promptText: "Add a TL;DR summary for longer posts",
      offPromptText: "Do not add TL;DR summary",
      defaultEnabled: false,
    },
  ],
  quora: [
    {
      id: "structured",
      label: "Structured",
      icon: "LayoutList",
      promptText: "Provide a structured, well-organized answer",
      offPromptText: "Unstructured answer is fine",
      defaultEnabled: true,
    },
    {
      id: "experience",
      label: "Personal experience",
      icon: "Lightbulb",
      promptText: "Share personal experience when relevant",
      offPromptText: "Do not emphasize personal experience",
      defaultEnabled: true,
    },
    {
      id: "comprehensive",
      label: "Comprehensive",
      icon: "BookOpen",
      promptText: "Be comprehensive and thorough in the answer",
      offPromptText: "Brief answer is fine",
      defaultEnabled: true,
    },
    {
      id: "headers",
      label: "Use headers",
      icon: "Heading",
      promptText: "Use headers to organize longer answers",
      offPromptText: "Do not use headers",
      defaultEnabled: false,
    },
    {
      id: "sources",
      label: "Cite sources",
      icon: "BookMarked",
      promptText: "Include sources or references when relevant",
      offPromptText: "Do not require sources or references",
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
 * Build the channel rules text from enabled rule IDs.
 * Always emits text for every rule (promptText when ON, offPromptText when OFF).
 */
export function buildChannelRulesText(
  channel: Platform,
  enabledRuleIds: string[]
): string {
  const rules = CHANNEL_RULES[channel];
  return rules
    .map((rule) =>
      enabledRuleIds.includes(rule.id) ? rule.promptText : rule.offPromptText
    )
    .join(", ");
}
