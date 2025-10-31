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

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_stats_updated_at
  BEFORE UPDATE ON sponsor_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Commentaires pour la documentation
COMMENT ON TABLE sponsors IS 'Liste des entreprises commanditaires affichées sur les fiches';
COMMENT ON TABLE sponsor_stats IS 'Statistiques quotidiennes de performance par commanditaire';
COMMENT ON COLUMN sponsor_stats.ctr IS 'Click-Through Rate calculé automatiquement (clicks/impressions * 100)';
