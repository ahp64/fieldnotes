import { supabase } from './supabase'
import { db, profiles } from './db'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  return profile || null
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

export async function createProfile(userId: string, username: string, displayName?: string) {
  const [profile] = await db
    .insert(profiles)
    .values({
      id: userId,
      username,
      displayName,
    })
    .returning()

  return profile
}