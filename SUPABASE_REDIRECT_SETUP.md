# Supabase Redirect URL Configuration

## Problem
Supabase auth email links are redirecting to `localhost` instead of your production domain.

## Solution

### 1. Update Supabase Dashboard Settings

Go to your Supabase project dashboard:

1. Navigate to **Authentication** → **URL Configuration**
2. Update the following settings:

#### Site URL
```
https://your-domain.vercel.app
```
Replace `your-domain.vercel.app` with your actual Vercel domain.

#### Redirect URLs
Add the following URLs (one per line):
```
https://your-domain.vercel.app/generate
https://your-domain.vercel.app/**
http://localhost:3000/generate
http://localhost:3000/**
```

**Why both?**
- Production URLs for live site
- Localhost URLs for local development

### 2. Custom Domain (Optional)

If you're using a custom domain:

#### Site URL
```
https://yourdomain.com
```

#### Redirect URLs
```
https://yourdomain.com/generate
https://yourdomain.com/**
http://localhost:3000/generate
http://localhost:3000/**
```

### 3. Code Changes (Already Applied)

The `AuthModal.tsx` has been updated to automatically use the correct redirect URL based on the environment:

```typescript
const redirectUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/generate`
  : undefined
```

This ensures:
- ✅ Production emails redirect to production domain
- ✅ Local development emails redirect to localhost
- ✅ No manual environment variable needed

### 4. Environment Variables

Make sure these are set in your Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Testing

After configuration:

1. Deploy your changes to Vercel
2. Test signup on production domain
3. Check email link - should redirect to `https://your-domain.vercel.app/generate`
4. Test locally - should redirect to `http://localhost:3000/generate`

## Common Issues

### Email still redirecting to localhost
- Clear your browser cache
- Check Supabase dashboard URL configuration
- Wait 5 minutes for Supabase cache to clear

### Email confirmation not working
- Verify email template in Supabase → Authentication → Email Templates
- Check that redirect URLs match exactly (including https://)

### Wildcard not working
- Make sure you're using `**` (double asterisk) not single `*`
- Include both exact paths and wildcards

## Sign In Modal Issue Fixed

The sign in button now properly opens the modal with the correct mode:
- "Sign In" button → Opens modal in sign-in mode
- "Get Started" button → Opens modal in sign-up mode

This was fixed by adding a `useEffect` that updates the modal mode when it opens.

