import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seed() {
  try {
    console.log('🌱 Starting database seed via Supabase API...\n')

    const profilesData = [
      {
        username: 'explorer',
        display_name: 'World Explorer',
        bio: 'Passionate traveler documenting adventures around the globe',
      },
      {
        username: 'foodie',
        display_name: 'Culinary Adventurer',
        bio: 'Food lover exploring cuisines from around the world',
      },
      {
        username: 'photographer',
        display_name: 'Travel Photographer',
        bio: 'Capturing beautiful moments and landscapes',
      }
    ]

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .insert(profilesData)
      .select()

    if (profilesError) throw profilesError
    console.log(`✅ Created ${profiles.length} sample profiles`)

    const placesData = [
      {
        name: 'Eiffel Tower, Paris, France',
        lat: 48.8584,
        lon: 2.2945,
        country: 'France',
        region: 'Île-de-France',
        city: 'Paris',
        address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France'
      },
      {
        name: 'Times Square, New York, USA',
        lat: 40.7589,
        lon: -73.9851,
        country: 'United States',
        region: 'New York',
        city: 'New York City',
        address: 'Times Square, New York, NY, USA'
      },
      {
        name: 'Shibuya Crossing, Tokyo, Japan',
        lat: 35.6598,
        lon: 139.7006,
        country: 'Japan',
        region: 'Tokyo',
        city: 'Tokyo',
        address: 'Shibuya City, Tokyo, Japan'
      },
      {
        name: 'Big Ben, London, UK',
        lat: 51.4994,
        lon: -0.1245,
        country: 'United Kingdom',
        region: 'England',
        city: 'London',
        address: 'Westminster, London SW1A 0AA, UK'
      },
      {
        name: 'Sydney Opera House, Australia',
        lat: -33.8568,
        lon: 151.2153,
        country: 'Australia',
        region: 'New South Wales',
        city: 'Sydney',
        address: 'Bennelong Point, Sydney NSW 2000, Australia'
      }
    ]

    const { data: places, error: placesError } = await supabase
      .from('places')
      .insert(placesData)
      .select()

    if (placesError) throw placesError
    console.log(`✅ Created ${places.length} sample places`)

    const visitsData = [
      {
        user_id: profiles[0].id,
        place_id: places[0].id,
        visited_on: '2024-07-15T00:00:00Z',
        rating: 5,
        note: 'Absolutely breathtaking! The view from the top was incredible. Perfect sunset timing.',
        privacy: 'public'
      },
      {
        user_id: profiles[0].id,
        place_id: places[1].id,
        visited_on: '2024-08-01T00:00:00Z',
        rating: 4,
        note: 'Bustling and energetic! The lights at night are amazing.',
        privacy: 'public'
      },
      {
        user_id: profiles[1].id,
        place_id: places[2].id,
        visited_on: '2024-06-20T00:00:00Z',
        rating: 5,
        note: 'The organized chaos is mesmerizing. Found amazing ramen nearby!',
        privacy: 'public'
      },
      {
        user_id: profiles[1].id,
        place_id: places[3].id,
        visited_on: '2024-05-10T00:00:00Z',
        rating: 4,
        note: 'Classic London landmark. Great for photos and the history is fascinating.',
        privacy: 'public'
      },
      {
        user_id: profiles[2].id,
        place_id: places[4].id,
        visited_on: '2024-04-25T00:00:00Z',
        rating: 5,
        note: 'Architectural masterpiece! Got some incredible shots during golden hour.',
        privacy: 'public'
      },
      {
        user_id: profiles[2].id,
        place_id: places[0].id,
        visited_on: '2024-03-15T00:00:00Z',
        rating: 4,
        note: 'Second visit here - still magical. Different perspective with spring weather.',
        privacy: 'followers'
      }
    ]

    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .insert(visitsData)
      .select()

    if (visitsError) throw visitsError
    console.log(`✅ Created ${visits.length} sample visits`)

    const followsData = [
      {
        follower_id: profiles[0].id,
        followee_id: profiles[1].id,
      },
      {
        follower_id: profiles[0].id,
        followee_id: profiles[2].id,
      },
      {
        follower_id: profiles[1].id,
        followee_id: profiles[2].id,
      }
    ]

    const { error: followsError } = await supabase
      .from('follows')
      .insert(followsData)

    if (followsError) throw followsError
    console.log(`✅ Created sample follow relationships`)

    console.log('\n🎉 Database seed completed successfully!')

  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seed()