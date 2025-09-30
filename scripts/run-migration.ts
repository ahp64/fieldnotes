import postgres from 'postgres'
import { readFileSync } from 'fs'

const sql = postgres(process.env.DATABASE_URL!)

async function runMigration() {
  try {
    console.log('Running migration: Remove rating column...')
    await sql`ALTER TABLE visits DROP COLUMN IF EXISTS rating`
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigration()
