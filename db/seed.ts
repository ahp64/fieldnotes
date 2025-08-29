import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { profiles, places, visits, follows } from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const client = postgres(connectionString)
const db = drizzle(client)

async function seed() {
  try {
    console.log('🌱 Starting database seed...')

    // Create sample profiles
    const sampleProfiles = await db.insert(profiles).values([
      {
        username: 'explorer',
        displayName: 'World Explorer',
        bio: 'Passionate traveler documenting adventures around the globe',
      },
      {
        username: 'foodie',
        displayName: 'Culinary Adventurer',
        bio: 'Food lover exploring cuisines from around the world',
      },
      {
        username: 'photographer',
        displayName: 'Travel Photographer',
        bio: 'Capturing beautiful moments and landscapes',
      }
    ]).returning()

    console.log(`✅ Created ${sampleProfiles.length} sample profiles`)

    // Create sample places
    const samplePlaces = await db.insert(places).values([
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
    ]).returning()

    console.log(`✅ Created ${samplePlaces.length} sample places`)

    // Create sample visits
    const sampleVisits = await db.insert(visits).values([
      {
        userId: sampleProfiles[0].id,
        placeId: samplePlaces[0].id,
        visitedOn: new Date('2024-07-15'),
        rating: 5,
        note: 'Absolutely breathtaking! The view from the top was incredible. Perfect sunset timing.',
        privacy: 'public'
      },
      {
        userId: sampleProfiles[0].id,
        placeId: samplePlaces[1].id,
        visitedOn: new Date('2024-08-01'),
        rating: 4,
        note: 'Bustling and energetic! The lights at night are amazing.',
        privacy: 'public'
      },
      {
        userId: sampleProfiles[1].id,
        placeId: samplePlaces[2].id,
        visitedOn: new Date('2024-06-20'),
        rating: 5,
        note: 'The organized chaos is mesmerizing. Found amazing ramen nearby!',
        privacy: 'public'
      },
      {
        userId: sampleProfiles[1].id,
        placeId: samplePlaces[3].id,
        visitedOn: new Date('2024-05-10'),
        rating: 4,
        note: 'Classic London landmark. Great for photos and the history is fascinating.',
        privacy: 'public'
      },
      {
        userId: sampleProfiles[2].id,
        placeId: samplePlaces[4].id,
        visitedOn: new Date('2024-04-25'),
        rating: 5,
        note: 'Architectural masterpiece! Got some incredible shots during golden hour.',
        privacy: 'public'
      },
      {
        userId: sampleProfiles[2].id,
        placeId: samplePlaces[0].id,
        visitedOn: new Date('2024-03-15'),
        rating: 4,
        note: 'Second visit here - still magical. Different perspective with spring weather.',
        privacy: 'followers'
      }
    ]).returning()

    console.log(`✅ Created ${sampleVisits.length} sample visits`)

    // Create some follow relationships
    await db.insert(follows).values([
      {
        followerId: sampleProfiles[0].id,
        followeeId: sampleProfiles[1].id,
      },
      {
        followerId: sampleProfiles[0].id,
        followeeId: sampleProfiles[2].id,
      },
      {
        followerId: sampleProfiles[1].id,
        followeeId: sampleProfiles[2].id,
      }
    ])

    console.log(`✅ Created sample follow relationships`)
    console.log('🎉 Database seed completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

if (require.main === module) {
  seed()
}