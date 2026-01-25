# Deployment Guide - TextPrism

## Quick Deployment (Vercel - Recommended)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TextPrism MVP"
git branch -M main
git remote add origin https://github.com/yourusername/textprism.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
   - **Output Directory**: `.next`

5. Add Environment Variables (Optional):
   - `NEXT_PUBLIC_STRIPE_URL`: Your Stripe checkout link
   - `NEXT_PUBLIC_LEMONSQUEEZY_URL`: Your LemonSqueezy checkout link

6. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

## Alternative: Netlify

### 1. Create `netlify.toml`

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 2. Deploy

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings (should auto-detect from netlify.toml)
5. Add environment variables if needed
6. Click "Deploy"

## Environment Variables

Optional configuration for Pro tier payments:

```bash
# Stripe (preferred for US/EU)
NEXT_PUBLIC_STRIPE_URL=https://buy.stripe.com/your-link

# LemonSqueezy (preferred for global)
NEXT_PUBLIC_LEMONSQUEEZY_URL=https://lemonsqueezy.com/checkout/your-link
```

## Custom Domain

### Vercel

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Netlify

1. Go to "Domain settings"
2. Click "Add custom domain"
3. Follow DNS configuration instructions

## Post-Deployment Checklist

- [ ] Test all 5 platforms (Slack, Email, LinkedIn, Reddit, Quora)
- [ ] Verify Pro paywall works
- [ ] Test copy-to-clipboard functionality
- [ ] Check responsive design on mobile
- [ ] Test URL sharing with query parameters
- [ ] Verify localStorage persistence
- [ ] Create actual OG image (1200x630) at `public/og-image.png`
- [ ] Update favicon at `app/favicon.ico`
- [ ] Configure payment links if using Pro tier
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Verify dark mode works correctly

## OG Image Creation

Replace `public/og-image.png` with a proper image:

**Recommended specs:**

- Size: 1200x630px
- Format: PNG or JPEG
- Design: Include "TextPrism" branding and tagline
- Tools: Canva, Figma, or Photoshop

## Analytics (Optional)

### Add Vercel Analytics

```bash
pnpm add @vercel/analytics
```

Update `app/layout.tsx`:

```tsx
import { Analytics } from "@vercel/analytics/react";

// Add to layout
<Analytics />;
```

### Add Google Analytics

Add to `app/layout.tsx`:

```tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

## Monitoring

Monitor your deployment:

- **Vercel**: Built-in analytics and logs
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Mixpanel**: User behavior analytics

## Performance Optimization

Already implemented:

- ✅ Static generation where possible
- ✅ Font optimization with next/font
- ✅ Tree-shaking with ES modules
- ✅ Tailwind CSS purging
- ✅ React 19 compiler optimizations

Future optimizations:

- [ ] Add service worker for offline support
- [ ] Implement edge caching
- [ ] Add image optimization for OG images
- [ ] Bundle analysis and code splitting

## Support

For deployment issues:

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Create an issue in your repository
