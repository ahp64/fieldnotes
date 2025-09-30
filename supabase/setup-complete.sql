-- ==============================================
-- Fieldnotes Supabase Complete Setup
-- Run this in the Supabase SQL Editor
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Places policies (read-only for users, insert via service role)
CREATE POLICY "Places are viewable by everyone" ON places
  FOR SELECT USING (true);

-- Visits policies
CREATE POLICY "Public visits are viewable by everyone" ON visits
  FOR SELECT USING (privacy = 'public');

CREATE POLICY "Followers can view follower visits" ON visits
  FOR SELECT USING (
    privacy = 'followers'
    AND EXISTS (
      SELECT 1 FROM follows
      WHERE followee_id = visits.user_id
      AND follower_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own visits" ON visits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visits" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visits" ON visits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visits" ON visits
  FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like visits they can see" ON likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM visits
        WHERE visits.id = visit_id
        AND (
          privacy = 'public'
          OR user_id = auth.uid()
          OR (privacy = 'followers' AND EXISTS (
            SELECT 1 FROM follows
            WHERE followee_id = visits.user_id
            AND follower_id = auth.uid()
          ))
        )
      )
    )
  );

CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone on visible visits" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM visits
      WHERE visits.id = visit_id
      AND (
        privacy = 'public'
        OR user_id = auth.uid()
        OR (privacy = 'followers' AND EXISTS (
          SELECT 1 FROM follows
          WHERE followee_id = visits.user_id
          AND follower_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can comment on visits they can see" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM visits
        WHERE visits.id = visit_id
        AND (
          privacy = 'public'
          OR user_id = auth.uid()
          OR (privacy = 'followers' AND EXISTS (
            SELECT 1 FROM follows
            WHERE followee_id = visits.user_id
            AND follower_id = auth.uid()
          ))
        )
      )
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- Setup complete! Next step: npm run db:seed
-- ==============================================