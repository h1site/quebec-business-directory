-- ÉTAPE 3: Compter combien de businesses vont être archivées
-- Copie ce script dans Supabase SQL Editor et clique Run

SELECT
  COUNT(*) as total_to_archive,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NOT NULL) as enriched_to_archive,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NULL) as not_enriched_to_archive
FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);

-- Résultat attendu: ~430,000 businesses à archiver
