-- ÉTAPE 6b: Supprimer par batch (si l'étape 6 timeout)
-- Exécute chaque DELETE séparément

-- BATCH 1: Supprimer 100,000
DELETE FROM businesses
WHERE id IN (
  SELECT b.id FROM businesses b
  WHERE (b.website IS NULL OR b.website = '')
  AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
  LIMIT 100000
);

-- Vérifier combien il reste à supprimer
SELECT COUNT(*) as remaining_to_delete FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);

-- BATCH 2 (si remaining > 0)
/*
DELETE FROM businesses
WHERE id IN (
  SELECT b.id FROM businesses b
  WHERE (b.website IS NULL OR b.website = '')
  AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
  LIMIT 100000
);

SELECT COUNT(*) as remaining_to_delete FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);
*/

-- BATCH 3 (si remaining > 0)
/*
DELETE FROM businesses
WHERE id IN (
  SELECT b.id FROM businesses b
  WHERE (b.website IS NULL OR b.website = '')
  AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
  LIMIT 100000
);

SELECT COUNT(*) as remaining_to_delete FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);
*/

-- BATCH 4 (si remaining > 0)
/*
DELETE FROM businesses
WHERE id IN (
  SELECT b.id FROM businesses b
  WHERE (b.website IS NULL OR b.website = '')
  AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
  LIMIT 100000
);

SELECT COUNT(*) as remaining_to_delete FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);
*/

-- BATCH 5 (supprime le reste)
/*
DELETE FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);

SELECT COUNT(*) as remaining_businesses FROM businesses;
*/
