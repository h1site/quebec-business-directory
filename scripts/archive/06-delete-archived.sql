-- ÉTAPE 6: Supprimer les businesses archivées de la table principale
-- ⚠️ ATTENTION: Exécute seulement après avoir vérifié que l'archive est complète!

-- D'abord, vérifier que les counts matchent
SELECT
  (SELECT COUNT(*) FROM businesses_archive) as in_archive,
  (SELECT COUNT(*) FROM businesses b
   WHERE (b.website IS NULL OR b.website = '')
   AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug)) as to_delete,
  CASE
    WHEN (SELECT COUNT(*) FROM businesses_archive) =
         (SELECT COUNT(*) FROM businesses b
          WHERE (b.website IS NULL OR b.website = '')
          AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug))
    THEN 'OK - Tu peux supprimer!'
    ELSE 'ATTENTION - Les counts ne matchent pas!'
  END as status;

-- Si OK, décommente et exécute:
/*
DELETE FROM businesses b
WHERE (b.website IS NULL OR b.website = '')
AND NOT EXISTS (SELECT 1 FROM traffic_slugs t WHERE t.slug = b.slug);
*/
