# Project 67 — 0→7 Figure AI Business Kit Platform

![Project 67 Banner](https://via.placeholder.com/1200x400/0B0B0B/296AFF?text=Project+67)

## 🚀 Overview

**Project 67** is a premium, Apple-style platform that empowers users to build a complete business from idea to execution. Generate AI-powered business cases, viral content strategies, and launch-ready websites — all within an interactive dashboard with cinematic UX, credit-based upsells, and progress gamification.

### Key Features

- **AI-Powered Business Case**: 7-section comprehensive strategy with market analysis, positioning, growth roadmap, and operations
- **Viral Content Strategy**: 3 proven content hooks with complete frameworks for social media dominance
- **8 Premium Website Templates**: Apple-inspired designs ready to launch
- **Credit System**: Flexible monetization for additional dashboards
- **Stripe Integration**: One-time unlock + optional hosting subscription
- **Referral Program**: 50% commission (£16.75 per referral)
- **Email Automation**: Progress nudges and weekly viral content ideas
- **Gamification**: XP tracking and completion incentives

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Supabase (Auth, Database, RLS, Storage)
- **AI**: OpenAI GPT-4 API with custom prompts
- **Payments**: Stripe (one-time + subscriptions)
- **Email**: Resend API
- **Deployment**: Vercel + Supabase

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Stripe account
- OpenAI API key
- Resend API key (optional, for emails)

### Setup Steps

1. **Clone and install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_ID_UNLOCK=price_xxx
STRIPE_PRICE_ID_HOSTING=price_xxx
STRIPE_PRICE_ID_CREDITS_500=price_xxx
STRIPE_PRICE_ID_CREDITS_1000=price_xxx

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (for email notifications)
CRON_SECRET=your_random_secret_key
```

3. **Set up Supabase Database**

Run the SQL schema from `lib/supabase/schema.sql` in your Supabase SQL editor:

```bash
# Copy the contents of lib/supabase/schema.sql
# Paste and run in Supabase > SQL Editor
```

4. **Configure Stripe**

- Create products in Stripe Dashboard:
  - Full Business Kit Unlock (£33.50 one-time)
  - Website Hosting (£3.00/month)
  - 500 Credits (£6.99)
  - 1000 Credits (£12.99)
- Set up webhook endpoint: `/api/webhooks/stripe`
- Add webhook secret to `.env.local`

5. **Run the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
project67/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ProgressBar.tsx
│   ├── tabs/            # AI generation tabs
│   │   ├── BusinessCaseTab.tsx
│   │   ├── ContentStrategyTab.tsx
│   │   └── WebsiteTab.tsx
│   └── AuthModal.tsx
├── lib/
│   ├── ai/
│   │   ├── prompts/
│   │   │   ├── business_case.txt
│   │   │   └── content_strategy.txt
│   │   ├── businessCase.ts
│   │   └── contentStrategy.ts
│   ├── email/
│   │   └── resend.ts
│   ├── stripe/
│   │   └── config.ts
│   └── supabase/
│       ├── client.ts
│       └── schema.sql
├── pages/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── stripe.ts
│   │   ├── buy-credits.ts
│   │   ├── create-checkout-session.ts
│   │   ├── generate.ts
│   │   └── send-notification.ts
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx        # Landing page
│   ├── generate.tsx     # Progressive form
│   ├── tabs.tsx         # AI generation interface
│   ├── checkout.tsx     # Payment page
│   ├── success.tsx      # Post-purchase
│   └── dashboard.tsx    # User dashboard
├── styles/
│   └── globals.css
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 Design System

### Colors

- **Background**: `#0B0B0B` (Deep black)
- **Primary Text**: `#FFFFFF` (White)
- **Secondary Text**: `#CCCCCC` (Light gray)
- **Accent**: `#296AFF` (Blue)
- **Accent Alt**: `#B48A39` (Gold)

### Typography

- **Font**: Inter / SF Pro Display
- **Headings**: Bold, large sizing with gradient effects
- **Body**: Clean, readable with proper hierarchy

### Animations

- Smooth transitions with Framer Motion
- Glow effects on accent elements
- Parallax scrolling on landing page
- Micro-interactions on buttons and cards

## 🔐 Database Schema

### Tables

- **profiles**: User profiles with credits and purchase status
- **dashboards**: Business dashboards with all form data
- **generations**: AI-generated content (business case, content strategy, website)
- **transactions**: Payment history and credit purchases
- **email_notifications**: Email sending status and history

### Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data.

## 💳 Payment Flow

1. User completes all 3 tabs (Business Case, Content Strategy, Website)
2. Checkout page shows unlock price (£33.50) + optional hosting (£3/month)
3. Stripe Checkout Session created
4. On success, webhook updates user profile and dashboard status
5. User redirected to success page with confetti
6. Full access unlocked with unlimited regenerations

## 📧 Email Notifications

### Types

1. **Welcome Email**: Sent on signup
2. **Completion Nudge**: Sent to users with incomplete dashboards (3 days after creation)
3. **Weekly Viral Ideas**: Sent every Monday to users with complete dashboards
4. **Purchase Confirmation**: Sent after successful payment

### Setup Cron Jobs (Vercel)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/send-notification",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel**

- Connect your GitHub repository
- Add all environment variables
- Deploy

3. **Configure Stripe Webhook**

- Update webhook URL to production endpoint
- Test with Stripe CLI or dashboard

### Post-Deployment

1. Test all flows (signup, generation, checkout)
2. Verify webhooks are working
3. Test email notifications
4. Monitor Supabase logs and Stripe dashboard

## 🔧 Configuration

### AI Prompts

Edit prompt files in `lib/ai/prompts/`:
- `business_case.txt`: Customize business case generation logic
- `content_strategy.txt`: Modify content hook frameworks

### Pricing

Update prices in `lib/stripe/config.ts`:

```typescript
export const PRICES = {
  UNLOCK: 3350,        // £33.50
  HOSTING: 300,        // £3.00
  CREDITS_500: 699,    // £6.99
  CREDITS_1000: 1299,  // £12.99
}
```

## 🧪 Testing

### Test User Flow

1. Sign up with test email
2. Complete progressive form (7 steps)
3. Generate Business Case
4. Generate Content Strategy
5. Select Website Template
6. Proceed to checkout
7. Use Stripe test card: `4242 4242 4242 4242`
8. Verify webhook processing
9. Check dashboard access

### Test Cards (Stripe)

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

## 📊 Analytics & Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Database queries and auth logs
- **Stripe Dashboard**: Payment analytics and webhook logs
- **Sentry**: Error tracking (optional)

## 🛡 Security

- Row Level Security (RLS) on all Supabase tables
- API routes protected with authentication checks
- Stripe webhook signature verification
- Environment variables for all secrets
- HTTPS enforced in production

## 🤝 Contributing

This is a proprietary project. For internal team contributions:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with detailed description

## 📄 License

Proprietary — All rights reserved © 2025 Project 67

## 🆘 Support

For support or questions:
- Email: support@project67.com
- Documentation: [Internal Wiki]
- Slack: #project67-support

---

**Built with ❤️ by the Project 67 Team**

