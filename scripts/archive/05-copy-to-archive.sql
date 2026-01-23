-- ÉTAPE 5: Copier les businesses dans l'archive
-- ATTENTION: Cette étape peut prendre 2-5 minutes
-- Si timeout, utilise le script 05b-copy-batched.sql

INSERT INTO businesses_archive
SELECT * FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);

-- Vérifier le nombre copié
SELECT COUNT(*) as archived_count FROM businesses_archive;
