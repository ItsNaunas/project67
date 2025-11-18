/**
 * Supabase Setup Verification Script
 * Run with: npx ts-node lib/supabase/verify_setup.ts
 * Or: node -r ts-node/register lib/supabase/verify_setup.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...\n')

  // 1. Check connection
  console.log('1. Testing connection...')
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error && error.code !== 'PGRST116') {
      console.error('   ❌ Connection failed:', error.message)
      return false
    }
    console.log('   ✅ Connection successful')
  } catch (err: any) {
    console.error('   ❌ Connection error:', err.message)
    return false
  }

  // 2. Check required tables
  console.log('\n2. Checking database tables...')
  const requiredTables = ['profiles', 'dashboards', 'generations', 'transactions', 'email_notifications']
  const missingTables: string[] = []

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error && error.code === '42P01') {
        missingTables.push(table)
        console.log(`   ❌ Table missing: ${table}`)
      } else if (error && error.code !== 'PGRST116') {
        console.log(`   ⚠️  Table ${table} has issues: ${error.message}`)
      } else {
        console.log(`   ✅ Table exists: ${table}`)
      }
    } catch (err: any) {
      console.log(`   ⚠️  Could not check table ${table}: ${err.message}`)
    }
  }

  if (missingTables.length > 0) {
    console.error(`\n   ❌ Missing tables: ${missingTables.join(', ')}`)
    console.error('   Run lib/supabase/schema.sql in Supabase SQL Editor')
    return false
  }

  // 3. Check auth configuration
  console.log('\n3. Checking auth configuration...')
  try {
    // Try to get auth settings (this might not work with anon key, but worth trying)
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('   ℹ️  Auth check (expected to fail without session):', authError.message)
    } else {
      console.log('   ✅ Auth service is accessible')
    }
  } catch (err: any) {
    console.log('   ℹ️  Auth check:', err.message)
  }

  // 4. Check RLS policies
  console.log('\n4. Checking Row Level Security...')
  try {
    // Try to access profiles without auth (should fail if RLS is enabled)
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    if (error && error.code === '42501') {
      console.log('   ✅ RLS is enabled (access denied without auth - expected)')
    } else if (error) {
      console.log(`   ⚠️  RLS check: ${error.message}`)
    } else {
      console.log('   ⚠️  RLS might not be properly configured (data accessible without auth)')
    }
  } catch (err: any) {
    console.log('   ⚠️  Could not verify RLS:', err.message)
  }

  // 5. Check environment variables format
  console.log('\n5. Checking environment variables...')
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (urlMatch) {
    console.log(`   ✅ Supabase URL format correct (Project: ${urlMatch[1]})`)
  } else {
    console.log('   ⚠️  Supabase URL format might be incorrect')
  }

  if (supabaseAnonKey.startsWith('eyJ')) {
    console.log('   ✅ Anon key format appears correct (JWT)')
  } else {
    console.log('   ⚠️  Anon key format might be incorrect')
  }

  console.log('\n✅ Setup verification complete!')
  console.log('\n📝 Next steps if issues found:')
  console.log('   1. Check Supabase Dashboard → Settings → API')
  console.log('   2. Verify environment variables in .env.local')
  console.log('   3. Run schema.sql in Supabase SQL Editor if tables are missing')
  console.log('   4. Check Authentication → Providers → Email is enabled')
  console.log('   5. Verify email confirmation settings in Authentication → Settings')

  return true
}

verifySetup()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })

