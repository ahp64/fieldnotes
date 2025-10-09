import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, follows } from '@/../db/schema'
import { eq, and } from 'drizzle-orm'
import { createServerClient } from '@/lib/supabase-server-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user to follow
    const [followee] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1)

    if (!followee) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Can't follow yourself
    if (followee.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followeeId, followee.id)
        )
      )
      .limit(1)

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following' },
        { status: 400 }
      )
    }

    // Create follow relationship
    await db.insert(follows).values({
      followerId: user.id,
      followeeId: followee.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Follow user error:', error)
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user to unfollow
    const [followee] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1)

    if (!followee) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove follow relationship
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followeeId, followee.id)
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unfollow user error:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    )
  }
}
