import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { likes } from '@/../db/schema'
import { eq, and } from 'drizzle-orm'
import { createServerClient } from '@/lib/supabase-server-client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const visitId = params.id

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.visitId, visitId)))
      .limit(1)

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      )
    }

    // Add like
    await db.insert(likes).values({
      userId: user.id,
      visitId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Like visit error:', error)
    return NextResponse.json(
      { error: 'Failed to like visit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const visitId = params.id

    // Remove like
    await db
      .delete(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.visitId, visitId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unlike visit error:', error)
    return NextResponse.json(
      { error: 'Failed to unlike visit' },
      { status: 500 }
    )
  }
}
