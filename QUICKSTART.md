# Quick Start Guide - TextPrism

## 🚀 You're Ready to Launch!

TextPrism MVP is **100% complete** and ready to run. Here's how to get started:

## Run Locally (3 Steps)

```bash
# 1. Install dependencies (if not already done)
pnpm install

# 2. Start the development server
pnpm dev

# 3. Open your browser
# → http://localhost:3000
```

## Test the Features

### 1. Try the Free Features First

- Click **"Work (Slack)"** tab
- Select **"Release Update"** card
- Fill in:
  - Your Role: `Senior Engineer`
  - Communication Style: `Direct`
  - Features: `New dashboard, bug fixes`
  - Blockers: `None`
  - ETA: `Tomorrow 2pm`
- Watch the prompt generate in real-time!
- Click **"Copy Prompt"** → Toast notification appears ✨

### 2. Test Pro Features (Soft Paywall)

- Click **"Work (Email)"** tab
- Select **"Salary Negotiation"** (PRO badge)
- Fill in the form
- Notice the blurred output
- Click **"Unlock with Pro"** → Demo unlock! 🎉

### 3. Test URL Sharing

- Fill out any scenario
- Copy the URL from your browser
- Open in new tab → State restored! 🔗

### 4. Test Dark Mode

- Your system dark mode should work automatically
- Theme toggles with system preferences

## Deploy to Production (5 Minutes)

```bash
# 1. Create a GitHub repo
git init
git add .
git commit -m "Initial commit: TextPrism MVP"
git branch -M main
git remote add origin https://github.com/yourusername/textprism.git
git push -u origin main

# 2. Go to vercel.com
# - Click "New Project"
# - Import your GitHub repo
# - Click "Deploy"
# - Done! 🎉
```

Your app will be live at: `https://your-project.vercel.app`

## Next Actions (Optional)

### Before Public Launch

1. **Replace OG Image**
   - Create 1200x630px image with your branding
   - Save as `public/og-image.png`

2. **Update Favicon**
   - Replace `app/favicon.ico` with your icon

3. **Configure Payments** (if using Pro tier)
   ```bash
   # Create .env.local
   NEXT_PUBLIC_STRIPE_URL=https://buy.stripe.com/your-link
   # OR
   NEXT_PUBLIC_LEMONSQUEEZY_URL=https://lemonsqueezy.com/checkout/your-link
   ```

### Marketing Launch

1. **Create accounts on:**
   - Product Hunt
   - Hacker News
   - Reddit (r/SideProject, r/webdev)
   - Twitter/X

2. **Launch post ideas:**
   - "I built a tool to generate better AI prompts"
   - "Stop using ChatGPT wrong - use TextPrism"
   - "Platform-specific prompt optimization for devs"

## File Structure Overview

```
Key Files You Might Want to Edit:
├── lib/intent-matrix.ts         ← Add more scenarios here
├── lib/platform-constraints.ts  ← Tweak platform rules
├── components/platform-switcher.tsx ← UI for tabs
├── app/layout.tsx              ← Metadata/SEO
└── app/page.tsx                ← Main app logic

Documentation:
├── README.md              ← Full project docs
├── DEPLOYMENT.md          ← Detailed deploy guide
├── IMPLEMENTATION_SUMMARY.md ← What was built
└── QUICKSTART.md          ← This file
```

## Customization Ideas

### Add More Scenarios

Edit `lib/intent-matrix.ts`:

```typescript
{
  id: 'slack-bug-report',
  name: 'Bug Report',
  tier: 'free',
  platform: 'slack',
  category: 'work',
  outcomeLabel: 'Report bugs clearly and get them fixed faster',
  fields: [
    { name: 'what_broke', label: 'What Broke', type: 'textarea', placeholder: '...' },
    { name: 'expected', label: 'Expected Behavior', type: 'textarea', placeholder: '...' },
    { name: 'steps', label: 'Steps to Reproduce', type: 'textarea', placeholder: '...' },
  ],
},
```

### Add New Platform

1. Add to `lib/intent-matrix.ts` Platform type
2. Add constraints to `lib/platform-constraints.ts`
3. Add tab to `components/platform-switcher.tsx`

### Change Styling

- Colors: Edit `app/globals.css` (CSS variables)
- Components: All in `components/` folder
- Dark mode: Already configured!

## Support & Resources

- **Docs**: See README.md for full documentation
- **Deploy**: See DEPLOYMENT.md for deploy guides
- **Next.js**: https://nextjs.org/docs
- **Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

## Troubleshooting

### Port already in use?

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### Build fails?

```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Dependencies issue?

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Performance

Already optimized:

- ✅ Static generation (fast loading)
- ✅ Font optimization (next/font)
- ✅ Tree-shaking (small bundle)
- ✅ Tailwind purging (minimal CSS)
- ✅ React 19 compiler (automatic optimization)

## Security

Built-in:

- ✅ No API keys in code
- ✅ Environment variables for secrets
- ✅ No database (stateless)
- ✅ Client-side only operations
- ✅ No user data collection

---

## 🎉 That's It!

You have a fully functional, production-ready MVP that:

- ✅ Generates platform-optimized prompts
- ✅ Supports 5 platforms and 6 scenarios
- ✅ Has a beautiful responsive UI
- ✅ Includes Pro tier monetization
- ✅ Is ready to deploy in 5 minutes

**Time to launch and get your first users!** 🚀
