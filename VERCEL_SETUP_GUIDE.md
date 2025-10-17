# 🚀 Vercel Setup Guide - CRITICAL STEPS

## ⚠️ Issues Fixed

I found and fixed **build errors** that were preventing Vercel deployment:

### Issues Resolved ✅
1. **Invalid Stripe API version** → Fixed to `'2024-06-20'`
2. **Missing onClick prop in Card component** → Added to TypeScript interface
3. **Static generation errors** → Added `getServerSideProps` to auth pages
4. **Router.query errors** → Prevented static generation for pages needing query params

### Build Status
- ✅ Local build passes successfully
- ✅ All TypeScript errors resolved
- ✅ Code pushed to GitHub

---

## 🔴 CRITICAL: Add Environment Variables in Vercel

**Your deployment will STILL FAIL** until you add environment variables!

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find your project: `project67`
   - Click on it

2. **Navigate to Settings**
   - Click "Settings" tab at the top
   - Click "Environment Variables" in the left sidebar

3. **Add These Variables** (Click "Add New" for each)

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Copy from your .env.local file]
Environment: Production, Preview, Development ✓ (check all)

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: [Copy from your .env.local file]
Environment: Production, Preview, Development ✓ (check all)

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Copy from your .env.local file]
Environment: Production, Preview, Development ✓ (check all)

Name: OPENAI_API_KEY
Value: [Copy from your .env.local file]
Environment: Production, Preview, Development ✓ (check all)

Name: NEXT_PUBLIC_DEV_MODE
Value: true
Environment: Production, Preview, Development ✓ (check all)

Name: NEXT_PUBLIC_APP_URL
Value: https://your-project-name.vercel.app
Environment: Production, Preview, Development ✓ (check all)
```

**⚠️ IMPORTANT:** 
- Copy values EXACTLY from your `.env.local` file
- Make sure to select all 3 environments (Production, Preview, Development)
- For `NEXT_PUBLIC_APP_URL`, you'll need to update this after first deployment

4. **Save All Variables**
   - Click "Save" after adding each variable

5. **Redeploy**
   - Go to "Deployments" tab
   - Find the latest failed deployment
   - Click the "..." menu
   - Click "Redeploy"
   - OR push a new commit to trigger auto-deployment

---

## 📋 Post-Deployment Checklist

### After First Successful Deployment:

1. **Copy Your Vercel URL**
   - Example: `https://project67-xyz123.vercel.app`

2. **Update Environment Variables**
   - Go back to Settings → Environment Variables
   - Edit `NEXT_PUBLIC_APP_URL`
   - Replace with your actual Vercel URL
   - Click "Save"
   - Redeploy again

3. **Update Supabase**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - **Site URL:** `https://your-project.vercel.app`
   - **Redirect URLs:** Add these:
     ```
     https://your-project.vercel.app/**
     https://your-project.vercel.app/generate
     https://your-project.vercel.app/dashboard
     https://your-project.vercel.app/success
     ```

4. **Test Your Deployment**
   - Visit your Vercel URL
   - Try signing up/logging in
   - Create a new business
   - Generate business case
   - Verify everything works

---

## 🐛 If Deployment Still Fails

### Check Vercel Build Logs

Look for these specific errors:

**1. Missing Environment Variables**
```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY 
env variables are required!
```
**Solution:** You didn't add all environment variables. Go back to step 3 above.

**2. Invalid Environment Variable Values**
```
Error: Invalid Supabase URL
```
**Solution:** Check you copied the EXACT values from `.env.local`

**3. OpenAI API Error**
```
Error: Failed to generate business case
```
**Solution:** Check your OpenAI API key is valid and has credits

---

## ✅ Expected Behavior After Fix

### Successful Build Output:
```
Route (pages)                              Size     First Load JS
┌ ○ / (349 ms)                             22.2 kB         188 kB
├   /_app                                  0 B             128 kB
├ ○ /404                                   180 B           128 kB
├ ƒ /checkout                              3.11 kB         169 kB
├ ƒ /dashboard                             5.51 kB         172 kB
├ ƒ /generate                              4.88 kB         171 kB
├ ƒ /success                               5.34 kB         172 kB
└ ƒ /tabs                                  49.5 kB         216 kB
```

**Key:** `ƒ` means server-rendered (correct for auth pages)

---

## 📊 Your Current Environment Variables

### What You Have in .env.local:

```env
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ OPENAI_API_KEY
✅ NEXT_PUBLIC_DEV_MODE=true
✅ NEXT_PUBLIC_APP_URL
```

**Copy ALL of these to Vercel!**

---

## 🎉 Once Working

Your app will be live at:
```
https://your-project-name.vercel.app
```

### Features That Will Work:
- ✅ Sign up / Login
- ✅ Create new business
- ✅ Generate business case (using OpenAI)
- ✅ Generate content strategy
- ✅ Select website template
- ✅ "Purchase" (dev mode bypasses Stripe)

### To Enable Real Payments Later:
1. Add Stripe environment variables
2. Set `NEXT_PUBLIC_DEV_MODE=false`
3. Configure Stripe webhook
4. Redeploy

---

## 📞 Need Help?

Common issues and solutions:

| Error | Solution |
|-------|----------|
| Missing env vars | Add ALL variables in Vercel dashboard |
| Auth not working | Update Supabase redirect URLs |
| OpenAI failing | Check API key and credits |
| 404 on pages | Clear build cache and redeploy |

---

**Next Step:** Go add those environment variables in Vercel NOW! 🚀

Then click "Redeploy" and watch it succeed! 🎉

