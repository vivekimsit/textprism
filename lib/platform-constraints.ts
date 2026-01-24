import type { Platform } from './intent-matrix';

export interface PlatformConstraint {
  formatting: string;
  socialRules: string;
  antiCliche: boolean;
}

export const PLATFORM_CONSTRAINTS: Record<Platform, PlatformConstraint> = {
  slack: {
    formatting: 'Markdown, heavy bullets, thread-friendly',
    socialRules: 'Minimize noise, maximize signal. Be collaborative.',
    antiCliche: true,
  },
  email: {
    formatting: 'HTML-safe, include Subject Line',
    socialRules: 'Respect hierarchy. Create searchable paper trail.',
    antiCliche: true,
  },
  linkedin: {
    formatting: 'High whitespace, line breaks every 1-2 sentences',
    socialRules:
      'Hook-driven opening. End with engagement question. Brand-positive.',
    antiCliche: true,
  },
  reddit: {
    formatting: 'Block text, NO emojis, lowercase acceptable',
    socialRules:
      'Sound human. Self-deprecating or peer-driven. AVOID marketing speak. Imperfect grammar is good.',
    antiCliche: true,
  },
  quora: {
    formatting: 'Multi-paragraph, bold headers, structured guide',
    socialRules:
      'Logic-first. Comprehensive. Establish expertise through experience.',
    antiCliche: true,
  },
};

// Platform-specific anti-cliche instructions
export const ANTI_CLICHE_RULES: Record<Platform, string> = {
  slack: 'Avoid corporate speak. No "circling back" or "touching base". Be direct.',
  email: 'Skip "I hope this email finds you well" and "In the ever-evolving landscape". Get to the point.',
  linkedin: 'No "I\'m thrilled to announce" or "game-changer" or "disrupting the space". Be authentic.',
  reddit: 'Absolutely no marketing speak. No "innovative solution" or "cutting-edge". Sound like a real person chatting with peers.',
  quora: 'Avoid buzzwords and corporate jargon. No "synergy" or "paradigm shift". Focus on practical experience.',
};

// Platform-specific formatting examples
export const FORMATTING_EXAMPLES: Record<Platform, string> = {
  slack: `Example structure:
🎯 **Quick Update**

**Shipping:**
• Feature A - ready to deploy
• Feature B - in QA

**Blockers:**
• None

**ETA:** Tomorrow 2pm`,
  
  email: `Example structure:
Subject: [Clear, specific subject line]

Hi [Name],

[One sentence context/purpose]

[2-3 paragraphs with clear sections]

[Clear call to action]

Best,
[Your name]`,
  
  linkedin: `Example structure:
[Hook - one powerful sentence that makes them stop scrolling]

[Short paragraph explaining the situation]

[The insight or lesson - what changed]

[The result - tangible outcome]

What's your experience with [topic]?`,
  
  reddit: `Example structure:
[casual opening - lowercase is fine]

[explain what you built/did and why]

[the actual technical details or question]

[honest self-assessment - acknowledge limitations]

happy to answer questions if anyone's interested`,
  
  quora: `Example structure:
**[Restate the question with context]**

[Your credentials - brief]

**The Short Answer:** [One sentence]

**The Full Answer:**

[Section 1: Context/Background]
[Section 2: The Core Solution]
[Section 3: Common Mistakes]
[Section 4: Real-World Example]

**Key Takeaway:** [One memorable insight]`,
};

export function getPlatformConstraint(platform: Platform): PlatformConstraint {
  return PLATFORM_CONSTRAINTS[platform];
}

export function getAntiClicheRules(platform: Platform): string {
  return ANTI_CLICHE_RULES[platform];
}

export function getFormattingExample(platform: Platform): string {
  return FORMATTING_EXAMPLES[platform];
}
