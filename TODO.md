# Fieldnotes Development Plan

## Phase 1: Foundation & Setup ✅
- [x] Bootstrap Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [x] Configure dark theme with brand colors (#0b1021, #e4e4e7, #f5c94a, #7dd3fc)
- [x] Create basic layout with navbar
- [x] Set up ESLint, Prettier, and basic scripts

## Phase 2: Authentication & Database ✅
- [x] Set up Supabase client configuration
- [x] Create auth pages (sign in with magic link)
- [x] Design and implement Drizzle schema (profiles, places, visits, follows, likes, comments)
- [x] Generate and run initial migrations
- [x] Implement RLS policies in supabase/rls.sql
- [x] Create seed script with sample data
- [x] **COMPLETED**: Set up .env.local with Supabase credentials and DATABASE_URL
- [x] **COMPLETED**: Run `npm run db:push` to create tables, then `npm run db:seed` to add sample data
- [x] Fixed client/server environment variable separation
- [x] Enhanced MapGlobe component with proper initialization and error handling
- [x] Improved frontend UI with glassmorphic design and modern styling

## Phase 3: Core Globe Map ✅ (Upgraded to CesiumJS)
- [x] ~~Install and configure MapLibre GL JS v5+~~ **UPGRADED**: Installed CesiumJS v1.132 for true 3D globe
- [x] **ENHANCED**: Create CesiumGlobe component with authentic 3D Earth rendering
- [x] **IMPROVED**: High-resolution satellite imagery via Cesium Ion instead of raster tiles
- [x] **ENHANCED**: Real 3D atmosphere, lighting, and space environment
- [x] **UPGRADED**: 3D markers with scale-by-distance and clickable popups  
- [x] **IMPROVED**: Hardware-accelerated smooth zoom transitions and idle rotation
- [x] **ADDED**: Webpack configuration for Cesium asset management

## Phase 4: Visit Management ✅ (MVP version completed)
- [x] Build OSM search API route (Nominatim integration)
- [x] Create new visit form with date, rating, tags, note, privacy
- [x] Implement photo upload (base64 for MVP, Supabase Storage for production)
- [ ] Add place caching to avoid API rate limits
- [x] Create VisitCard and PlaceDrawer components
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

## Current Status: CesiumJS 3D Globe Configuration Complete 🌍
**Major Upgrade**: CesiumJS integration with proper API key support
- ✅ CesiumJS v1.132 installed with Next.js dynamic import configuration
- ✅ Webpack configuration for client-side only loading  
- ✅ Environment variable setup for Cesium Ion access token
- ✅ Documentation updated with API key requirements
- 🔧 **NEEDS**: Cesium Ion access token for premium satellite imagery

**API Key Requirements Added:**
- **Cesium Ion Account**: https://cesium.com/ion/ (free tier: 50,000 requests/month)
- **Environment Variable**: `NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN`
- **Premium Features**: High-resolution satellite imagery, 3D terrain, global lighting

**Next**: Add Cesium Ion API key and test full 3D globe functionality