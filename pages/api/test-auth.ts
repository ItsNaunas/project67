/**
 * Auth Diagnostic API
 * Tests the actual auth flow to identify issues
 * Visit: http://localhost:3000/api/test-auth?email=test@example.com&password=test123
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.query

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password',
      usage: 'Add ?email=your@email.com&password=yourpassword to the URL',
    })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: 'Missing Supabase environment variables',
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const results: any = {
    config: {
      url: supabaseUrl.replace(/https:\/\/([^.]+)\.supabase\.co/, 'https://***.supabase.co'),
      hasAnonKey: !!supabaseAnonKey,
      anonKeyLength: supabaseAnonKey.length,
    },
    tests: [],
  }

  // Test 1: Check if user exists
  try {
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
      // Admin API might not be available with anon key, that's expected
      results.tests.push({
        name: 'Check if user exists',
        status: 'skipped',
        message: 'Admin API requires service role key (expected)',
      })
    } else {
      const userExists = users?.users?.some((u: any) => u.email === email)
      results.tests.push({
        name: 'Check if user exists',
        status: userExists ? 'pass' : 'fail',
        message: userExists ? 'User found in database' : 'User not found - need to sign up first',
      })
    }
  } catch (err: any) {
    results.tests.push({
      name: 'Check if user exists',
      status: 'skipped',
      message: err.message,
    })
  }

  // Test 2: Try to sign in
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email as string,
      password: password as string,
    })

    if (error) {
      results.tests.push({
        name: 'Sign in attempt',
        status: 'fail',
        message: error.message,
        errorCode: error.status,
        errorName: error.name,
        details: {
          code: error.status,
          message: error.message,
        },
      })

      // Provide specific guidance based on error
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        results.guidance = [
          'The email or password is incorrect',
          'OR the user account does not exist',
          'OR email confirmation is required but not completed',
          'Try: 1) Sign up first if account doesn\'t exist, 2) Check email for confirmation link, 3) Verify password is correct',
        ]
      } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        results.guidance = [
          'Email confirmation is required',
          'Check your email inbox (and spam folder) for the confirmation link',
          'Click the link to confirm your email before logging in',
        ]
      } else if (error.status === 400) {
        results.guidance = [
          'Bad request - check email and password format',
          'Email should be valid format',
          'Password should be at least 6 characters',
        ]
      }
    } else {
      results.tests.push({
        name: 'Sign in attempt',
        status: 'pass',
        message: 'Successfully signed in!',
        hasSession: !!data.session,
        userId: data.user?.id,
      })
    }
  } catch (err: any) {
    results.tests.push({
      name: 'Sign in attempt',
      status: 'error',
      message: err.message,
    })
  }

  // Test 3: Check Supabase URL format
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (urlMatch) {
    results.tests.push({
      name: 'Supabase URL format',
      status: 'pass',
      message: `Valid format (Project: ${urlMatch[1]})`,
    })
  } else {
    results.tests.push({
      name: 'Supabase URL format',
      status: 'fail',
      message: 'URL format is incorrect',
    })
  }

  // Test 4: Check anon key format (should be JWT)
  if (supabaseAnonKey.startsWith('eyJ')) {
    results.tests.push({
      name: 'Anon key format',
      status: 'pass',
      message: 'Valid JWT format',
    })
  } else {
    results.tests.push({
      name: 'Anon key format',
      status: 'fail',
      message: 'Anon key should be a JWT (starts with eyJ)',
    })
  }

  return res.status(200).json(results)
}

