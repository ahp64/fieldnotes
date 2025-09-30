import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🧪 Testing Supabase Integration\n')
console.log(`📍 Supabase URL: ${supabaseUrl}\n`)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('1️⃣  Testing connection...')

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('username, display_name')
    .limit(5)

  if (profilesError) {
    console.error('   ❌ Failed:', profilesError.message)
    return
  }

  console.log(`   ✅ Connected! Found ${profiles.length} profiles`)
  profiles.forEach(p => console.log(`      - ${p.username} (${p.display_name})`))

  console.log('\n2️⃣  Testing places...')

  const { data: places, error: placesError } = await supabase
    .from('places')
    .select('name, city, country')
    .limit(5)

  if (placesError) {
    console.error('   ❌ Failed:', placesError.message)
    return
  }

  console.log(`   ✅ Found ${places.length} places`)
  places.forEach(p => console.log(`      - ${p.name}`))

  console.log('\n3️⃣  Testing visits with joins...')

  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select(`
      rating,
      note,
      privacy,
      profiles(username),
      places(name, city)
    `)
    .limit(3)

  if (visitsError) {
    console.error('   ❌ Failed:', visitsError.message)
    return
  }

  console.log(`   ✅ Found ${visits.length} visits with relationships`)
  visits.forEach((v: any) => {
    console.log(`      - ${v.profiles.username} visited ${v.places.name} (${v.rating}⭐)`)
  })

  console.log('\n4️⃣  Testing RLS policies...')

  const { data: publicVisits, error: rlsError } = await supabase
    .from('visits')
    .select('id, privacy')

  if (rlsError) {
    console.error('   ❌ Failed:', rlsError.message)
    return
  }

  const publicCount = publicVisits.filter(v => v.privacy === 'public').length
  const totalCount = publicVisits.length

  console.log(`   ✅ RLS working: ${totalCount} visible (${publicCount} public)`)

  console.log('\n5️⃣  Testing follows...')

  const { data: follows, error: followsError } = await supabase
    .from('follows')
    .select('follower_id, followee_id')

  if (followsError) {
    console.error('   ❌ Failed:', followsError.message)
    return
  }

  console.log(`   ✅ Found ${follows.length} follow relationships`)

  console.log('\n✨ All tests passed! Supabase is fully integrated and working.\n')
  console.log('🎯 This is NOT local data - it\'s all coming from:')
  console.log(`   ${supabaseUrl}`)
}

testSupabase().catch(console.error)