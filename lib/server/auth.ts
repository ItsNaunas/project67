/**
 * Server-only authentication utilities
 * NEVER import this in client components
 */

import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest } from 'next'

// Server-side Supabase client (uses service role for admin operations)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Get authenticated user from request
 * Returns user or null if not authenticated
 */
export async function getUser(req: NextApiRequest) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) return null
    
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Require authenticated user - throws if not authenticated
 * Use this at the start of protected API routes
 */
export async function requireUser(req: NextApiRequest) {
  const user = await getUser(req)
  
  if (!user) {
    const error = new Error('Unauthorized') as Error & { statusCode: number }
    error.statusCode = 401
    throw error
  }
  
  return user
}

/**
 * Check if user owns a resource
 * Prevents unauthorized access to other users' data
 */
export async function requireOwnership(userId: string, resourceUserId: string) {
  if (userId !== resourceUserId) {
    const error = new Error('Forbidden: You do not own this resource') as Error & { statusCode: number }
    error.statusCode = 403
    throw error
  }
}

/**
 * Check if user has purchased
 * Use for premium feature gates
 */
export async function requirePurchase(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('has_purchased')
    .eq('id', userId)
    .single()

  if (!profile?.has_purchased && process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
    const error = new Error('Upgrade required') as Error & { statusCode: number }
    error.statusCode = 402
    throw error
  }

  return true
}

/**
 * Get Supabase admin client (server-side only)
 */
export function getSupabaseAdmin() {
  return supabaseAdmin
}

