# Project 67 - Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Fastest Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Start development server
npm run dev
```

## 📝 Minimum Required Environment Variables

Add these to `.env.local`:

```env
# Supabase (get from supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI (get from platform.openai.com)
OPENAI_API_KEY=sk-your_key

# Stripe (get from dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Setup

1. Go to Supabase SQL Editor
2. Copy all content from `lib/supabase/schema.sql`
3. Paste and run

## ✅ Test It Works

Visit http://localhost:3000 and:

1. Click "Start Now"
2. Sign up with email
3. Complete the 7-step form
4. Try generating content

## 🎯 Next Steps

- Full setup guide: [SETUP.md](SETUP.md)
- Documentation: [README.md](README.md)
- Deploy: See README deployment section

## 🆘 Quick Troubleshooting

**Can't connect to Supabase?**
→ Check your URL and keys are correct

**AI generation fails?**
→ Verify OpenAI API key and account has credits

**Webhook errors?**
→ Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

**Need help?** Check [SETUP.md](SETUP.md) for detailed instructions.

