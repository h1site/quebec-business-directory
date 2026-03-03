-- ÉTAPE 5d: Copier par batch SIMPLE
-- Exécute cette requête PLUSIEURS FOIS jusqu'à ce que ça retourne 0

-- Copier 25,000 à la fois (répète jusqu'à 0 insérés)
WITH to_archive AS (
  SELECT b.* FROM businesses b
  WHERE (b.website IS NULL OR b.website = '')
  AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
  AND NOT EXISTS (SELECT 1 FROM businesses_archive a WHERE a.id = b.id)
  LIMIT 25000
)
INSERT INTO businesses_archive SELECT * FROM to_archive;

-- Vérifier la progression
SELECT
  (SELECT COUNT(*) FROM businesses_archive) as copied,
  (SELECT COUNT(*) FROM businesses WHERE (website IS NULL OR website = '')
   AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = businesses.slug)) as total_to_copy;
