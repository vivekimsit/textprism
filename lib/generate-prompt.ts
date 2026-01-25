export type Platform = "slack" | "email" | "linkedin" | "reddit" | "quora";

export interface GeneratePromptParams {
  message: string;
  channel: Platform;
  audience: string;
  tone: string;
  whoIAm: string;
}

// Channel-specific formatting hints (minimal, not over-engineered)
const CHANNEL_HINTS: Record<Platform, string> = {
  slack: "Use markdown, bullets for lists, keep it scannable",
  email: "Include a clear subject line, professional structure",
  linkedin:
    "Hook in first line, whitespace between paragraphs, end with question",
  reddit: "Casual tone, lowercase OK, no emojis, sound like a real person",
  quora: "Structured answer, share experience, be comprehensive",
};

export function generatePrompt(params: GeneratePromptParams): string {
  const { message, channel, audience, tone, whoIAm } = params;

  const prompt = `You are writing a ${channel.toUpperCase()} message.

CONTEXT:
- Writer: ${whoIAm}
- Audience: ${audience}
- Tone: ${tone}

MESSAGE TO TRANSFORM:
${message}

CHANNEL RULES (${channel}):
${CHANNEL_HINTS[channel]}

CRITICAL RULES:
- Sound human, not AI-generated
- No clichés: "I hope this finds you well", "circling back", "touching base"
- Match structure to complexity (simple ask = simple message, not 5 sections)
- Be specific, not vague ("open points" → name the actual points)

Generate the ${channel} message:`;

  return prompt;
}

// Check if we have enough input to generate
export function canGenerate(message: string): boolean {
  return message.trim().length >= 10;
}
