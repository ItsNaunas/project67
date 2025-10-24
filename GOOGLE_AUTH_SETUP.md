# 🔐 Google Sign-In Setup Guide

Your code already supports Google OAuth! You just need to configure it in Google Cloud and Supabase.

---

## 📋 Step-by-Step Setup

### **Step 1: Set Up Google Cloud Project**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click dropdown at top
   - Click "New Project"
   - Name it: "Project 67" or "LaunchKit"
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click it and press "Enable"

---

### **Step 2: Create OAuth Credentials**

1. **Go to Credentials Page**
   - Left sidebar: "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"

2. **Configure OAuth Consent Screen** (if prompted)
   - Click "Configure Consent Screen"
   - Choose "External" (unless you have a Google Workspace)
   - Click "Create"

3. **Fill in OAuth Consent Screen**
   - **App name**: Project 67
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Leave other fields optional
   - Click "Save and Continue"
   - Click "Save and Continue" on Scopes (no need to add any)
   - Click "Save and Continue" on Test users
   - Click "Back to Dashboard"

4. **Create OAuth Client ID**
   - Go back to "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - **Application type**: Web application
   - **Name**: Project 67 Web Client

5. **Add Authorized Redirect URIs**
   
   You need to add these URLs (get from Supabase):
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   
   **To get your redirect URL:**
   - Go to your Supabase project
   - Settings > API
   - Copy the "URL" (looks like `https://xxxxx.supabase.co`)
   - Add `/auth/v1/callback` to the end
   
   Example: `https://abcdefghijk.supabase.co/auth/v1/callback`
   
   **Also add for local development:**
   ```
   http://localhost:3002/
   ```

6. **Create Credentials**
   - Click "Create"
   - **SAVE THESE!** You'll need them:
     - Client ID (looks like: ``)
     - Client Secret (looks like: ``)

---

### **Step 3: Configure Supabase**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Left sidebar: "Authentication"
   - Click "Providers"
   - Scroll down to "Google"

3. **Enable Google Provider**
   - Toggle "Enable Sign in with Google" to **ON**

4. **Add Your Google Credentials**
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
   - Click "Save"

---

### **Step 4: Update Your Code (Already Done!)**

The code is already in place in `components/AuthModal.tsx`:

```tsx
const handleGoogleSignIn = async () => {
  setLoading(true)
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/generate`,
      },
    })
    if (error) throw error
  } catch (err: any) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

✅ **No code changes needed!**

---

## 🧪 Test It

1. **Run your app**: `npm run dev`
2. **Go to**: http://localhost:3002
3. **Click**: "Sign In" or "Get Started"
4. **Click**: "Sign in with Google" button
5. **See**: Google sign-in popup
6. **Sign in**: With your Google account
7. **Redirected**: To `/generate` page

---

## 🔧 Troubleshooting

### **Error: "redirect_uri_mismatch"**

**Problem**: Your redirect URI doesn't match what's configured in Google Cloud

**Solution**: 
1. Check the error URL - it shows what Google received
2. Make sure in Google Cloud Console > Credentials > Your OAuth Client:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` is added
   - `http://localhost:3002` is added (for local testing)

### **Error: "Invalid login credentials"**

**Problem**: Wrong Client ID or Secret in Supabase

**Solution**:
1. Double-check you copied the FULL Client ID from Google Cloud
2. Double-check you copied the FULL Client Secret
3. Make sure there are no extra spaces
4. Click "Save" in Supabase after pasting

### **Error: "Access blocked: This app's request is invalid"**

**Problem**: OAuth Consent Screen not published

**Solution**:
1. Go to Google Cloud Console > APIs & Services > OAuth consent screen
2. Under "Publishing status", click "Publish App"
3. Confirm (it's fine for development)

### **Google sign-in popup blocked**

**Problem**: Browser blocking popups

**Solution**:
1. Allow popups for localhost
2. Or use a different browser
3. Check browser console for errors

---

## 🎯 Quick Checklist

Before testing, make sure:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created
- [ ] Redirect URI added: `https://xxxxx.supabase.co/auth/v1/callback`
- [ ] Redirect URI added: `http://localhost:3002`
- [ ] Client ID copied to Supabase
- [ ] Client Secret copied to Supabase
- [ ] Google provider enabled in Supabase
- [ ] Supabase settings saved

---

## 📝 What Happens When User Signs In With Google

1. **User clicks** "Sign in with Google"
2. **Popup opens** with Google sign-in
3. **User selects** Google account
4. **Google redirects** to Supabase callback URL
5. **Supabase creates** user account automatically
6. **Supabase redirects** to `/generate` page
7. **Profile created** in your `profiles` table (via trigger)
8. **User is logged in!**

---

## 🔐 Security Notes

### **For Production:**

1. **Add your production domain** to Google Cloud redirect URIs:
   ```
   https://yourdomain.com
   ```

2. **Update redirect in Supabase**:
   ```
   https://yourdomain.com/generate
   ```

3. **Verify your domain** in Google Cloud Console

4. **Publish OAuth consent screen** for public use

---

## 💡 Pro Tips

### **Multiple Domains**

You can add multiple redirect URIs:
- `http://localhost:3002` (development)
- `https://project67.vercel.app` (staging)
- `https://yourdomain.com` (production)

### **Branding**

In Google Cloud Console > OAuth consent screen:
- Add your logo (120x120px PNG)
- Add app homepage
- Add privacy policy URL
- Add terms of service URL

This makes your OAuth popup look more professional!

---

## 🎨 The Button Design

Your Google sign-in button already has the proper styling:

```tsx
<Button
  type="button"
  variant="ghost"
  className="w-full"
  onClick={handleGoogleSignIn}
  disabled={loading}
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* Google icon */}
  </svg>
  Sign in with Google
</Button>
```

With the mint/black theme applied!

---

## ✅ Final Result

After setup, users can:
- Click "Sign in with Google"
- Choose their Google account
- Automatically create account
- Skip email verification
- Get redirected to generate page
- Start building their business!

**One-click sign up = Better conversion! 🚀**

---

## 📞 Need Help?

If you get stuck:

1. Check Supabase logs (Dashboard > Logs > Auth)
2. Check browser console for errors
3. Check Google Cloud Console > APIs & Services > Credentials
4. Verify all URLs match exactly (no trailing slashes)

---

**Estimated setup time**: 5-10 minutes

**Worth it?**: Absolutely! Google sign-in increases conversions by 30-50% 📈

