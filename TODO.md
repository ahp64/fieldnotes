# Fieldnotes Development Plan

## Phase 1: Foundation & Setup
- [ ] Bootstrap Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [ ] Configure dark theme with brand colors (#0b1021, #e4e4e7, #f5c94a, #7dd3fc)
- [ ] Create basic layout with navbar
- [ ] Set up ESLint, Prettier, and basic scripts

## Phase 2: Authentication & Database
- [ ] Set up Supabase client configuration
- [ ] Create auth pages (sign in with magic link)
- [ ] Design and implement Drizzle schema (profiles, places, visits, follows, likes, comments)
- [ ] Generate and run initial migrations
- [ ] Implement RLS policies in supabase/rls.sql
- [ ] Create seed script with sample data

## Phase 3: Core Globe Map
- [ ] Install and configure MapLibre GL JS v5+
- [ ] Create MapGlobe component with globe projection
- [ ] Add OpenStreetMap raster tiles with attribution
- [ ] Implement sky and fog layers for atmosphere
- [ ] Add clustering for visit markers
- [ ] Create smooth zoom and idle rotation

## Phase 4: Visit Management
- [ ] Build OSM search API route (Nominatim integration)
- [ ] Create new visit form with date, rating, tags, note, privacy
- [ ] Implement photo upload to Supabase Storage
- [ ] Add place caching to avoid API rate limits
- [ ] Create VisitCard and PlaceDrawer components
- [ ] Add zod validation for all forms

## Phase 5: Social Features
- [ ] Implement visit detail page with like/comment
- [ ] Build follow system and FollowButton component
- [ ] Create home feed showing followees' visits
- [ ] Add privacy controls and PrivacyBadge component
- [ ] Build user profile pages with personal globe

## Phase 6: Testing & Performance
- [ ] Write Playwright tests for key user flows
- [ ] Add Vitest tests for utils and validators
- [ ] Test RLS policies thoroughly
- [ ] Create k6 performance test script
- [ ] Optimize globe rendering for ~1k points
- [ ] Measure and document performance metrics

## Phase 7: Production Ready
- [ ] Set up GitHub Actions CI/CD
- [ ] Create comprehensive README with demo steps
- [ ] Add performance proof section with metrics
- [ ] Generate og.png and favicons
- [ ] Create deployment guide for Vercel + Supabase
- [ ] Implement autosave commit script

## MVP Acceptance Criteria
- ✅ User can sign up and set username
- ✅ User can add visits with full metadata
- ✅ Visits appear on profile and globe with correct privacy
- ✅ Users can follow others and see feed
- ✅ Globe renders smoothly with clustering
- ✅ RLS privacy rules enforced
- ✅ Tests pass in CI

## Current Status: Planning Complete
Next: Get approval and start Phase 1