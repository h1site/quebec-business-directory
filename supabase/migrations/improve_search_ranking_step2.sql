-- ================================================
-- ÉTAPE 2: Créer les fonctions et index de recherche
-- ================================================
-- IMPORTANT: Exécuter APRÈS l'étape 1 (activation de unaccent)
-- ================================================

-- Fonction pour normaliser le texte (minuscules + sans accents)
-- Cela permet "rennai" de trouver "Rennaï"
CREATE OR REPLACE FUNCTION normalize_text(text)
RETURNS text
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT lower(unaccent($1));
$$;

-- Test de la fonction
DO $$
DECLARE
  test_result text;
BEGIN
  test_result := normalize_text('Rennaï Café');
  IF test_result = 'rennai cafe' THEN
    RAISE NOTICE 'Fonction normalize_text fonctionne correctement: % -> %', 'Rennaï Café', test_result;
  ELSE
    RAISE WARNING 'Fonction normalize_text retourne un résultat inattendu: %', test_result;
  END IF;
END $$;

-- Créer un index GIN sur le nom normalisé pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_businesses_normalized_name
ON businesses USING gin(to_tsvector('simple', normalize_text(name)));

-- Créer un index GIN sur l'adresse normalisée
CREATE INDEX IF NOT EXISTS idx_businesses_normalized_address
ON businesses USING gin(to_tsvector('simple', normalize_text(address)));

-- Créer un index pour la priorisation des fiches
-- Les fiches avec is_claimed=true ou source='manual' sont prioritaires
CREATE INDEX IF NOT EXISTS idx_businesses_priority
ON businesses (is_claimed DESC NULLS LAST, (CASE WHEN source = 'manual' THEN 1 ELSE 0 END) DESC, created_at DESC);

RAISE NOTICE 'Index créés avec succès!';
