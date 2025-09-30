import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  console.log('\n📝 Create a .env.local file with your Supabase credentials')
  console.log('   Or run with: npx dotenv-cli -e .env.local -- npm run db:setup\n')
  process.exit(1)
}

async function applyAllSQL() {
  console.log('🔧 Applying all SQL migrations and policies...\n')

  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
  })

  try {
    const rlsContent = readFileSync(join(process.cwd(), 'supabase/rls.sql'), 'utf-8')

    const statements = rlsContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log(`Found ${statements.length} RLS policy statements\n`)

    for (const [index, statement] of statements.entries()) {
      if (statement.trim()) {
        try {
          await sql.unsafe(statement)
          console.log(`✅  Statement ${index + 1}/${statements.length}`)
        } catch (error: any) {
          if (
            error.message?.includes('already exists') ||
            error.message?.includes('duplicate') ||
            error.code === '42723' || // duplicate function
            error.code === '42P07' || // duplicate table
            error.code === '42710' // duplicate object
          ) {
            console.log(`⚠️  Statement ${index + 1}/${statements.length} - already exists, skipping`)
          } else {
            console.log(`⚠️  Statement ${index + 1}/${statements.length} - ${error.message}`)
          }
        }
      }
    }

    console.log('\n✨ RLS policies applied successfully!')
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

applyAllSQL()