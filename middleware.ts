/**
 * Next.js Middleware - Route Protection
 * Uses allow-list pattern for security
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Allow-list: Define which routes require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/generate',
  '/tabs',
  '/checkout',
  '/success'
]

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  '/',
  '/api/webhooks/stripe', // Webhooks are authenticated via signature
  '/_next',
  '/favicon.ico'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const pathname = req.nextUrl.pathname

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return res
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Get session
    const { data: { session } } = await supabase.auth.getSession()

    // Redirect to home if not authenticated
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

