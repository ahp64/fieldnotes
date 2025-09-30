# Supabase Integration Setup

## Current Status
✅ Schema tables already exist in Supabase
⚠️  RLS policies need to be applied
⚠️  Database needs sample data

## Step 1: Unpause Supabase Project (if needed)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qrbkrlkexhhwdiqryhpy)
2. If project shows as "Paused", click "Restore project"
3. Wait for project to become active

## Step 2: Apply RLS Policies

1. Go to [SQL Editor](https://supabase.com/dashboard/project/qrbkrlkexhhwdiqryhpy/sql/new)
2. Copy the entire contents of `supabase/rls.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute all RLS policies

## Step 3: Seed Database

Run the seed script to populate with sample data:

```bash
npx dotenv-cli -e .env.local -- npm run db:seed
```

This will create:
- 3 sample user profiles
- 5 sample places (Paris, NYC, Tokyo, London, Sydney)
- 6 sample visits with ratings and notes
- Follow relationships between users

## Step 4: Verify Integration

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- User authentication (magic link)
- Profile creation
- Adding visits
- Social features (follows, likes, comments)

## Tables Created

- `profiles` - User profiles with username, bio, avatar
- `places` - Geographic locations
- `visits` - User visit logs with privacy controls
- `follows` - Follower relationships
- `likes` - Visit likes
- `comments` - Visit comments

## RLS Policies Applied

- ✅ Public profiles viewable by all
- ✅ Privacy controls (public/followers/private)
- ✅ Users can only modify their own content
- ✅ Followers can view follower-only visits
- ✅ Secure social features

## Troubleshooting

### Database Connection Errors
- Ensure Supabase project is not paused
- Check `.env.local` has correct credentials
- Verify network connectivity

### RLS Errors
- Run SQL manually in Supabase SQL Editor
- Check for "already exists" messages (safe to ignore)

### Seed Errors
- Ensure RLS policies are applied first
- Check DATABASE_URL in `.env.local`