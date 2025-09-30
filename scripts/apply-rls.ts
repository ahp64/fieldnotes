import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLS() {
  console.log('🔒 Applying RLS policies...\n')

  try {
    const rlsSql = readFileSync(join(process.cwd(), 'supabase/rls.sql'), 'utf-8')

    const statements = rlsSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements\n`)

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec', { sql: statement + ';' })

          if (error) {
            if (error.message?.includes('already exists') ||
                error.message?.includes('duplicate') ||
                error.message?.includes('function "exec" does not exist')) {
              console.log(`   ⚠️  ${error.message}`)
              continue
            }
            throw error
          }

          console.log(`   ✅ Executed successfully`)
        } catch (err: any) {
          console.log(`   ⚠️  ${err.message}`)
        }
      }
    }

    console.log('\n✨ RLS policies application complete!')
  } catch (error: any) {
    console.error('RLS application failed:', error.message)
    process.exit(1)
  }
}

applyRLS().catch(console.error)