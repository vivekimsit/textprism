export type Platform = "slack" | "email" | "linkedin" | "reddit" | "quora";
export type Tier = "free" | "pro";
export type Category = "work" | "growth";

export interface IntentField {
  name: string;
  label: string;
  type: "input" | "textarea";
  placeholder: string;
}

export interface Intent {
  id: string;
  name: string;
  tier: Tier;
  platform: Platform;
  category: Category;
  fields: IntentField[];
  outcomeLabel: string;
}

export const INTENT_MATRIX: Intent[] = [
  // WORK TIER - SLACK
  {
    id: "slack-release-update",
    name: "Release Update",
    tier: "free",
    platform: "slack",
    category: "work",
    outcomeLabel: "Keep your team aligned with clear release updates",
    fields: [
      {
        name: "features",
        label: "New Features",
        type: "textarea",
        placeholder:
          'What new features are shipping? (e.g., "New dashboard analytics, PDF export")',
      },
      {
        name: "blockers",
        label: "Blockers",
        type: "textarea",
        placeholder:
          'Any blockers or known issues? (e.g., "Waiting on API keys from DevOps")',
      },
      {
        name: "eta",
        label: "ETA",
        type: "input",
        placeholder: 'When will this ship? (e.g., "Tomorrow 2pm EST")',
      },
    ],
  },
  {
    id: "slack-pr-review",
    name: "PR Review Nudge",
    tier: "free",
    platform: "slack",
    category: "work",
    outcomeLabel: "Get your PR reviewed in minutes, not hours",
    fields: [
      {
        name: "pr_link",
        label: "PR Link",
        type: "input",
        placeholder: "https://github.com/yourorg/repo/pull/123",
      },
      {
        name: "urgency",
        label: "Why is this urgent?",
        type: "textarea",
        placeholder:
          'e.g., "Blocks deployment tomorrow morning" or "Hotfix for production bug"',
      },
    ],
  },
  {
    id: "slack-meeting-request",
    name: "Meeting Request",
    tier: "free",
    platform: "slack",
    category: "work",
    outcomeLabel: "Schedule a quick sync without the back-and-forth",
    fields: [
      {
        name: "purpose",
        label: "Purpose",
        type: "textarea",
        placeholder:
          'What do you need to discuss? (e.g., "Align on Q1 roadmap priorities")',
      },
      {
        name: "duration",
        label: "Duration",
        type: "input",
        placeholder: 'How long? (e.g., "15 mins" or "Quick 10 min sync")',
      },
      {
        name: "urgency",
        label: "Timing",
        type: "input",
        placeholder: 'When? (e.g., "This week" or "Before Friday")',
      },
    ],
  },
  {
    id: "slack-async-update",
    name: "Async Update",
    tier: "free",
    platform: "slack",
    category: "work",
    outcomeLabel: "Keep your team in the loop without meetings",
    fields: [
      {
        name: "update",
        label: "Update",
        type: "textarea",
        placeholder:
          'What\'s the update? (e.g., "Finished the auth refactor, starting on payments next")',
      },
      {
        name: "blockers",
        label: "Blockers (optional)",
        type: "textarea",
        placeholder:
          'Any blockers or questions? (e.g., "Need design review on the new flow")',
      },
    ],
  },
  {
    id: "slack-question",
    name: "Ask the Team",
    tier: "free",
    platform: "slack",
    category: "work",
    outcomeLabel: "Get quick answers from your team",
    fields: [
      {
        name: "question",
        label: "Question",
        type: "textarea",
        placeholder:
          'What do you need to know? (e.g., "Has anyone worked with Stripe webhooks before?")',
      },
      {
        name: "context",
        label: "Context (optional)",
        type: "textarea",
        placeholder:
          'Any relevant background? (e.g., "Working on payment integration, docs are unclear")',
      },
    ],
  },
  // WORK TIER - EMAIL
  {
    id: "email-salary-negotiation",
    name: "Salary Negotiation",
    tier: "pro",
    platform: "email",
    category: "work",
    outcomeLabel: "Negotiate your worth with confidence and data",
    fields: [
      {
        name: "achievements",
        label: "Key Achievements",
        type: "textarea",
        placeholder:
          'What have you delivered? (e.g., "Led migration to microservices, reduced costs 40%")',
      },
      {
        name: "market_rate",
        label: "Market Rate Research",
        type: "input",
        placeholder:
          'What does the market pay for your role? (e.g., "$180k-220k for Senior SWE in SF")',
      },
      {
        name: "years_at_company",
        label: "Years at Company",
        type: "input",
        placeholder: 'How long have you been here? (e.g., "3.5 years")',
      },
    ],
  },
  // GROWTH TIER - LINKEDIN
  {
    id: "linkedin-failure-lesson",
    name: "Turn Failure into Lesson",
    tier: "pro",
    platform: "linkedin",
    category: "growth",
    outcomeLabel: "Transform your mistakes into viral content",
    fields: [
      {
        name: "the_mistake",
        label: "The Mistake",
        type: "textarea",
        placeholder:
          'What went wrong? (e.g., "Deployed to prod on Friday at 5pm, broke checkout for 2 hours")',
      },
      {
        name: "the_learning",
        label: "The Learning",
        type: "textarea",
        placeholder:
          'What did you learn? (e.g., "Now we have automated rollback + staging mirror")',
      },
      {
        name: "the_result",
        label: "The Result",
        type: "input",
        placeholder:
          'What changed? (e.g., "Zero production incidents in 6 months")',
      },
    ],
  },
  // GROWTH TIER - REDDIT
  {
    id: "reddit-seeking-feedback",
    name: "Seeking Feedback",
    tier: "free",
    platform: "reddit",
    category: "growth",
    outcomeLabel: "Get honest feedback from real developers",
    fields: [
      {
        name: "what_i_built",
        label: "What I Built",
        type: "textarea",
        placeholder:
          'Describe your project (e.g., "CLI tool that auto-generates API docs from comments")',
      },
      {
        name: "why_i_built_it",
        label: "Why I Built It",
        type: "textarea",
        placeholder:
          'Your motivation (e.g., "Tired of our docs being out of sync with code")',
      },
      {
        name: "tech_stack",
        label: "Tech Stack",
        type: "input",
        placeholder: 'e.g., "Rust + Tree-sitter parser"',
      },
    ],
  },
  // GROWTH TIER - QUORA
  {
    id: "quora-establishing-expertise",
    name: "Establishing Expertise",
    tier: "pro",
    platform: "quora",
    category: "growth",
    outcomeLabel: "Position yourself as a thought leader",
    fields: [
      {
        name: "the_question",
        label: "The Question",
        type: "input",
        placeholder:
          'What question are you answering? (e.g., "How do you scale to 1M users?")',
      },
      {
        name: "your_experience",
        label: "Your Experience",
        type: "textarea",
        placeholder:
          'What have you done? (e.g., "Scaled 3 startups from 100k to 5M users")',
      },
      {
        name: "key_insight",
        label: "Key Insight",
        type: "textarea",
        placeholder:
          'What\'s the non-obvious truth? (e.g., "Database sharding is the last thing you should do")',
      },
    ],
  },
];

// Helper functions
export function getIntentsByPlatform(platform: Platform): Intent[] {
  return INTENT_MATRIX.filter((intent) => intent.platform === platform);
}

export function getIntentsByCategory(category: Category): Intent[] {
  return INTENT_MATRIX.filter((intent) => intent.category === category);
}

export function getIntentById(id: string): Intent | undefined {
  return INTENT_MATRIX.find((intent) => intent.id === id);
}

export function getFreeIntents(): Intent[] {
  return INTENT_MATRIX.filter((intent) => intent.tier === "free");
}

export function getProIntents(): Intent[] {
  return INTENT_MATRIX.filter((intent) => intent.tier === "pro");
}
