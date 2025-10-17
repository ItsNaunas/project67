# Project 67 - Complete Setup Guide

This guide will walk you through setting up Project 67 from scratch.

## 🎯 Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ installed
- [x] npm or yarn package manager
- [x] Git installed
- [x] A code editor (VS Code recommended)
- [x] Accounts created for:
  - Supabase (free tier works)
  - Stripe (test mode is fine initially)
  - OpenAI (requires API access)
  - Resend (optional, for emails)

## 📋 Step-by-Step Setup

### 1. Project Installation

```bash
# Navigate to project directory
cd project67

# Install dependencies
npm install
```

### 2. Supabase Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name (e.g., "project67")
   - Set a strong database password
   - Select a region close to you

2. **Get your API credentials**
   - Go to Project Settings > API
   - Copy the Project URL
   - Copy the `anon` public key
   - Copy the `service_role` key (keep this secret!)

3. **Run the database schema**
   - Go to SQL Editor in Supabase
   - Open `lib/supabase/schema.sql` from this project
   - Copy and paste the entire content
   - Click "Run" to create all tables and security policies

4. **Enable Email Auth**
   - Go to Authentication > Providers
   - Enable Email provider
   - Enable Google OAuth (optional but recommended):
     - Add your Google OAuth credentials
     - Set authorized redirect URLs

### 3. OpenAI Setup

1. **Get API Key**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys
   - Create new secret key
   - Copy and save it securely

2. **Set up billing**
   - Add a payment method
   - Set a usage limit to avoid surprises
   - $10-20 should be enough for testing

### 4. Stripe Setup

1. **Create Products and Prices**

   In your Stripe Dashboard, create these products:

   **Product 1: Full Business Kit Unlock**
   - Name: "Project 67 - Full Business Kit"
   - Price: £33.50 (one-time payment)
   - Copy the Price ID (starts with `price_`)

   **Product 2: Website Hosting**
   - Name: "Website Hosting"
   - Price: £3.00 (recurring monthly)
   - Copy the Price ID

   **Product 3: 500 Credits**
   - Name: "500 Credits"
   - Price: £6.99 (one-time)
   - Copy the Price ID

   **Product 4: 1000 Credits**
   - Name: "1000 Credits"
   - Price: £12.99 (one-time)
   - Copy the Price ID

2. **Get API Keys**
   - Go to Developers > API keys
   - Copy Publishable key
   - Copy Secret key

3. **Set up Webhooks** (do this after deploying)
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the Webhook signing secret

### 5. Resend Setup (Optional but Recommended)

1. **Get API Key**
   - Go to [resend.com](https://resend.com)
   - Create account
   - Navigate to API Keys
   - Create new key
   - Copy the key

2. **Verify Domain** (for production)
   - Go to Domains
   - Add your domain
   - Add DNS records as instructed
   - Verify

### 6. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_ID_UNLOCK=price_...
STRIPE_PRICE_ID_HOSTING=price_...
STRIPE_PRICE_ID_CREDITS_500=price_...
STRIPE_PRICE_ID_CREDITS_1000=price_...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_here_use_uuid_generator
```

### 7. Test Locally

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

**Test the following:**

1. ✅ Landing page loads with animations
2. ✅ Sign up flow works
3. ✅ Progressive form saves data
4. ✅ Business Case generation works
5. ✅ Content Strategy generation works
6. ✅ Website template selection works
7. ✅ Checkout flow works (use test card: 4242 4242 4242 4242)

### 8. Deploy to Vercel

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit - Project 67"
git branch -M main
git remote add origin https://github.com/yourusername/project67.git
git push -u origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Add Environment Variables**
   - In Vercel project settings
   - Go to "Environment Variables"
   - Add all variables from your `.env.local`
   - Make sure to update `NEXT_PUBLIC_APP_URL` to your Vercel domain

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployed site

### 9. Configure Production Stripe Webhook

1. **Get your production URL**
   - Copy your Vercel domain (e.g., `https://project67.vercel.app`)

2. **Update Stripe Webhook**
   - Go to Stripe Dashboard > Webhooks
   - Update endpoint URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Copy new webhook secret
   - Update in Vercel environment variables

3. **Test Webhook**
   - Make a test purchase in production
   - Check Stripe Dashboard > Webhooks > Recent Events
   - Verify webhook succeeded

### 10. Production Checklist

Before launching to real users:

- [ ] All environment variables set in production
- [ ] Supabase RLS policies tested
- [ ] Stripe webhook working
- [ ] Test complete user flow
- [ ] Email notifications sending (if using Resend)
- [ ] Analytics set up (Vercel Analytics, etc.)
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Error monitoring set up (optional: Sentry)
- [ ] Backup strategy for database
- [ ] Rate limiting configured (if needed)

## 🧪 Testing

### Test Cards (Stripe)

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

### Test User Flow

1. Sign up with real email (check inbox)
2. Complete 7-step form
3. Generate Business Case (check OpenAI credits)
4. Generate Content Strategy
5. Select website template
6. Proceed to checkout
7. Complete purchase with test card
8. Verify webhook processed
9. Check dashboard access unlocked

## 🐛 Troubleshooting

### Issue: "Failed to generate business case"

**Solution:**
- Check OpenAI API key is correct
- Verify you have credits in OpenAI account
- Check API rate limits
- View logs: `npm run dev` and check console

### Issue: "Webhook signature verification failed"

**Solution:**
- Verify webhook secret matches Stripe
- Check webhook endpoint is publicly accessible
- Use Stripe CLI to test: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Issue: "Supabase RLS error"

**Solution:**
- Verify RLS policies are created
- Check user is authenticated
- View Supabase logs in dashboard
- Ensure service role key is used for admin operations

### Issue: Emails not sending

**Solution:**
- Verify Resend API key
- Check domain is verified (production)
- View Resend logs
- Check email is not in spam

## 📞 Support

If you encounter issues:

1. Check the main [README.md](README.md)
2. Review error logs in:
   - Browser console (F12)
   - Terminal running `npm run dev`
   - Vercel logs (production)
   - Supabase logs
   - Stripe webhook logs

3. Common fixes:
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check environment variables are loaded
   - Restart development server

## 🎉 Success!

If everything is working:

1. You should see the landing page
2. Be able to sign up and log in
3. Complete the form
4. Generate AI content
5. Make test purchases
6. Access the dashboard

**You're ready to launch! 🚀**

---

Last updated: 2025-01-XX

