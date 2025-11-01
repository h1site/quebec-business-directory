-- ================================================
-- MIGRATION: Amélioration de la recherche
-- ================================================
-- Cette version fonctionne avec la structure réelle de la base de données
-- Ajoute la priorisation des fiches (claimed > manual > gmb)
-- ================================================

-- 1. Créer l'index de priorisation
-- Les fiches réclamées (is_claimed=true) et manuelles (data_source='manual') sont prioritaires
CREATE INDEX IF NOT EXISTS idx_businesses_priority
ON businesses (
  is_claimed DESC NULLS LAST,
  (CASE WHEN data_source = 'manual' THEN 1 ELSE 0 END) DESC,
  created_at DESC
);

-- 2. Supprimer l'ancienne vue
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- 3. Recréer la vue avec le score de priorité
CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.slug as primary_main_category_slug,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  sc.slug as primary_sub_category_slug,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en,
  -- Score de priorité pour le tri des résultats
  -- 3 = Fiche réclamée (priorité maximale)
  -- 2 = Fiche créée manuellement
  -- 1 = Fiche importée de GMB
  CASE
    WHEN b.is_claimed = true THEN 3
    WHEN b.data_source = 'manual' THEN 2
    ELSE 1
  END as search_priority_score,
  -- Versions lowercase pour recherche insensible à la casse
  lower(b.name) as name_lower,
  lower(b.address) as address_lower
FROM businesses b
LEFT JOIN business_categories bc ON b.id = bc.business_id AND bc.is_primary = true
LEFT JOIN sub_categories sc ON bc.sub_category_id = sc.id
LEFT JOIN main_categories mc ON sc.main_category_id = mc.id;

-- 4. Créer un index sur le nom en minuscules
CREATE INDEX IF NOT EXISTS idx_businesses_name_lower
ON businesses (lower(name));

-- 5. Commenter la vue
COMMENT ON VIEW businesses_enriched IS 'Vue enrichie des entreprises avec catégories et score de priorité. Score: 3=réclamée, 2=manuelle, 1=GMB';

-- 6. Afficher les résultats
DO $$
DECLARE
  claimed_count int;
  manual_count int;
  gmb_count int;
  total_count int;
BEGIN
  SELECT COUNT(*) INTO claimed_count FROM businesses WHERE is_claimed = true;
  SELECT COUNT(*) INTO manual_count FROM businesses WHERE data_source = 'manual';
  SELECT COUNT(*) INTO gmb_count FROM businesses WHERE data_source = 'gmb';
  SELECT COUNT(*) INTO total_count FROM businesses;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée avec succès!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistiques:';
  RAISE NOTICE '   Total: % entreprises', total_count;
  RAISE NOTICE '   Fiches réclamées: % (priorité 3)', claimed_count;
  RAISE NOTICE '   Fiches manuelles: % (priorité 2)', manual_count;
  RAISE NOTICE '   Fiches GMB: % (priorité 1)', gmb_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Ordre de tri dans les résultats de recherche:';
  RAISE NOTICE '   1️⃣  Fiches réclamées (is_claimed = true)';
  RAISE NOTICE '   2️⃣  Fiches créées manuellement (data_source = manual)';
  RAISE NOTICE '   3️⃣  Fiches importées GMB (data_source = gmb)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Note: Recherche insensible à la casse activée';
  RAISE NOTICE '   "MONTREAL" trouve "Montréal", "Montreal", "montreal"';
  RAISE NOTICE '';
END $$;
