import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Create browser client - automatically reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createPagesBrowserClient()

// Verify environment variables are available (for debugging)
if (typeof window !== 'undefined') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('⚠️ Supabase environment variables missing!', {
      hasUrl: !!url,
      hasAnonKey: !!key,
    })
  } else {
    console.log('✅ Supabase client initialized', {
      url: url.replace(/https:\/\/([^.]+)\.supabase\.co/, 'https://***.supabase.co'),
      hasAnonKey: !!key,
    })
  }
}

// For server-side operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

