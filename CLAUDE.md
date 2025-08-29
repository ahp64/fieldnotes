# Fieldnotes - Development Guide

A map-based, personalized travelogue with social features. Think IMDb → Letterboxd, but for travel experiences.

## Stack
- Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Radix
- **CesiumJS v1.132** for 3D globe with smooth zoom transitions to map view
- Supabase for Postgres, Auth, Storage. Drizzle ORM with SQL migrations  
- zod for validation. Vitest and Playwright. ESLint and Prettier

## Common Commands
```bash
# Development
pnpm dev
pnpm build
pnpm type-check

# Database
pnpm db:generate    # Generate migrations
pnpm db:push        # Push schema to DB
pnpm db:studio      # Open Drizzle Studio
pnpm db:seed        # Seed with sample data

# Testing
pnpm test           # Run Vitest
pnpm test:e2e       # Run Playwright
pnpm test:watch     # Watch mode

# Linting
pnpm lint
pnpm format

# Autosave (10min loop)
pnpm autosave
```

## Project Style
- Dark theme: bg #0b1021, text #e4e4e7, accents #f5c94a and #7dd3fc
- Globe markers: mine #7dd3fc, wishlist #f5c94a, friends #a78bfa
- Small commits, Conventional Commits format
- Keep diffs under ~150 lines when possible
- TDD for utils and validators

## Test Steps
1. Sign up with email magic link
2. Set username and edit profile
3. Add visit with date, rating, tags, note, photos, privacy
4. View visit on profile and globe
5. Follow seeded user, see their visits in feed
6. Like and comment on visits
7. Verify RLS privacy rules work

## Environment Variables Setup
1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API to get your credentials
3. Go to Project Settings > Database to get your DATABASE_URL
4. Create a Cesium Ion account at https://cesium.com/ion/
5. Go to Access Tokens to get your Cesium Ion access token
6. Create `.env.local` in the project root:

```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# Cesium Ion API (for 3D globe with satellite imagery)
NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN=your-cesium-ion-access-token
```

## Database Setup
After setting up environment variables:
```bash
# Create tables in Supabase
npm run db:push

# Add sample data
npm run db:seed

# Open Drizzle Studio to view data (optional)
npm run db:studio
```

## Data Model
- profiles: username, display_name, bio, avatar_url
- places: osm_id, name, lat, lon, country, region, city, address
- visits: user_id, place_id, visited_on, rating, note, photos, privacy
- follows: follower_id, followee_id
- likes: user_id, visit_id
- comments: user_id, visit_id, body

## 3D Globe Configuration (CesiumJS)
- **True 3D Globe**: CesiumJS provides authentic 3D Earth rendering with atmosphere
- **Smooth Transitions**: Seamless zoom from globe view to detailed map view
- **Real Satellite Imagery**: High-resolution satellite tiles from Cesium Ion (requires API key)
- **Interactive Features**: 
  - Auto-rotation when idle (stops on user interaction)
  - Smooth camera controls with momentum
  - 3D markers with scale-by-distance
  - Clickable location pins with popups
- **Performance**: Hardware-accelerated WebGL rendering
- **API Requirements**: 
  - **Cesium Ion Access Token**: Required for premium satellite imagery and terrain
  - **Free Tier Available**: 50,000 monthly asset requests included
  - **Sign up**: https://cesium.com/ion/ (free account sufficient for development)
- **Assets**: Dynamic import configuration for Next.js SSR compatibility
- Always ask for API keys for whatever is the best or specified technology to use for a given thing. .env.local already exists.
- If I say >ss it means I added a new screenshot in the directory showing current output, please examine it and debug appropriately
- I am not a premium cesium user