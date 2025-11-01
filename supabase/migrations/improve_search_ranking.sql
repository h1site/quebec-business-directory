-- ================================================
-- AMÉLIORATION DU SYSTÈME DE RECHERCHE
-- ================================================
-- 1. Recherche insensible aux accents (rennai trouve rennaï)
-- 2. Priorisation des fiches réclamées et créées manuellement
-- ================================================

-- Activer l'extension unaccent pour la recherche sans accents
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Fonction pour normaliser le texte (minuscules + sans accents)
-- Cela permet "rennai" de trouver "Rennaï"
CREATE OR REPLACE FUNCTION normalize_text(text)
RETURNS text
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT lower(unaccent($1));
$$;

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

-- Mettre à jour la vue businesses_enriched pour inclure un score de priorité
DROP VIEW IF EXISTS businesses_enriched CASCADE;

CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.id as main_category_id,
  mc.slug as main_category_slug,
  mc.label_fr as main_category_label_fr,
  mc.label_en as main_category_label_en,
  sc.id as sub_category_id,
  sc.slug as sub_category_slug,
  sc.label_fr as sub_category_label_fr,
  sc.label_en as sub_category_label_en,
  bs.id as business_size_id,
  bs.label_fr as business_size_label_fr,
  bs.label_en as business_size_label_en,
  -- Score de priorité pour le tri des résultats
  -- Les fiches réclamées ont le score le plus élevé (3)
  -- Les fiches manuelles ont un score de 2
  -- Les fiches GMB ont un score de 1
  CASE
    WHEN b.is_claimed = true THEN 3
    WHEN b.source = 'manual' THEN 2
    ELSE 1
  END as search_priority_score,
  -- Nom normalisé pour recherche insensible aux accents
  normalize_text(b.name) as normalized_name,
  normalize_text(b.address) as normalized_address
FROM businesses b
LEFT JOIN main_categories mc ON b.main_category_id = mc.id
LEFT JOIN sub_categories sc ON b.sub_category_id = sc.id
LEFT JOIN business_sizes bs ON b.business_size_id = bs.id;

-- Commenter sur la vue
COMMENT ON VIEW businesses_enriched IS 'Vue enrichie des entreprises avec catégories jointes et score de priorité pour la recherche. Les fiches réclamées (is_claimed=true) ont la priorité la plus élevée (3), suivies des fiches manuelles (source=manual, score 2), puis des fiches GMB (score 1).';

-- Créer un index sur le score de priorité de la vue (materialized view serait mieux mais nécessite plus de gestion)
-- Note: Les vues normales ne peuvent pas avoir d'index directs,
-- mais les index sur la table businesses seront utilisés par le query planner

-- Fonction de recherche améliorée qui retourne les résultats triés par priorité
CREATE OR REPLACE FUNCTION search_businesses_smart(
  search_term text,
  max_results int DEFAULT 20
)
RETURNS TABLE (
  id bigint,
  name text,
  address text,
  city text,
  phone text,
  website text,
  is_claimed boolean,
  source text,
  search_priority_score int,
  relevance_rank real
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.address,
    b.city,
    b.phone,
    b.website,
    b.is_claimed,
    b.source,
    CASE
      WHEN b.is_claimed = true THEN 3
      WHEN b.source = 'manual' THEN 2
      ELSE 1
    END as search_priority_score,
    ts_rank(b.search_vector, websearch_to_tsquery('french', search_term)) as relevance_rank
  FROM businesses b
  WHERE
    b.search_vector @@ websearch_to_tsquery('french', search_term)
    OR normalize_text(b.name) LIKE '%' || normalize_text(search_term) || '%'
    OR normalize_text(b.address) LIKE '%' || normalize_text(search_term) || '%'
  ORDER BY
    -- 1. Prioriser par type de fiche (réclamée > manuelle > GMB)
    CASE
      WHEN b.is_claimed = true THEN 3
      WHEN b.source = 'manual' THEN 2
      ELSE 1
    END DESC,
    -- 2. Puis par pertinence du texte
    ts_rank(b.search_vector, websearch_to_tsquery('french', search_term)) DESC,
    -- 3. Enfin par date de création (plus récent d'abord)
    b.created_at DESC
  LIMIT max_results;
END;
$$;

-- Commenter sur la fonction
COMMENT ON FUNCTION search_businesses_smart IS 'Recherche intelligente avec normalisation des accents et priorisation des fiches réclamées/manuelles. Utilise normalize_text() pour permettre "rennai" de trouver "Rennaï".';

-- Exemple d'utilisation:
-- SELECT * FROM search_businesses_smart('rennai', 20);
-- Trouvera "Rennaï" même sans accents grâce à normalize_text()
