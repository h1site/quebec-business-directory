-- Migration: Ajouter la colonne main_category_slug à la table businesses
-- Pour améliorer les performances du sitemap (éviter les JOINs complexes)

-- 1. Ajouter la colonne
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS main_category_slug TEXT;

-- 2. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug);

-- 3. Remplir la colonne avec les données existantes depuis business_categories
UPDATE businesses b
SET main_category_slug = mc.slug
FROM business_categories bc
INNER JOIN sub_categories sc ON bc.sub_category_id = sc.id
INNER JOIN main_categories mc ON sc.main_category_id = mc.id
WHERE b.id = bc.business_id
  AND bc.is_primary = true
  AND b.main_category_slug IS NULL;

-- 4. Afficher les statistiques
DO $$
DECLARE
  total_businesses INT;
  with_category INT;
  without_category INT;
BEGIN
  SELECT COUNT(*) INTO total_businesses FROM businesses;
  SELECT COUNT(*) INTO with_category FROM businesses WHERE main_category_slug IS NOT NULL;
  SELECT COUNT(*) INTO without_category FROM businesses WHERE main_category_slug IS NULL;

  RAISE NOTICE '✅ Migration terminée!';
  RAISE NOTICE '   Total businesses: %', total_businesses;
  RAISE NOTICE '   Avec catégorie: % (%.1f%%)', with_category, (with_category::FLOAT / total_businesses * 100);
  RAISE NOTICE '   Sans catégorie: % (%.1f%%)', without_category, (without_category::FLOAT / total_businesses * 100);
END $$;
