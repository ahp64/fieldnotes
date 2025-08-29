import { NextResponse } from 'next/server'

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  type: string
  importance: number
  icon?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Fieldnotes-App/1.0 (https://github.com/your-repo)',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Nominatim')
    }

    const data: NominatimResult[] = await response.json()

    const places = data.map((result) => ({
      id: result.place_id,
      name: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      type: result.type,
      importance: result.importance,
    }))

    return NextResponse.json(places)
  } catch (error) {
    console.error('Error searching places:', error)
    return NextResponse.json({ error: 'Failed to search places' }, { status: 500 })
  }
}