# 🚀 TextPrism

**"The Bridge Between Your Thoughts and AI's Best Output."**

TextPrism is a deterministic prompt engine that generates platform-optimized professional messages. It treats "Professional Message" as a mathematical composition of context, applying platform-specific formatting rules and social "secret sauce" to help you get better AI outputs.

## ✨ Features

- **Multi-Platform Support**: Slack, Email, LinkedIn, Reddit, Quora
- **Smart Prompt Generation**: Uses delimited sections for optimal LLM parsing
- **Platform-Specific Rules**: Each platform has unique formatting and social constraints
- **Live Preview**: Real-time prompt generation as you type
- **Pro Tier**: Advanced scenarios with soft paywall
- **URL Sharing**: Share configurations via URL parameters
- **localStorage Persistence**: Remembers your role and communication style
- **Anti-Cliche Protection**: Automatically filters out AI buzzwords

## 🎯 The Formula

```
Prompt = ƒ(Role, Scenario, Platform, Vibe, Input)
```

- **Role**: Your professional level (Junior, Senior, Tech Lead, etc.)
- **Scenario**: The intent (Release Update, PR Review, Salary Negotiation, etc.)
- **Platform**: Technical constraints (Slack markdown, Email HTML, etc.)
- **Vibe**: Social etiquette (Direct, Empathetic, Authoritative, Casual)
- **Input**: Your raw, messy notes

## 🏗️ Tech Stack

- **Framework**: Next.js 16.1.4 (App Router) + React 19.2.3
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Language**: TypeScript 5
- **State Management**: React hooks + localStorage + URL params
- **Package Manager**: pnpm
- **Runtime**: Node.js >= 24

## 📦 Installation

```bash
# Use correct Node version
nvm use

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏛️ Architecture

```
lib/
├── intent-matrix.ts        # All scenarios and their fields
├── platform-constraints.ts # Platform-specific formatting rules
├── generate-prompt.ts      # Core prompt generation logic
├── paywall.ts             # Pro tier logic
└── utils.ts               # Utilities

components/
├── ui/                    # shadcn/ui components
├── platform-switcher.tsx  # Tab-based platform selection
├── dynamic-form.tsx       # Auto-generates form from intent
├── preview-pane.tsx       # Live prompt preview with blur
├── copy-button.tsx        # Copy with toast notification
└── pro-unlock-button.tsx  # Paywall CTA

hooks/
└── use-form-state.ts      # State management + persistence

app/
├── layout.tsx            # Root layout with theme + toaster
└── page.tsx              # Main application
```

## 🎨 Platform-Specific "Secret Sauce"

### Slack

- **Format**: Markdown, heavy bullets, thread-friendly
- **Secret**: "Minimize noise, maximize signal. Be collaborative."

### Email

- **Format**: HTML-safe, include Subject Line
- **Secret**: "Respect hierarchy. Create searchable paper trail."

### LinkedIn

- **Format**: High whitespace, line breaks every 1-2 sentences
- **Secret**: "Hook-driven opening. End with engagement question. Brand-positive."

### Reddit

- **Format**: Block text, NO emojis, lowercase acceptable
- **Secret**: "Sound human. Self-deprecating or peer-driven. AVOID marketing speak. Imperfect grammar is good."

### Quora

- **Format**: Multi-paragraph, bold headers, structured guide
- **Secret**: "Logic-first. Comprehensive. Establish expertise through experience."

## 🔐 Pro Features

Premium scenarios include:

- **Salary Negotiation** (Email)
- **Turn Failure into Lesson** (LinkedIn)
- **Establishing Expertise** (Quora)

Pro content is blurred with a soft paywall. Configure checkout URLs:

```bash
# .env.local
NEXT_PUBLIC_STRIPE_URL=https://buy.stripe.com/your-link
NEXT_PUBLIC_LEMONSQUEEZY_URL=https://lemonsqueezy.com/checkout/your-link
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel deploy
```

### Environment Variables

```bash
NEXT_PUBLIC_STRIPE_URL=          # Optional: Stripe checkout URL
NEXT_PUBLIC_LEMONSQUEEZY_URL=    # Optional: LemonSqueezy checkout URL
```

## 📝 Usage

1. **Select Platform**: Choose from Work (Slack/Email), LinkedIn, Reddit, or Quora
2. **Pick Scenario**: Select the type of message you want to generate
3. **Fill Form**: Provide your role, communication style, and scenario details
4. **Copy Prompt**: Copy the generated prompt and paste into your AI tool
5. **Share**: URL updates automatically - share your configuration with teammates

## 🎯 Key Implementation Details

### Anti-AI Safeguard

Every generated prompt includes:

> "Do not use common AI clichés like 'I hope this finds you well' or 'In the ever-evolving landscape'."

### Delimited Sections

Prompts use `### SECTION ###` delimiters for optimal LLM parsing:

- `### ROLE ###`
- `### SCENARIO ###`
- `### PLATFORM CONSTRAINTS ###`
- `### TONE/VIBE ###`
- `### USER INPUT ###`
- `### ANTI-CLICHE RULES ###`

### Reddit-Specific Instruction

> "Sound like a human, use lower-case in some places, avoid perfect grammar."

### Outcome-Focused Labels

Intent cards focus on outcomes:

- ✅ "Get your PR reviewed in minutes"
- ❌ "Write a PR nudge"

## 🛠️ Development

```bash
# Run dev server
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Type check
pnpm type-check
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built for developers who want better AI outputs.
