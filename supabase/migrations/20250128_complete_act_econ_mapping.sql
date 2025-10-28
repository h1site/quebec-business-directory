-- Migration complète pour ACT_ECON → main_categories mapping
-- Date: 2025-01-28
-- Description: Crée la table de mapping et insère les 74 mappings

-- =============================================================================
-- PARTIE 1: CRÉATION DE LA TABLE
-- =============================================================================

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

DROP POLICY IF EXISTS "Public can read mappings" ON act_econ_to_main_category;
CREATE POLICY "Public can read mappings" ON act_econ_to_main_category
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage mappings" ON act_econ_to_main_category;
CREATE POLICY "Admins can manage mappings" ON act_econ_to_main_category
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Grant permissions
GRANT SELECT ON act_econ_to_main_category TO anon, authenticated;
GRANT ALL ON act_econ_to_main_category TO service_role;

-- =============================================================================
-- PARTIE 2: INSERTION DES 74 MAPPINGS
-- =============================================================================

-- Agriculture et environnement (065589d2-5efd-47d5-a8b1-dcc418023bd6)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('0100', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100),
  ('0200', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100),
  ('0300', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100),
  ('0400', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100),
  ('0500', '065589d2-5efd-47d5-a8b1-dcc418023bd6', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Industrie, fabrication et logistique (2a2184fd-03c6-4d3a-ab75-bf250e980531)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('0600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('0700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('0800', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('0900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1000', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1100', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1200', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1500', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1800', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('1900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('2400', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('2500', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('2600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('2700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('2800', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('2900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3000', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3100', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3200', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3300', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3500', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3600', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('3900', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100),
  ('4700', '2a2184fd-03c6-4d3a-ab75-bf250e980531', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Construction et rénovation (60beba89-442b-43ff-8fee-96a28922d789)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('4000', '60beba89-442b-43ff-8fee-96a28922d789', 100),
  ('4200', '60beba89-442b-43ff-8fee-96a28922d789', 100),
  ('4400', '60beba89-442b-43ff-8fee-96a28922d789', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Automobile et transport (25933a72-f5d2-4eed-8275-397dc1a8c897)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('4500', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100),
  ('4600', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100),
  ('5500', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100),
  ('6300', '25933a72-f5d2-4eed-8275-397dc1a8c897', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Technologie et informatique (efab1e6e-3c3b-4240-9625-c27477667630)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('4800', 'efab1e6e-3c3b-4240-9625-c27477667630', 100),
  ('4900', 'efab1e6e-3c3b-4240-9625-c27477667630', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Commerce de détail (271eef26-7324-4a26-932e-9a52f60cc985)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('5000', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('5100', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('5200', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('5300', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('5400', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('5600', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('5700', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('5900', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('6000', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('6100', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('6200', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('6500', '271eef26-7324-4a26-932e-9a52f60cc985', 100),
  ('6900', '271eef26-7324-4a26-932e-9a52f60cc985', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Finance, assurance et juridique (a11fb729-cee5-4c77-9b58-36bdc417350e)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('7000', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100),
  ('7100', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100),
  ('7200', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100),
  ('7300', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100),
  ('7400', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100),
  ('7600', 'a11fb729-cee5-4c77-9b58-36bdc417350e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Immobilier (2a9a3e8f-e13b-4d4f-bb8c-b483a3c356ca)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('7500', '2a9a3e8f-e13b-4d4f-bb8c-b483a3c356ca', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Services professionnels (944753c0-0ebf-4d74-9168-268fab04fc0d)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('7700', '944753c0-0ebf-4d74-9168-268fab04fc0d', 100),
  ('9900', '944753c0-0ebf-4d74-9168-268fab04fc0d', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Organismes publics et communautaires (234268e6-4227-4710-a8b1-11af7d4f0a97)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('8100', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100),
  ('8200', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100),
  ('8300', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100),
  ('8400', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100),
  ('9800', '234268e6-4227-4710-a8b1-11af7d4f0a97', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Éducation et formation (783970a1-2bed-4f8e-9f1b-29bfb68cf3b3)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('8500', '783970a1-2bed-4f8e-9f1b-29bfb68cf3b3', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Santé et bien-être (b6f1a7d3-9a7c-4871-bd63-2770ba99540f)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('8600', 'b6f1a7d3-9a7c-4871-bd63-2770ba99540f', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Tourisme et hébergement (a43306cc-1d4f-4a49-bb28-41a372889b18)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('9100', 'a43306cc-1d4f-4a49-bb28-41a372889b18', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Restauration et alimentation (ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('9200', 'ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Sports et loisirs (a57cc9f2-15f0-4ffe-880b-2d48f5fba09e)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('9600', 'a57cc9f2-15f0-4ffe-880b-2d48f5fba09e', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- Maison et services domestiques (ae549a95-5732-4b7f-8aa8-4460e087acbd)
INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)
VALUES
  ('9700', 'ae549a95-5732-4b7f-8aa8-4460e087acbd', 100)
ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

-- Afficher le résultat
SELECT
  COUNT(*) as total_mappings,
  COUNT(DISTINCT act_econ_code) as unique_act_econ_codes,
  COUNT(DISTINCT main_category_id) as unique_categories
FROM act_econ_to_main_category;

-- Devrait afficher: 74 mappings, 74 codes ACT_ECON, 14 catégories
