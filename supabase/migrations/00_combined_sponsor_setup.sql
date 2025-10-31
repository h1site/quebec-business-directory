-- ========================================
-- MIGRATION COMPLÈTE DU SYSTÈME DE SPONSORS
-- ========================================
-- Cette migration combine tous les fichiers nécessaires pour le système de sponsors
-- Exécutez ce fichier dans Supabase SQL Editor

-- ========================================
-- 1. CRÉATION DES TABLES
-- ========================================

-- Table des commanditaires (sponsors)
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  slogan TEXT,
  logo_path TEXT NOT NULL, -- Chemin vers le logo (ex: /images/fiches/sponsors/h1site.svg)
  cta_url TEXT NOT NULL, -- URL de destination
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des statistiques quotidiennes par commanditaire
CREATE TABLE IF NOT EXISTS sponsor_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0, -- Nombre de vues
  clicks INTEGER DEFAULT 0, -- Nombre de clicks
  ctr DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN impressions > 0 THEN (clicks::DECIMAL / impressions::DECIMAL * 100)
      ELSE 0
    END
  ) STORED, -- CTR calculé automatiquement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sponsor_id, date) -- Une seule ligne par sponsor par jour
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsor_stats_sponsor_date ON sponsor_stats(sponsor_id, date DESC);

-- ========================================
-- 2. AJOUT DES COLONNES STORAGE
-- ========================================

-- Ajouter les colonnes à la table sponsors si elles n'existent pas
ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS logo_storage_path TEXT,
ADD COLUMN IF NOT EXISTS use_storage_logo BOOLEAN DEFAULT false;

-- ========================================
-- 3. TRACKING IP
-- ========================================

-- Table pour tracker les impressions uniques par IP et par jour
CREATE TABLE IF NOT EXISTS sponsor_impression_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sponsor_id, ip_address, date)
);

-- Table pour tracker les clicks uniques par IP et par jour
CREATE TABLE IF NOT EXISTS sponsor_click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sponsor_id, ip_address, date)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sponsor_impression_tracking_sponsor_date ON sponsor_impression_tracking(sponsor_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sponsor_click_tracking_sponsor_date ON sponsor_click_tracking(sponsor_id, date DESC);

-- ========================================
-- 4. FONCTIONS ET TRIGGERS
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_sponsors_updated_at ON sponsors;
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsor_stats_updated_at ON sponsor_stats;
CREATE TRIGGER update_sponsor_stats_updated_at
  BEFORE UPDATE ON sponsor_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour tracker une impression avec déduplication IP
CREATE OR REPLACE FUNCTION track_sponsor_impression(
  p_sponsor_id UUID,
  p_ip_address TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_tracked BOOLEAN;
BEGIN
  -- Vérifier si cette IP a déjà vu ce sponsor aujourd'hui
  SELECT EXISTS(
    SELECT 1 FROM sponsor_impression_tracking
    WHERE sponsor_id = p_sponsor_id
    AND ip_address = p_ip_address
    AND date = CURRENT_DATE
  ) INTO v_already_tracked;

  -- Si déjà tracké, retourner false
  IF v_already_tracked THEN
    RETURN FALSE;
  END IF;

  -- Insérer dans la table de tracking
  INSERT INTO sponsor_impression_tracking (sponsor_id, ip_address, date)
  VALUES (p_sponsor_id, p_ip_address, CURRENT_DATE);

  -- Incrémenter le compteur dans sponsor_stats
  INSERT INTO sponsor_stats (sponsor_id, date, impressions, clicks)
  VALUES (p_sponsor_id, CURRENT_DATE, 1, 0)
  ON CONFLICT (sponsor_id, date)
  DO UPDATE SET impressions = sponsor_stats.impressions + 1;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour tracker un click avec déduplication IP
CREATE OR REPLACE FUNCTION track_sponsor_click(
  p_sponsor_id UUID,
  p_ip_address TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_tracked BOOLEAN;
BEGIN
  -- Vérifier si cette IP a déjà cliqué ce sponsor aujourd'hui
  SELECT EXISTS(
    SELECT 1 FROM sponsor_click_tracking
    WHERE sponsor_id = p_sponsor_id
    AND ip_address = p_ip_address
    AND date = CURRENT_DATE
  ) INTO v_already_tracked;

  -- Si déjà tracké, retourner false
  IF v_already_tracked THEN
    RETURN FALSE;
  END IF;

  -- Insérer dans la table de tracking
  INSERT INTO sponsor_click_tracking (sponsor_id, ip_address, date)
  VALUES (p_sponsor_id, p_ip_address, CURRENT_DATE);

  -- Incrémenter le compteur dans sponsor_stats
  INSERT INTO sponsor_stats (sponsor_id, date, impressions, clicks)
  VALUES (p_sponsor_id, CURRENT_DATE, 0, 1)
  ON CONFLICT (sponsor_id, date)
  DO UPDATE SET clicks = sponsor_stats.clicks + 1;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. STORAGE BUCKET (COMMENTÉ - À FAIRE MANUELLEMENT)
-- ========================================
-- Le bucket doit être créé manuellement dans Supabase Dashboard:
-- 1. Aller dans Storage
-- 2. Créer un bucket nommé: sponsor-logos
-- 3. Le rendre public
-- 4. Ajouter les politiques RLS ci-dessous dans SQL Editor:

/*
-- Créer le bucket sponsor-logos s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sponsor-logos',
  'sponsor-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

-- Politiques RLS pour sponsor-logos bucket
CREATE POLICY "Public can view sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Authenticated users can upload sponsor logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sponsor-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own sponsor logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sponsor-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own sponsor logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sponsor-logos' AND
  auth.role() = 'authenticated'
);
*/

-- ========================================
-- 6. DONNÉES DE TEST
-- ========================================

-- Insertion du premier commanditaire (h1site)
INSERT INTO sponsors (company_name, slogan, logo_path, cta_url, is_active)
VALUES (
  'h1site',
  'Votre partenaire web au Québec',
  '/images/fiches/sponsors/h1site.svg',
  'https://h1site.com',
  true
)
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. COMMENTAIRES POUR LA DOCUMENTATION
-- ========================================

COMMENT ON TABLE sponsors IS 'Liste des entreprises commanditaires affichées sur les fiches';
COMMENT ON TABLE sponsor_stats IS 'Statistiques quotidiennes de performance par commanditaire';
COMMENT ON COLUMN sponsor_stats.ctr IS 'Click-Through Rate calculé automatiquement (clicks/impressions * 100)';
COMMENT ON COLUMN sponsors.logo_path IS 'Static logo path from public/images (legacy)';
COMMENT ON COLUMN sponsors.logo_storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN sponsors.use_storage_logo IS 'If true, use logo_storage_path instead of logo_path';

-- ========================================
-- MIGRATION TERMINÉE
-- ========================================
-- Tables créées:
-- - sponsors (avec colonnes storage)
-- - sponsor_stats
-- - sponsor_impression_tracking
-- - sponsor_click_tracking
--
-- Fonctions créées:
-- - track_sponsor_impression(sponsor_id, ip_address)
-- - track_sponsor_click(sponsor_id, ip_address)
--
-- À FAIRE MANUELLEMENT:
-- - Créer le bucket 'sponsor-logos' dans Storage
-- - Ajouter le logo h1site à /public/images/fiches/sponsors/h1site.svg
