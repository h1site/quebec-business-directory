-- Migration pour créer le mapping ACT_ECON → main_categories
-- Date: 2025-01-28
-- Description: Permet de mapper les 74 codes ACT_ECON principaux vers les 19 catégories du site

-- 1. Créer la table de mapping
CREATE TABLE IF NOT EXISTS act_econ_to_main_category (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  act_econ_code TEXT NOT NULL,
  main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
  confidence INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(act_econ_code, main_category_id)
);

-- 2. Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_act_econ_to_main_category_code
  ON act_econ_to_main_category(act_econ_code);

CREATE INDEX IF NOT EXISTS idx_act_econ_to_main_category_category
  ON act_econ_to_main_category(main_category_id);

-- 3. Commentaires
COMMENT ON TABLE act_econ_to_main_category IS 'Mapping entre codes ACT_ECON (gouvernement) et main_categories (site)';
COMMENT ON COLUMN act_econ_to_main_category.act_econ_code IS 'Code ACT_ECON (ex: 0100, 0200, etc.)';
COMMENT ON COLUMN act_econ_to_main_category.main_category_id IS 'Référence vers main_categories.id';
COMMENT ON COLUMN act_econ_to_main_category.confidence IS 'Niveau de confiance du mapping (0-100)';

-- 4. RLS (Row Level Security) - Public read
ALTER TABLE act_econ_to_main_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read mappings" ON act_econ_to_main_category
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage mappings" ON act_econ_to_main_category
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Grant permissions
GRANT SELECT ON act_econ_to_main_category TO anon, authenticated;
GRANT ALL ON act_econ_to_main_category TO service_role;
