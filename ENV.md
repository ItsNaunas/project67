# Environment Variables Setup

This file documents all required environment variables for Project 67.

## Required Variables

Create a `.env.local` file in the root directory with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI Configuration (REQUIRED for AI generation)
OPENAI_API_KEY=your-openai-api-key

# Development Mode (set to 'true' to skip payment checks)
NEXT_PUBLIC_DEV_MODE=true

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Optional Variables (for payments)

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PRICE_ID=your-stripe-price-id

# Resend Email Configuration
RESEND_API_KEY=your-resend-api-key
```

## Getting Your API Keys

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to Settings > API
4. Copy the URL and keys

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key
4. Make sure you have credits in your account

### Development Mode
- Set `NEXT_PUBLIC_DEV_MODE=true` to test without payment setup
- This allows unlimited regenerations without Stripe
- Switch to `false` when ready for production

## Troubleshooting

### "Failed to generate" errors
- Missing or invalid `OPENAI_API_KEY`
- No credits in OpenAI account
- Rate limit exceeded

### "Database error" 
- Missing Supabase credentials
- Database schema not set up (run `lib/supabase/schema.sql`)

### "Webhook failed"
- Only needed for production payments
- Can skip in dev mode

