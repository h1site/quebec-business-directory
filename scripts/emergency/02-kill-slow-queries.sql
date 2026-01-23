-- ============================================================================
-- TUER LES REQUÊTES LENTES (> 30 secondes)
-- ============================================================================
-- ATTENTION: Ceci va tuer toutes les requêtes qui tournent depuis plus de 30 sec
-- Ne pas exécuter si tu as des migrations ou imports en cours!
-- ============================================================================

-- Voir d'abord les requêtes qui vont être tuées
SELECT
    pid,
    NOW() - query_start as duration,
    state,
    LEFT(query, 80) as query_preview
FROM pg_stat_activity
WHERE state != 'idle'
AND pid != pg_backend_pid()
AND NOW() - query_start > interval '30 seconds'
AND query NOT LIKE '%autovacuum%'
ORDER BY query_start;

-- Décommenter la ligne suivante pour VRAIMENT tuer ces requêtes
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state != 'idle' AND pid != pg_backend_pid() AND NOW() - query_start > interval '30 seconds' AND query NOT LIKE '%autovacuum%';

\echo 'Pour tuer ces requêtes, décommenter la dernière ligne et ré-exécuter'
