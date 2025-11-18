# Supabase Setup Verification Guide

This guide helps you verify your Supabase configuration and diagnose authentication issues.

## Quick Verification (Recommended)

### Option 1: Use the Verification API

1. **Start your dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Visit the verification endpoint**:
   Open your browser and go to:
   ```
   http://localhost:3000/api/verify-supabase
   ```

   This will show you a JSON response with all checks:
   - ✅ Environment variables
   - ✅ Database connection
   - ✅ Required tables
   - ✅ Row Level Security (RLS)
   - ✅ Auth service

### Option 2: Use Supabase CLI

#### Install Supabase CLI (Windows)

**Option A: Using Scoop (Recommended)**
```powershell
# Install Scoop if you don't have it
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option B: Using Chocolatey**
```powershell
choco install supabase
```

**Option C: Direct Download**
1. Go to: https://github.com/supabase/cli/releases
2. Download the Windows binary
3. Add to your PATH

#### Login to Supabase CLI

```bash
supabase login
```

This will open your browser to authenticate.

#### Link Your Project

You'll need your **Project Reference ID** from your Supabase URL:
- Your URL: `https://xxxxx.supabase.co`
- Project Ref: `xxxxx`

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

#### Verify Database

```bash
# Check database status
supabase db remote status

# Check migrations
supabase migration list

# Generate TypeScript types from your schema
supabase gen types typescript --linked > types/supabase.ts
```

## Common Issues & Solutions

### 1. "Invalid login credentials" Error

**Check these in Supabase Dashboard:**

1. **Authentication → Providers → Email**
   - ✅ Email provider is **enabled**
   - ✅ Check "Confirm email" setting:
     - If **enabled**: Users must confirm email before login
     - If **disabled**: Users can login immediately

2. **Authentication → Settings**
   - ✅ Site URL is set correctly
   - ✅ Redirect URLs include your domain

3. **Verify user exists:**
   - Go to Authentication → Users
   - Check if the email exists
   - If email confirmation is required, check if email is confirmed

### 2. Missing Environment Variables

Check your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get these from:**
- Supabase Dashboard → Settings → API

### 3. Missing Database Tables

If tables are missing, run the schema:

1. Go to Supabase Dashboard → SQL Editor
2. Open `lib/supabase/schema.sql`
3. Copy and paste the entire content
4. Click "Run"

### 4. RLS (Row Level Security) Issues

Verify RLS policies are enabled:
```sql
-- Check if RLS is enabled on tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

## Manual Database Checks

You can also run SQL queries directly in Supabase SQL Editor:

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check RLS policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check auth users:
```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

## Testing Authentication Flow

1. **Sign Up Test:**
   - Try creating a new account
   - Check if confirmation email is sent (if enabled)
   - Verify user appears in Authentication → Users

2. **Sign In Test:**
   - Use correct email/password
   - If email confirmation is required, confirm email first
   - Check browser console for detailed errors

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for detailed error messages
   - The improved error handling will show specific issues

## Next Steps

After verification:

1. ✅ All checks pass → Your setup is correct
2. ⚠️ Warnings → Review and fix as needed
3. ❌ Errors → Follow the error messages to fix issues

If you're still having issues after verification, check:
- Browser console for detailed errors
- Supabase Dashboard → Logs for server-side errors
- Network tab in DevTools for API request/response details

