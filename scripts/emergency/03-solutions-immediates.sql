-- ============================================================================
-- SOLUTIONS IMMÉDIATES - Réduire la charge Supabase
-- ============================================================================

-- 1. FORCER UN VACUUM sur businesses (libère l'espace et met à jour stats)
VACUUM ANALYZE businesses;

-- 2. FORCER UN VACUUM sur reviews
VACUUM ANALYZE reviews;

-- 3. Mettre à jour les statistiques du planificateur
ANALYZE businesses;
ANALYZE reviews;

-- 4. Réduire les dead tuples (lignes mortes)
-- Ceci va prendre du temps mais libère de l'espace
-- VACUUM FULL businesses; -- ATTENTION: Lock la table!
-- VACUUM FULL reviews; -- ATTENTION: Lock la table!

\echo 'VACUUM et ANALYZE complétés. Attendez 2-3 minutes et vérifiez les métriques.'
