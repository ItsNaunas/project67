/**
 * Supabase Setup Verification API
 * Visit: http://localhost:3000/api/verify-supabase
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

type VerificationResult = {
  success: boolean
  checks: {
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
  }[]
  errors?: string[]
  warnings?: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResult>
) {
  const checks: VerificationResult['checks'] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Check 1: Environment Variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    checks.push({
      name: 'Environment Variables',
      status: 'fail',
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    })
    errors.push('Environment variables not configured')
    return res.status(500).json({ success: false, checks, errors, warnings })
  }

  checks.push({
    name: 'Environment Variables',
    status: 'pass',
    message: 'All required environment variables are set',
  })

  // Validate URL format
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!urlMatch) {
    checks.push({
      name: 'Supabase URL Format',
      status: 'warning',
      message: 'URL format might be incorrect',
    })
    warnings.push('Supabase URL format validation failed')
  } else {
    checks.push({
      name: 'Supabase URL Format',
      status: 'pass',
      message: `Valid URL format (Project: ${urlMatch[1]})`,
    })
  }

  // Check 2: Create client and test connection
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Test basic connection
    const { error: connectionError } = await supabase.from('profiles').select('count').limit(0)
    
    if (connectionError && connectionError.code === '42P01') {
      checks.push({
        name: 'Database Connection',
        status: 'fail',
        message: 'Cannot connect - tables might not exist',
      })
      errors.push('Database tables not found. Run schema.sql in Supabase SQL Editor.')
    } else if (connectionError) {
      checks.push({
        name: 'Database Connection',
        status: 'warning',
        message: `Connection issue: ${connectionError.message}`,
      })
      warnings.push(connectionError.message)
    } else {
      checks.push({
        name: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to Supabase',
      })
    }
  } catch (err: any) {
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Connection error: ${err.message}`,
    })
    errors.push(err.message)
  }

  // Check 3: Verify required tables
  const requiredTables = ['profiles', 'dashboards', 'generations', 'transactions', 'email_notifications']
  const missingTables: string[] = []

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error && error.code === '42P01') {
        missingTables.push(table)
      } else if (error && error.code !== 'PGRST116') {
        warnings.push(`Table ${table}: ${error.message}`)
      }
    } catch (err: any) {
      warnings.push(`Could not check table ${table}: ${err.message}`)
    }
  }

  if (missingTables.length > 0) {
    checks.push({
      name: 'Database Tables',
      status: 'fail',
      message: `Missing tables: ${missingTables.join(', ')}`,
    })
    errors.push(`Run lib/supabase/schema.sql to create missing tables`)
  } else {
    checks.push({
      name: 'Database Tables',
      status: 'pass',
      message: 'All required tables exist',
    })
  }

  // Check 4: Test RLS (Row Level Security)
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    if (error && error.code === '42501') {
      checks.push({
        name: 'Row Level Security',
        status: 'pass',
        message: 'RLS is enabled (access denied without auth - correct)',
      })
    } else if (error) {
      checks.push({
        name: 'Row Level Security',
        status: 'warning',
        message: `RLS check: ${error.message}`,
      })
    } else {
      checks.push({
        name: 'Row Level Security',
        status: 'warning',
        message: 'RLS might not be properly configured (data accessible without auth)',
      })
      warnings.push('RLS policies might need review')
    }
  } catch (err: any) {
    checks.push({
      name: 'Row Level Security',
      status: 'warning',
      message: `Could not verify RLS: ${err.message}`,
    })
  }

  // Check 5: Auth service test
  try {
    const { error: authError } = await supabase.auth.getSession()
    if (authError && authError.message.includes('JWT')) {
      checks.push({
        name: 'Auth Service',
        status: 'warning',
        message: 'Auth service accessible (JWT validation expected without session)',
      })
    } else {
      checks.push({
        name: 'Auth Service',
        status: 'pass',
        message: 'Auth service is accessible',
      })
    }
  } catch (err: any) {
    checks.push({
      name: 'Auth Service',
      status: 'warning',
      message: `Auth check: ${err.message}`,
    })
  }

  const success = errors.length === 0

  return res.status(success ? 200 : 500).json({
    success,
    checks,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  })
}

