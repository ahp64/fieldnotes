import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { visits, profiles, places, likes } from '@/../db/schema'
import { eq, sql, desc } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params

    // Get all public visits for this place with user details and like counts
    const placeVisits = await db
      .select({
        id: visits.id,
        visitedOn: visits.visitedOn,
        note: visits.note,
        photos: visits.photos,
        createdAt: visits.createdAt,
        user: {
          id: profiles.id,
          username: profiles.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        },
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
      .leftJoin(profiles, eq(visits.userId, profiles.id))
      .leftJoin(places, eq(visits.placeId, places.id))
      .leftJoin(likes, eq(visits.id, likes.visitId))
      .where(eq(visits.placeId, placeId))
      .groupBy(visits.id, profiles.id, places.id)
      .orderBy(desc(sql`cast(count(${likes.id}) as int)`))

    return NextResponse.json({ visits: placeVisits })
  } catch (error) {
    console.error('Get place visits error:', error)
    return NextResponse.json(
      { error: 'Failed to load place visits' },
      { status: 500 }
    )
  }
}
