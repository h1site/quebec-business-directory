-- Migration pour créer les tables de statistiques/analytics
-- Date: 2025-01-27

-- Table pour tracker les IPs d'admin à exclure des stats
CREATE TABLE IF NOT EXISTS admin_ips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ip_address)
);

-- Table pour tracker les vues de fiches d'entreprises
CREATE TABLE IF NOT EXISTS business_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(2),
  city VARCHAR(255),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes pour optimiser les requêtes
  INDEX idx_business_views_business_id (business_id),
  INDEX idx_business_views_viewed_at (viewed_at),
  INDEX idx_business_views_ip (ip_address)
);

-- Table pour tracker les clics sur les sites web externes
CREATE TABLE IF NOT EXISTS website_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  INDEX idx_website_clicks_business_id (business_id),
  INDEX idx_website_clicks_clicked_at (clicked_at),
  INDEX idx_website_clicks_ip (ip_address)
);

-- Table pour les statistiques agrégées par jour (pour performance)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  new_businesses INTEGER DEFAULT 0,
  claimed_businesses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date),
  INDEX idx_daily_stats_date (date)
);

-- Table pour les statistiques par entreprise (cache)
CREATE TABLE IF NOT EXISTS business_stats (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  views_this_month INTEGER DEFAULT 0,
  clicks_this_month INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour vérifier si une IP est une IP admin
CREATE OR REPLACE FUNCTION is_admin_ip(check_ip INET)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_ips WHERE ip_address = check_ip
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour enregistrer une vue (uniquement si pas admin)
CREATE OR REPLACE FUNCTION record_business_view(
  p_business_id UUID,
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Ne pas enregistrer si c'est une IP admin
  IF is_admin_ip(p_ip_address) THEN
    RETURN;
  END IF;

  -- Insérer la vue
  INSERT INTO business_views (business_id, ip_address, user_agent, referrer)
  VALUES (p_business_id, p_ip_address, p_user_agent, p_referrer);

  -- Mettre à jour les stats de l'entreprise
  INSERT INTO business_stats (business_id, total_views, last_viewed_at, views_this_month)
  VALUES (p_business_id, 1, NOW(), 1)
  ON CONFLICT (business_id) DO UPDATE SET
    total_views = business_stats.total_views + 1,
    last_viewed_at = NOW(),
    views_this_month = business_stats.views_this_month + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour enregistrer un clic sur site web
CREATE OR REPLACE FUNCTION record_website_click(
  p_business_id UUID,
  p_website_url TEXT,
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Ne pas enregistrer si c'est une IP admin
  IF is_admin_ip(p_ip_address) THEN
    RETURN;
  END IF;

  -- Insérer le clic
  INSERT INTO website_clicks (business_id, website_url, ip_address, user_agent, referrer)
  VALUES (p_business_id, p_website_url, p_ip_address, p_user_agent, p_referrer);

  -- Mettre à jour les stats de l'entreprise
  INSERT INTO business_stats (business_id, total_clicks, last_clicked_at, clicks_this_month)
  VALUES (p_business_id, 1, NOW(), 1)
  ON CONFLICT (business_id) DO UPDATE SET
    total_clicks = business_stats.total_clicks + 1,
    last_clicked_at = NOW(),
    clicks_this_month = business_stats.clicks_this_month + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour réinitialiser les stats mensuelles (à exécuter le 1er de chaque mois)
CREATE OR REPLACE FUNCTION reset_monthly_stats()
RETURNS VOID AS $$
BEGIN
  UPDATE business_stats SET
    views_this_month = 0,
    clicks_this_month = 0,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) - Les stats sont accessibles uniquement aux admins
ALTER TABLE admin_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Seuls les admins peuvent voir les stats
CREATE POLICY "Admins can view admin_ips" ON admin_ips
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert admin_ips" ON admin_ips
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view business_views" ON business_views
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view website_clicks" ON website_clicks
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view daily_stats" ON daily_stats
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view business_stats" ON business_stats
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions
GRANT SELECT ON admin_ips TO authenticated;
GRANT INSERT ON admin_ips TO authenticated;
GRANT SELECT ON business_views TO authenticated;
GRANT SELECT ON website_clicks TO authenticated;
GRANT SELECT ON daily_stats TO authenticated;
GRANT SELECT ON business_stats TO authenticated;

-- Commentaires
COMMENT ON TABLE admin_ips IS 'Stocke les IPs des administrateurs à exclure des statistiques';
COMMENT ON TABLE business_views IS 'Enregistre chaque vue d''une fiche d''entreprise';
COMMENT ON TABLE website_clicks IS 'Enregistre chaque clic sur le site web d''une entreprise';
COMMENT ON TABLE daily_stats IS 'Statistiques agrégées par jour pour améliorer les performances';
COMMENT ON TABLE business_stats IS 'Cache des statistiques par entreprise pour accès rapide';
