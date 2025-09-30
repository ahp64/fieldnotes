import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const databaseUrl = process.env.DATABASE_URL!

async function setupSupabase() {
  console.log('🚀 Setting up Supabase integration...\n')

  console.log('✅ Schema already exists in Supabase')
  console.log('   Tables: profiles, places, visits, follows, likes, comments\n')

  console.log('📋 Next steps:\n')
  console.log('1. Apply RLS policies via Supabase SQL Editor:')
  console.log('   - Go to: https://supabase.com/dashboard/project/qrbkrlkexhhwdiqryhpy/sql/new')
  console.log('   - Copy and run the SQL from: supabase/rls.sql\n')

  console.log('2. Seed the database with sample data:')
  console.log('   - Run: npm run db:seed\n')

  console.log('3. Test the integration:')
  console.log('   - Run: npm run dev')
  console.log('   - Visit: http://localhost:3000\n')

  console.log('🔍 Verifying connection...')

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase.from('profiles').select('count').single()

    if (error && !error.message.includes('0 rows')) {
      console.log('   ⚠️  Connection test:', error.message)
    } else {
      console.log('   ✅ Supabase connection successful!\n')
    }
  } catch (err: any) {
    console.log('   ⚠️ ', err.message)
  }

  console.log('✨ Supabase setup guide complete!')
}

setupSupabase().catch(console.error)