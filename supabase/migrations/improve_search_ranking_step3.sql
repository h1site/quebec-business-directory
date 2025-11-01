-- ================================================
-- ÉTAPE 3: Mettre à jour la vue businesses_enriched
-- ================================================
-- IMPORTANT: Exécuter APRÈS l'étape 2
-- ================================================

-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- Recréer la vue avec les nouveaux champs
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

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE 'Vue businesses_enriched mise à jour avec succès!';
  RAISE NOTICE 'Nouveaux champs disponibles:';
  RAISE NOTICE '  - search_priority_score (3=claimed, 2=manual, 1=gmb)';
  RAISE NOTICE '  - normalized_name (pour recherche sans accents)';
  RAISE NOTICE '  - normalized_address (pour recherche adresse sans accents)';
END $$;
