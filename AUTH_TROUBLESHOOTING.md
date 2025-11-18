# Authentication Troubleshooting Guide

## Quick Diagnosis

### Step 1: Test Your Auth Setup

Visit this URL (replace with your test email/password):
```
http://localhost:3000/api/test-auth?email=your@email.com&password=yourpassword
```

This will show you:
- ✅ If environment variables are set correctly
- ✅ If the user exists
- ✅ The exact error message from Supabase
- ✅ Specific guidance on how to fix it

### Step 2: Check Supabase Dashboard

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**
3. **Check Authentication → Users**:
   - Does the user exist?
   - Is the email confirmed? (check `email_confirmed_at` column)
   - What's the user's status?

4. **Check Authentication → Providers → Email**:
   - ✅ Is Email provider **enabled**?
   - ✅ Is "Confirm email" **enabled** or **disabled**?
     - If **enabled**: Users MUST confirm email before login
     - If **disabled**: Users can login immediately

## Common Issues & Solutions

### Issue 1: "Invalid login credentials" (400 error)

**Possible Causes:**

1. **User doesn't exist**
   - **Solution**: Sign up first, then try logging in
   - **Check**: Go to Supabase Dashboard → Authentication → Users

2. **Wrong password**
   - **Solution**: Use "Forgot password" or reset password in Supabase Dashboard
   - **Check**: Verify password is correct

3. **Email confirmation required but not done**
   - **Solution**: 
     - Check your email inbox (and spam folder)
     - Click the confirmation link
     - Or disable email confirmation in Supabase Dashboard
   - **Check**: Supabase Dashboard → Authentication → Users → Check `email_confirmed_at`

4. **Email case sensitivity**
   - **Solution**: The code now normalizes emails (lowercase), but double-check
   - **Check**: Make sure you're using the exact email you signed up with

### Issue 2: Environment Variables Not Set

**Symptoms:**
- Console shows "Missing Supabase environment variables"
- Auth doesn't work at all

**Solution:**
1. Create `.env.local` in project root
2. Add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Get these from: Supabase Dashboard → Settings → API
4. **Restart your dev server** after adding env vars

### Issue 3: Email Confirmation Required

**Symptoms:**
- Sign up works but login fails
- Error mentions "email not confirmed"

**Solution:**

**Option A: Confirm the email**
1. Check your email inbox
2. Click the confirmation link
3. Try logging in again

**Option B: Disable email confirmation (for development)**
1. Go to Supabase Dashboard
2. Authentication → Providers → Email
3. Toggle "Confirm email" to **OFF**
4. Save

**Option C: Manually confirm in Supabase Dashboard**
1. Go to Authentication → Users
2. Find your user
3. Click the user
4. Click "Confirm email" button

### Issue 4: Supabase Client Not Initialized

**Symptoms:**
- "Authentication service is not available" error
- Console shows Supabase client errors

**Solution:**
1. Check browser console for errors
2. Verify environment variables are loaded (check Network tab)
3. Clear browser cache and refresh
4. Restart dev server

## Testing the Fix

After making changes:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart dev server**: `npm run dev`
3. **Try signing up** with a new email
4. **Check Supabase Dashboard** → Authentication → Users
5. **Try logging in**

## Debug Checklist

- [ ] Environment variables set in `.env.local`
- [ ] Dev server restarted after adding env vars
- [ ] Supabase URL format is correct (`https://xxx.supabase.co`)
- [ ] Anon key is correct (starts with `eyJ`)
- [ ] Email provider is enabled in Supabase
- [ ] User exists in Supabase Dashboard
- [ ] Email is confirmed (if confirmation is required)
- [ ] Password is correct
- [ ] Browser console shows no errors
- [ ] Network tab shows auth requests going to correct URL

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Check Network tab** in DevTools:
   - Look for requests to `supabase.co/auth/v1/token`
   - Check the response status and body
3. **Use the test endpoint**: `/api/test-auth?email=...&password=...`
4. **Check Supabase Dashboard → Logs** for server-side errors

## Quick Test Script

Open browser console and run:

```javascript
// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Try to sign in
supabase.auth.signInWithPassword({
  email: 'your@email.com',
  password: 'yourpassword'
}).then(({ data, error }) => {
  console.log('Result:', { data, error })
})
```

