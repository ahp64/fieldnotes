import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are required')
}

async function executeSql(query: string): Promise<any> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`SQL execution failed: ${response.status} ${text}`)
  }

  return response.json().catch(() => ({}))
}

async function runMigrations() {
  console.log('🚀 Starting Supabase migrations via REST API...\n')

  const migrations = [
    'db/migrations/0000_greedy_songbird.sql',
    'db/migrations/0001_shallow_owl.sql',
    'supabase/rls.sql',
  ]

  for (const migrationPath of migrations) {
    console.log(`📝 Running: ${migrationPath}`)

    try {
      const sqlContent = readFileSync(join(process.cwd(), migrationPath), 'utf-8')

      const statements = sqlContent
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await executeSql(statement)
          } catch (error: any) {
            if (
              error.message?.includes('already exists') ||
              error.message?.includes('duplicate key') ||
              error.message?.includes('42P07') ||
              error.message?.includes('42710')
            ) {
              console.log(`   ⚠️  Already exists, skipping`)
              continue
            }
            throw error
          }
        }
      }

      console.log(`   ✅ Completed\n`)
    } catch (error: any) {
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('duplicate')
      ) {
        console.log(`   ⚠️  Already exists, skipping\n`)
        continue
      }
      console.error(`   ❌ Error:`, error.message)
      throw error
    }
  }

  console.log('✨ All migrations completed successfully!')
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})