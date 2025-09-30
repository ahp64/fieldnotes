# Fieldnotes Architecture

## Data Flow

```
Frontend (React) → API Routes (Next.js) → Supabase (PostgreSQL + RLS)
```

### Security Layers

1. **Client Layer** (Browser)
   - User authentication via Supabase Auth
   - Session management in cookies
   - Frontend validation

2. **API Layer** (Next.js Server)
   - `/api/visits` - GET (list) & POST (create)
   - User authentication verification
   - Business logic & validation
   - Server-side operations

3. **Database Layer** (Supabase)
   - Row Level Security (RLS) policies
   - User can only access their own data
   - Enforced at database level

## API Routes

### GET /api/visits
**Purpose:** Fetch user's visits
**Auth:** Required (checks user session)
**Returns:** Array of visits with place data

### POST /api/visits
**Purpose:** Create new visit
**Auth:** Required (checks user session)
**Body:**
```json
{
  "placeName": "string",
  "latitude": "number",
  "longitude": "number",
  "visitedOn": "date",
  "rating": "number (optional)",
  "note": "string (optional)",
  "photos": "string[] (optional)",
  "privacy": "public|followers|private (optional)"
}
```

## RLS Policies (Database Level)

### Profiles
- ✅ Public profiles viewable by all
- ✅ Users can only insert/update their own profile

### Visits
- ✅ Public visits viewable by all
- ✅ Followers-only visits viewable by followers
- ✅ Private visits only viewable by owner
- ✅ Users can only insert/update/delete their own visits

### Places
- ✅ All places viewable by all
- ✅ Places created by API (not directly by users)

### Follows, Likes, Comments
- ✅ Users can only modify their own actions
- ✅ Visibility respects visit privacy settings

## Why This Architecture?

1. **Security**: Multiple layers of protection
   - API routes validate & sanitize input
   - RLS ensures database-level security
   - Even if API is bypassed, RLS protects data

2. **Scalability**: Server-side logic centralized
   - Easy to add caching
   - Rate limiting possible
   - Business logic in one place

3. **Maintainability**: Clear separation
   - Frontend handles UI
   - API handles logic
   - Database handles storage & access control

## Auth Flow

1. User enters email on `/login`
2. Supabase sends magic link email
3. User clicks link → redirects to `/auth/callback`
4. Callback exchanges code for session
5. Session stored in cookies
6. All API calls include auth headers
7. API verifies user before database operations