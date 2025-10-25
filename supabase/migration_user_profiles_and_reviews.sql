-- Migration: User Profiles and Reviews System
-- Description: Add user profiles with photos and business reviews
-- Date: 2025-10-24

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour recherche rapide par user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- RLS Policies pour user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Tout le monde peut voir les profils
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = NEW.user_id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. BUSINESS REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 50),
  photos TEXT[], -- Array d'URLs de photos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Un utilisateur ne peut laisser qu'une seule critique par entreprise
  UNIQUE(business_id, user_id)
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_business_reviews_business_id ON business_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_user_id ON business_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_created_at ON business_reviews(created_at DESC);

-- RLS Policies pour business_reviews
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON business_reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON business_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON business_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON business_reviews;

-- Tout le monde peut voir les critiques
CREATE POLICY "Reviews are viewable by everyone"
  ON business_reviews FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent créer des critiques
CREATE POLICY "Users can insert own reviews"
  ON business_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = NEW.user_id);

-- Les utilisateurs peuvent modifier leurs propres critiques
CREATE POLICY "Users can update own reviews"
  ON business_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres critiques
CREATE POLICY "Users can delete own reviews"
  ON business_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. FONCTION POUR CALCULER LA NOTE MOYENNE D'UNE ENTREPRISE
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_business_average_rating(business_uuid UUID)
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

-- ============================================================================
-- 4. FONCTION POUR COMPTER LES CRITIQUES D'UNE ENTREPRISE
-- ============================================================================

CREATE OR REPLACE FUNCTION count_business_reviews(business_uuid UUID)
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

-- ============================================================================
-- 5. TRIGGER POUR METTRE À JOUR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour business_reviews
CREATE TRIGGER update_business_reviews_updated_at
  BEFORE UPDATE ON business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. STORAGE BUCKET POUR LES AVATARS ET PHOTOS DE CRITIQUES
-- ============================================================================

-- Note: Les buckets doivent être créés via l'interface Supabase Storage
-- Créer ces buckets dans l'interface Supabase:
-- - 'avatars' (public)
-- - 'review-photos' (public)

-- Policies pour le bucket avatars (à exécuter après création du bucket)
-- CREATE POLICY "Avatar images are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update their own avatar"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policies pour le bucket review-photos (à exécuter après création du bucket)
-- CREATE POLICY "Review photos are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'review-photos');

-- CREATE POLICY "Authenticated users can upload review photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- 7. VUE POUR LES CRITIQUES AVEC INFORMATIONS UTILISATEUR
-- ============================================================================

CREATE OR REPLACE VIEW business_reviews_with_profiles AS
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

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Instructions pour exécuter cette migration:
-- 1. Copier ce SQL dans l'éditeur SQL de Supabase
-- 2. Exécuter le script
-- 3. Créer les buckets 'avatars' et 'review-photos' dans Storage
-- 4. Appliquer les policies de storage (commentées ci-dessus)
