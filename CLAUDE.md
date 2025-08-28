# Fieldnotes - Development Guide

A map-based, personalized travelogue with social features. Think IMDb → Letterboxd, but for travel experiences.

## Stack
- Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Radix
- MapLibre GL JS v5+, OpenStreetMap raster tiles, globe projection  
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

## Environment Variables
```bash
# .env.local (never commit)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## Data Model
- profiles: username, display_name, bio, avatar_url
- places: osm_id, name, lat, lon, country, region, city, address
- visits: user_id, place_id, visited_on, rating, note, photos, privacy
- follows: follower_id, followee_id
- likes: user_id, visit_id
- comments: user_id, visit_id, body

## Globe Configuration
- Projection: "globe" with sky and fog layers
- Tiles: OpenStreetMap raster with attribution
- Cluster points at low zoom, smooth expansion
- Idle rotation toggle, smooth zoom controls