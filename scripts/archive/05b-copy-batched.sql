-- ÉTAPE 5b: Copier par batch (si l'étape 5 timeout)
-- Exécute chaque batch séparément, attends la fin avant le suivant

-- BATCH 1: 100,000 premiers
INSERT INTO businesses_archive
SELECT * FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
AND b.id NOT IN (SELECT id FROM businesses_archive)
LIMIT 100000;

-- Vérifier progression
SELECT COUNT(*) as archived_so_far FROM businesses_archive;

-- BATCH 2: 100,000 suivants (exécute après batch 1)
/*
INSERT INTO businesses_archive
SELECT * FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
AND b.id NOT IN (SELECT id FROM businesses_archive)
LIMIT 100000;

SELECT COUNT(*) as archived_so_far FROM businesses_archive;
*/

-- BATCH 3: 100,000 suivants (exécute après batch 2)
/*
INSERT INTO businesses_archive
SELECT * FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
AND b.id NOT IN (SELECT id FROM businesses_archive)
LIMIT 100000;

SELECT COUNT(*) as archived_so_far FROM businesses_archive;
*/

-- BATCH 4: 100,000 suivants (exécute après batch 3)
/*
INSERT INTO businesses_archive
SELECT * FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
AND b.id NOT IN (SELECT id FROM businesses_archive)
LIMIT 100000;

SELECT COUNT(*) as archived_so_far FROM businesses_archive;
*/

-- BATCH 5: Le reste (exécute après batch 4)
/*
INSERT INTO businesses_archive
SELECT * FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)
AND b.id NOT IN (SELECT id FROM businesses_archive);

SELECT COUNT(*) as total_archived FROM businesses_archive;
*/
