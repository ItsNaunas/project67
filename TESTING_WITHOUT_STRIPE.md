# Testing Project 67 Without Stripe

This guide shows you how to test the full application without setting up Stripe payments.

## 🚧 Development Mode Enabled

I've added a **DEV_MODE** that bypasses all payment requirements so you can test the complete user flow.

## ✅ What's Changed

### 1. Environment Variable
Added `NEXT_PUBLIC_DEV_MODE=true` to `.env.local`

When this is set to `true`:
- ✅ Unlimited regenerations (no 1-regeneration limit)
- ✅ Unlimited dashboards (no credit requirement)
- ✅ Can manually unlock full access with one click
- ✅ No Stripe integration needed

### 2. Modified Pages

**Tabs Page** (`pages/tabs.tsx`)
- Shows "Development Mode" message instead of checkout
- Button to instantly unlock full access
- No payment required

**Dashboard** (`pages/dashboard.tsx`)
- Unlimited dashboard creation
- No credit deduction
- Shows "Dev Mode" indicator

**API Generate** (`pages/api/generate.ts`)
- Skips regeneration limit checks
- Allows unlimited AI generations

## 🎯 How to Test

### Step 1: Set Up Required Services
You still need these (no payment features):

```env
# .env.local

# Supabase (Required for auth and database)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI (Required for AI generation)
OPENAI_API_KEY=sk-your_key

# Dev Mode (Bypass payments)
NEXT_PUBLIC_DEV_MODE=true

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 2: Test the Full Flow

1. **Go to** http://localhost:3001
2. **Click** "Start Now"
3. **Sign up** with email
4. **Complete** the 7-step form
5. **Generate** Business Case (unlimited times!)
6. **Generate** Content Strategy (unlimited times!)
7. **Select** Website Template
8. **Click** "Enable Unlimited Access (Dev Mode)" button
9. **Access** full dashboard
10. **Create** multiple businesses (no limits!)

## 🔄 What You Can Test Without Stripe

✅ **Full User Flow**
- Landing page
- Sign up / Sign in
- Progressive form
- AI generations
- Template selection
- Dashboard access
- Multiple dashboards

✅ **AI Features**
- Business Case generation
- Content Strategy generation
- Unlimited regenerations
- Multiple businesses

✅ **User Features**
- Profile management
- Dashboard overview
- Progress tracking
- All UI/UX elements

❌ **What You Can't Test**
- Actual payment processing
- Stripe webhooks
- Credit purchases
- Hosting subscriptions
- Payment confirmation emails

## 🔐 Switching Back to Production Mode

When you're ready to add Stripe:

### Step 1: Update .env.local
```env
NEXT_PUBLIC_DEV_MODE=false

# Add your Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2: Create Stripe Products
See `SETUP.md` for detailed Stripe setup instructions.

### Step 3: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Test Payment Flow
- Complete the form
- Generate content
- Click "Unlock Full Access" 
- Use test card: `4242 4242 4242 4242`

## 📝 Notes

### Database
Even in dev mode, data is still saved to Supabase:
- User profiles
- Dashboards
- Generations
- Everything except transactions

### AI Credits
OpenAI charges are real even in dev mode. Each generation costs ~$0.01-0.05 depending on length.

### Security
Dev mode should ONLY be used in development. Never deploy with `NEXT_PUBLIC_DEV_MODE=true` to production!

## 🐛 Troubleshooting

**Problem**: Still seeing payment screens
**Solution**: Check `.env.local` has `NEXT_PUBLIC_DEV_MODE=true` and restart server

**Problem**: "Regeneration limit reached" error
**Solution**: Restart dev server to pick up new environment variables

**Problem**: Can't create multiple dashboards
**Solution**: Verify dev mode is enabled in `.env.local`

## ✨ Benefits of Dev Mode

1. **Faster Testing** - No payment setup needed
2. **Unlimited Testing** - Test all features freely
3. **Easy Switching** - One variable to enable/disable
4. **Safe Testing** - No risk of accidental charges
5. **Team Friendly** - Developers don't need Stripe access

## 🚀 Ready When You Are

When you're ready to add Stripe:
1. Set `NEXT_PUBLIC_DEV_MODE=false`
2. Add Stripe keys
3. Create products in Stripe
4. Test with Stripe test cards
5. Deploy!

---

**Current Status**: 🚧 Dev Mode Enabled - Test away! 🎉

