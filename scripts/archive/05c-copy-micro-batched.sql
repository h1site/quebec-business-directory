-- ÉTAPE 5c: Copier par MICRO-batch (50k à la fois)
-- Exécute CHAQUE requête séparément, UNE À LA FOIS

-- BATCH 1: 50,000 premiers
INSERT INTO businesses_archive
SELECT * FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
AND NOT EXISTS (SELECT 1 FROM businesses_archive a WHERE a.id = b.id)
LIMIT 50000;
