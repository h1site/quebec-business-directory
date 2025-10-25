-- ============================================================================
-- Migration: User Profiles and Reviews System
-- FRESH START - DROP AND RECREATE EVERYTHING
-- ============================================================================

-- Drop everything first (order matters!)
DROP VIEW IF EXISTS business_reviews_with_profiles CASCADE;
DROP TABLE IF EXISTS business_reviews CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS count_business_reviews(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_business_average_rating(UUID) CASCADE;

-- 1. CREATE TABLES (NO RLS YET)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 50),
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- 2. CREATE INDEXES
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_business_reviews_business_id ON business_reviews(business_id);
CREATE INDEX idx_business_reviews_user_id ON business_reviews(user_id);
CREATE INDEX idx_business_reviews_created_at ON business_reviews(created_at DESC);

-- 3. CREATE FUNCTIONS
CREATE FUNCTION calculate_business_average_rating(business_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1)
  INTO avg_rating
  FROM business_reviews
  WHERE business_id = business_uuid;
  RETURN COALESCE(avg_rating, 0);
END;
$$;

CREATE FUNCTION count_business_reviews(business_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  review_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO review_count
  FROM business_reviews
  WHERE business_id = business_uuid;
  RETURN review_count;
END;
$$;

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGERS
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_reviews_updated_at
  BEFORE UPDATE ON business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. CREATE VIEW
CREATE VIEW business_reviews_with_profiles AS
SELECT
  br.id,
  br.business_id,
  br.user_id,
  br.rating,
  br.comment,
  br.photos,
  br.created_at,
  br.updated_at,
  up.full_name,
  up.avatar_url
FROM business_reviews br
LEFT JOIN user_profiles up ON br.user_id = up.user_id;

-- 6. ENABLE RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES FOR user_profiles
CREATE POLICY "user_profiles_select_policy"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "user_profiles_insert_policy"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "user_profiles_update_policy"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles_delete_policy"
  ON user_profiles FOR DELETE
  USING (user_id = auth.uid());

-- 8. CREATE RLS POLICIES FOR business_reviews
CREATE POLICY "business_reviews_select_policy"
  ON business_reviews FOR SELECT
  USING (true);

CREATE POLICY "business_reviews_insert_policy"
  ON business_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "business_reviews_update_policy"
  ON business_reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "business_reviews_delete_policy"
  ON business_reviews FOR DELETE
  USING (user_id = auth.uid());
