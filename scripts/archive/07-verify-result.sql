-- ÉTAPE 7: Vérifier le résultat final
-- Copie ce script dans Supabase SQL Editor

SELECT
  COUNT(*) as remaining_businesses,
  COUNT(*) FILTER (WHERE website IS NOT NULL AND website != '') as with_website,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NOT NULL) as enriched
FROM businesses;

-- Résultats attendus:
-- remaining_businesses: ~50-60k
-- with_website: ~48k+
-- enriched: ~48k
