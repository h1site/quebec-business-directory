-- ========================================
-- TABLES DE TRACKING DES CTA (CALL-TO-ACTION)
-- ========================================
-- Tracking de tous les clics sur les boutons CTA des fiches d'entreprises
-- Exécutez ce fichier dans Supabase SQL Editor

-- ========================================
-- 1. TABLE PRINCIPALE DES CTA CLICKS
-- ========================================

CREATE TABLE IF NOT EXISTS cta_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cta_type TEXT NOT NULL, -- 'phone', 'website', 'waze', 'share_facebook', 'share_twitter', 'share_linkedin', 'share_email'
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE DEFAULT CURRENT_DATE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cta_clicks_business ON cta_clicks(business_id);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_type ON cta_clicks(cta_type);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_date ON cta_clicks(date DESC);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_business_type ON cta_clicks(business_id, cta_type);

-- ========================================
-- 2. TABLE DES STATISTIQUES QUOTIDIENNES PAR CTA
-- ========================================

CREATE TABLE IF NOT EXISTS cta_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  phone_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  waze_clicks INTEGER DEFAULT 0,
  share_facebook INTEGER DEFAULT 0,
  share_twitter INTEGER DEFAULT 0,
  share_linkedin INTEGER DEFAULT 0,
  share_email INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, date)
);

-- Index pour les requêtes de stats
CREATE INDEX IF NOT EXISTS idx_cta_daily_stats_business_date ON cta_daily_stats(business_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cta_daily_stats_date ON cta_daily_stats(date DESC);

-- ========================================
-- 3. FONCTION POUR TRACKER UN CTA
-- ========================================

CREATE OR REPLACE FUNCTION track_cta_click(
  p_business_id UUID,
  p_cta_type TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Insérer le clic dans la table des clics
  INSERT INTO cta_clicks (business_id, cta_type, ip_address, user_agent, referrer)
  VALUES (p_business_id, p_cta_type, p_ip_address, p_user_agent, p_referrer);

  -- Mettre à jour les statistiques quotidiennes
  INSERT INTO cta_daily_stats (business_id, date)
  VALUES (p_business_id, v_today)
  ON CONFLICT (business_id, date) DO NOTHING;

  -- Incrémenter le compteur approprié selon le type de CTA
  CASE p_cta_type
    WHEN 'phone' THEN
      UPDATE cta_daily_stats
      SET phone_clicks = phone_clicks + 1,
          total_clicks = total_clicks + 1,
          updated_at = NOW()
      WHERE business_id = p_business_id AND date = v_today;

    WHEN 'website' THEN
      UPDATE cta_daily_stats
      SET website_clicks = website_clicks + 1,
          total_clicks = total_clicks + 1,
          updated_at = NOW()
      WHERE business_id = p_business_id AND date = v_today;

    WHEN 'waze' THEN
      UPDATE cta_daily_stats
      SET waze_clicks = waze_clicks + 1,
          total_clicks = total_clicks + 1,
          updated_at = NOW()
      WHERE business_id = p_business_id AND date = v_today;

    WHEN 'share_facebook' THEN
      UPDATE cta_daily_stats
      SET share_facebook = share_facebook + 1,
          total_clicks = total_clicks + 1,
          updated_at = NOW()
      WHERE business_id = p_business_id AND date = v_today;

    WHEN 'share_twitter' THEN
      UPDATE cta_daily_stats
      SET share_twitter = share_twitter + 1,
          total_clicks = total_clicks + 1,
          updated_at = NOW()
      WHERE business_id = p_business_id AND date = v_today;

    WHEN 'share_linkedin' THEN
      UPDATE cta_daily_stats
      SET share_linkedin = share_linkedin + 1,
          total_clicks = total_clicks + 1,
          updated_at = NOW()
      WHERE business_id = p_business_id AND date = v_today;

    WHEN 'share_email' THEN
      UPDATE cta_daily_stats
      SET share_email = share_email + 1,
          total_clicks = total_clicks + 1,
          updated_at = NOW()
      WHERE business_id = p_business_id AND date = v_today;
  END CASE;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas échouer
    RAISE WARNING 'Error tracking CTA click: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. FONCTION POUR OBTENIR LES STATS D'UNE ENTREPRISE
-- ========================================

CREATE OR REPLACE FUNCTION get_business_cta_stats(
  p_business_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  cta_type TEXT,
  total_clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    unnest(ARRAY['phone', 'website', 'waze', 'share_facebook', 'share_twitter', 'share_linkedin', 'share_email']) AS cta_type,
    unnest(ARRAY[
      COALESCE(SUM(phone_clicks), 0),
      COALESCE(SUM(website_clicks), 0),
      COALESCE(SUM(waze_clicks), 0),
      COALESCE(SUM(share_facebook), 0),
      COALESCE(SUM(share_twitter), 0),
      COALESCE(SUM(share_linkedin), 0),
      COALESCE(SUM(share_email), 0)
    ]) AS total_clicks
  FROM cta_daily_stats
  WHERE business_id = p_business_id
    AND date >= CURRENT_DATE - p_days;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. POLITIQUES RLS (ROW LEVEL SECURITY)
-- ========================================

-- Activer RLS
ALTER TABLE cta_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_daily_stats ENABLE ROW LEVEL SECURITY;

-- Permettre l'insertion publique (pour le tracking)
CREATE POLICY "Anyone can insert CTA clicks"
ON cta_clicks
FOR INSERT
WITH CHECK (true);

-- Permettre aux authentifiés de voir les stats
CREATE POLICY "Authenticated can view CTA clicks"
ON cta_clicks
FOR SELECT
TO authenticated
USING (true);

-- Permettre aux authentifiés de voir les stats quotidiennes
CREATE POLICY "Authenticated can view CTA daily stats"
ON cta_daily_stats
FOR SELECT
TO authenticated
USING (true);

-- Permettre la mise à jour par la fonction
CREATE POLICY "System can update CTA daily stats"
ON cta_daily_stats
FOR ALL
USING (true)
WITH CHECK (true);

-- ========================================
-- 6. COMMENTAIRES POUR LA DOCUMENTATION
-- ========================================

COMMENT ON TABLE cta_clicks IS 'Tracking de tous les clics sur les boutons CTA des fiches d''entreprises';
COMMENT ON TABLE cta_daily_stats IS 'Statistiques quotidiennes des CTA par entreprise';
COMMENT ON COLUMN cta_clicks.cta_type IS 'Type de CTA: phone, website, waze, share_facebook, share_twitter, share_linkedin, share_email';
COMMENT ON FUNCTION track_cta_click IS 'Fonction pour enregistrer un clic sur un CTA avec mise à jour automatique des stats';
COMMENT ON FUNCTION get_business_cta_stats IS 'Obtenir les statistiques CTA d''une entreprise sur N jours';

-- ========================================
-- MIGRATION TERMINÉE
-- ========================================
-- Tables créées:
-- - cta_clicks (tous les clics individuels)
-- - cta_daily_stats (statistiques agrégées par jour)
--
-- Fonctions créées:
-- - track_cta_click(business_id, cta_type, ip, user_agent, referrer)
-- - get_business_cta_stats(business_id, days)
--
-- Types de CTA supportés:
-- - phone (clic sur numéro de téléphone)
-- - website (clic sur site web)
-- - waze (clic sur bouton Waze)
-- - share_facebook (partage Facebook)
-- - share_twitter (partage Twitter/X)
-- - share_linkedin (partage LinkedIn)
-- - share_email (partage par email)
