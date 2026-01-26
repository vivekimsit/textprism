import type { Audience, Channel, Persona, Tone } from "@/lib/intent";

export interface PresetContext {
  channel: Channel;
  audience: Audience;
  tone: Tone;
  role: Persona;
}

export interface Preset {
  id: string;
  title: string;
  sentence: string;
  context: PresetContext;
  extraRules?: string[];
}

export const PRESETS: Preset[] = [
  {
    id: "email-stakeholder-formal-pm",
    title: "Stakeholder update",
    sentence:
      "Email to stakeholders with a formal PM update on scope, timeline, and risks.",
    context: {
      channel: "email",
      audience: "stakeholder",
      tone: "formal",
      role: "product_manager",
    },
    extraRules: [
      "Open with a one-line status summary",
      "Include a crisp timeline if dates are mentioned",
      "End with the decision or ask",
    ],
  },
  {
    id: "slack-team-direct-tech-lead",
    title: "Team unblock",
    sentence: "Slack note to the team, direct tech lead asking for an unblock.",
    context: {
      channel: "slack",
      audience: "team",
      tone: "direct",
      role: "tech_lead",
    },
    extraRules: ["Use bullets", "End with a clear owner and next step"],
  },
  {
    id: "linkedin-public-persuasive-founder",
    title: "Founder perspective",
    sentence:
      "LinkedIn post for the public, persuasive founder sharing a lesson learned.",
    context: {
      channel: "linkedin",
      audience: "public",
      tone: "persuasive",
      role: "founder",
    },
    extraRules: ["Start with a strong hook", "Include a short CTA question"],
  },
  {
    id: "reddit-community-casual-junior",
    title: "Community question",
    sentence:
      "Reddit post to the community, casual junior engineer asking for advice.",
    context: {
      channel: "reddit",
      audience: "community",
      tone: "casual",
      role: "junior_engineer",
    },
    extraRules: ["Be specific about constraints", "Avoid marketing language"],
  },
  {
    id: "email-client-warm-freelancer",
    title: "Client follow-up",
    sentence: "Warm email to a client from a freelancer clarifying next steps.",
    context: {
      channel: "email",
      audience: "client",
      tone: "warm",
      role: "freelancer",
    },
    extraRules: ["Keep it under 150 words", "Include a clear CTA"],
  },
  {
    id: "slack-manager-formal-eng-mgr",
    title: "Risk escalation",
    sentence:
      "Slack message to your manager, formal engineering manager flagging a risk.",
    context: {
      channel: "slack",
      audience: "manager",
      tone: "formal",
      role: "engineering_manager",
    },
    extraRules: ["Include impact and mitigation", "Ask for alignment"],
  },
  {
    id: "linkedin-network-warm-designer",
    title: "Portfolio share",
    sentence:
      "LinkedIn post to your network, warm designer sharing a portfolio update.",
    context: {
      channel: "linkedin",
      audience: "network",
      tone: "warm",
      role: "designer",
    },
    extraRules: ["Use 2 short paragraphs", "Invite feedback"],
  },
  {
    id: "reddit-community-direct-senior",
    title: "Tradeoff analysis",
    sentence:
      "Reddit post to the community, direct senior engineer explaining a tradeoff.",
    context: {
      channel: "reddit",
      audience: "community",
      tone: "direct",
      role: "senior_engineer",
    },
    extraRules: ["Use numbered points", "State assumptions upfront"],
  },
];
