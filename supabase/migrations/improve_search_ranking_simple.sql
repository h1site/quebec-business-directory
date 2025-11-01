-- ================================================
-- AMÉLIORATION RECHERCHE - VERSION SIMPLE (sans unaccent)
-- ================================================
-- Cette version n'utilise PAS l'extension unaccent
-- Elle fonctionne sur tous les environnements Supabase
-- ================================================

-- 1. Créer des index pour la priorisation des fiches
-- Les fiches avec is_claimed=true ou source='manual' sont prioritaires
CREATE INDEX IF NOT EXISTS idx_businesses_priority
ON businesses (
  is_claimed DESC NULLS LAST,
  (CASE WHEN source = 'manual' THEN 1 ELSE 0 END) DESC,
  created_at DESC
);

-- 2. Supprimer l'ancienne vue
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- 3. Recréer la vue avec le score de priorité
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
  -- Version lowercase du nom pour recherche insensible à la casse
  lower(b.name) as name_lower,
  lower(b.address) as address_lower
FROM businesses b
LEFT JOIN main_categories mc ON b.main_category_id = mc.id
LEFT JOIN sub_categories sc ON b.sub_category_id = sc.id
LEFT JOIN business_sizes bs ON b.business_size_id = bs.id;

-- 4. Créer un index sur le nom en minuscules
CREATE INDEX IF NOT EXISTS idx_businesses_name_lower
ON businesses (lower(name));

-- 5. Commenter sur la vue
COMMENT ON VIEW businesses_enriched IS 'Vue enrichie des entreprises avec catégories jointes et score de priorité pour la recherche. Les fiches réclamées (is_claimed=true) ont la priorité la plus élevée (3), suivies des fiches manuelles (source=manual, score 2), puis des fiches GMB (score 1).';

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Migration appliquée avec succès!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Nouveaux champs disponibles dans businesses_enriched:';
  RAISE NOTICE '   - search_priority_score (3=claimed, 2=manual, 1=gmb)';
  RAISE NOTICE '   - name_lower (nom en minuscules)';
  RAISE NOTICE '   - address_lower (adresse en minuscules)';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Ordre de tri:';
  RAISE NOTICE '   1. Fiches réclamées (is_claimed=true)';
  RAISE NOTICE '   2. Fiches manuelles (source=manual)';
  RAISE NOTICE '   3. Fiches GMB (source=gmb)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: Recherche insensible aux accents non disponible';
  RAISE NOTICE '   (extension unaccent non activée sur cet environnement)';
  RAISE NOTICE '   La recherche reste insensible à la casse (majuscules/minuscules)';
END $$;

-- Test du score de priorité
DO $$
DECLARE
  claimed_count int;
  manual_count int;
  gmb_count int;
BEGIN
  SELECT COUNT(*) INTO claimed_count FROM businesses WHERE is_claimed = true;
  SELECT COUNT(*) INTO manual_count FROM businesses WHERE source = 'manual';
  SELECT COUNT(*) INTO gmb_count FROM businesses WHERE source = 'gmb';

  RAISE NOTICE '';
  RAISE NOTICE '📈 Statistiques:';
  RAISE NOTICE '   Fiches réclamées: % (priorité 3)', claimed_count;
  RAISE NOTICE '   Fiches manuelles: % (priorité 2)', manual_count;
  RAISE NOTICE '   Fiches GMB: % (priorité 1)', gmb_count;
END $$;
