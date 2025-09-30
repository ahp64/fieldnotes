import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('visits')
      .select(`
        id,
        visited_on,
        note,
        photos,
        privacy,
        places(id, name, lat, lon, city, country)
      `)
      .eq('user_id', user.id)
      .order('visited_on', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ visits: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { placeName, latitude, longitude, visitedOn, note, photos, privacy } = body

    if (!placeName || !latitude || !longitude || !visitedOn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: existingPlace } = await supabase
      .from('places')
      .select('id')
      .eq('lat', latitude)
      .eq('lon', longitude)
      .single()

    let placeId = existingPlace?.id

    if (!placeId) {
      const { supabaseAdmin } = await import('@/lib/supabase-server')

      const { data: newPlace, error: placeError } = await supabaseAdmin
        .from('places')
        .insert({
          name: placeName,
          lat: latitude,
          lon: longitude,
        })
        .select()
        .single()

      if (placeError) {
        return NextResponse.json({ error: placeError.message }, { status: 500 })
      }

      placeId = newPlace.id
    }

    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .insert({
        user_id: user.id,
        place_id: placeId,
        visited_on: visitedOn,
        note: note || '',
        photos: photos || [],
        privacy: privacy || 'public',
      })
      .select(`
        id,
        visited_on,
        note,
        photos,
        privacy,
        places(id, name, lat, lon, city, country)
      `)
      .single()

    if (visitError) {
      return NextResponse.json({ error: visitError.message }, { status: 500 })
    }

    return NextResponse.json({ visit }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}