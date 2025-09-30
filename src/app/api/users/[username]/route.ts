import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, visits, places, likes } from '@/../db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    // Get user profile
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's public visits with place details and like counts
    const userVisits = await db
      .select({
        id: visits.id,
        visitedOn: visits.visitedOn,
        note: visits.note,
        photos: visits.photos,
        privacy: visits.privacy,
        createdAt: visits.createdAt,
        place: {
          id: places.id,
          name: places.name,
          lat: places.lat,
          lon: places.lon,
          country: places.country,
          region: places.region,
          city: places.city,
        },
        likeCount: sql<number>`cast(count(${likes.id}) as int)`,
      })
      .from(visits)
      .leftJoin(places, eq(visits.placeId, places.id))
      .leftJoin(likes, eq(visits.id, likes.visitId))
      .where(eq(visits.userId, user.id))
      .groupBy(visits.id, places.id)
      .orderBy(sql`${visits.createdAt} desc`)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
      visits: userVisits,
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to load user profile' },
      { status: 500 }
    )
  }
}
