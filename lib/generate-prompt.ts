import type { Intent, Platform } from './intent-matrix';
import { getPlatformConstraint, getAntiClicheRules, getFormattingExample } from './platform-constraints';

export interface GeneratePromptParams {
  role: string;
  intent: Intent;
  platform: Platform;
  vibe: string;
  fieldValues: Record<string, string>;
}

export function generatePrompt(params: GeneratePromptParams): string {
  const { role, intent, platform, vibe, fieldValues } = params;
  const constraint = getPlatformConstraint(platform);
  const antiClicheRules = getAntiClicheRules(platform);
  const formattingExample = getFormattingExample(platform);

  // Build the field values section
  const fieldValuesSection = intent.fields
    .map(field => {
      const value = fieldValues[field.name] || '[Not provided]';
      return `- ${field.label}: ${value}`;
    })
    .join('\n');

  // Construct the prompt with delimited sections
  const prompt = `### ROLE ###
You are writing as a ${role}. This context matters for tone, technical depth, and authority level.

### SCENARIO ###
Intent: ${intent.name}
Goal: ${intent.outcomeLabel}

### PLATFORM CONSTRAINTS ###
Platform: ${platform.toUpperCase()}
Formatting Requirements: ${constraint.formatting}
Social Rules: ${constraint.socialRules}

### TONE/VIBE ###
Communication Style: ${vibe}
Make sure the tone matches this style throughout the message.

### USER INPUT ###
${fieldValuesSection}

### FORMATTING EXAMPLE ###
${formattingExample}

### ANTI-CLICHE RULES ###
${antiClicheRules}

CRITICAL: Do not use common AI clichés like:
- "I hope this email finds you well"
- "In the ever-evolving landscape"
- "I'm excited to announce"
- "Reaching out to touch base"
- "Circling back on this"
- Any other corporate buzzword fluff

### INSTRUCTIONS ###
Using ALL of the above context, generate a ${platform} message that:
1. Follows the platform's formatting constraints exactly
2. Matches the specified tone/vibe
3. Incorporates all the user input naturally
4. Sounds authentically human (especially for Reddit - use lowercase, imperfect grammar if appropriate)
5. Is outcome-focused and actionable
6. Completely avoids all AI clichés and corporate speak

${platform === 'reddit' ? '\nREMINDER FOR REDDIT: Sound like a human, use lower-case in some places, avoid perfect grammar. Be conversational and peer-to-peer.' : ''}
${platform === 'linkedin' ? '\nREMINDER FOR LINKEDIN: Start with a hook that stops the scroll. End with an engagement question.' : ''}
${platform === 'email' ? '\nREMINDER FOR EMAIL: Start with a clear subject line on the first line as "Subject: [your subject]"' : ''}

Generate the message now:`;

  return prompt;
}

// Utility function to check if all required fields are filled
export function isPromptReady(
  intent: Intent,
  fieldValues: Record<string, string>
): boolean {
  return intent.fields.every(field => {
    const value = fieldValues[field.name];
    return value && value.trim().length > 0;
  });
}

// Get a preview message when fields are not filled
export function getPreviewPlaceholder(intent: Intent): string {
  return `Fill in the form fields to generate your ${intent.platform} message.

This prompt will be optimized for:
- ${intent.outcomeLabel}
- ${intent.platform.charAt(0).toUpperCase() + intent.platform.slice(1)} formatting conventions
- Your specified role and communication style`;
}
