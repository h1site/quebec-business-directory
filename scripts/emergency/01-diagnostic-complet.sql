-- ============================================================================
-- DIAGNOSTIC D'URGENCE - CPU/Memory/Disk à 100%
-- ============================================================================
-- Exécuter dans Supabase SQL Editor pour identifier le problème
-- ============================================================================

\echo '========================================='
\echo 'DIAGNOSTIC URGENCE - Ressources à 100%'
\echo '========================================='
\echo ''

-- 1. PROCESSUS ACTIFS (requêtes en cours)
\echo '1. REQUÊTES ACTIVES EN CE MOMENT:'
\echo '-----------------------------------'
SELECT
    pid,
    usename,
    application_name,
    state,
    NOW() - query_start as duration,
    wait_event_type,
    wait_event,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE state != 'idle'
AND pid != pg_backend_pid()
ORDER BY query_start;

\echo ''
\echo '2. REQUÊTES BLOQUÉES (locks):'
\echo '-----------------------------------'
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

\echo ''
\echo '3. AUTOVACUUM EN COURS:'
\echo '-----------------------------------'
SELECT
    pid,
    NOW() - query_start as duration,
    query
FROM pg_stat_activity
WHERE query LIKE '%autovacuum%'
AND state != 'idle';

\echo ''
\echo '4. NOMBRE DE CONNEXIONS PAR APPLICATION:'
\echo '-----------------------------------'
SELECT
    application_name,
    state,
    COUNT(*) as count
FROM pg_stat_activity
GROUP BY application_name, state
ORDER BY count DESC;

\echo ''
\echo '5. TABLES LES PLUS VOLUMINEUSES:'
\echo '-----------------------------------'
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

\echo ''
\echo '6. INDEX MANQUANTS (suggestions):'
\echo '-----------------------------------'
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
AND tablename IN ('businesses', 'reviews')
AND n_distinct > 100
ORDER BY abs(correlation) DESC
LIMIT 10;

\echo ''
\echo '7. STATISTIQUES AUTOVACUUM:'
\echo '-----------------------------------'
SELECT
    schemaname,
    relname,
    last_vacuum,
    last_autovacuum,
    vacuum_count,
    autovacuum_count,
    n_dead_tup,
    n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC
LIMIT 10;

\echo ''
\echo '8. CACHE HIT RATIO (devrait être > 95%):'
\echo '-----------------------------------'
SELECT
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit)  as heap_hit,
    sum(heap_blks_hit) / NULLIF((sum(heap_blks_hit) + sum(heap_blks_read)), 0) * 100 AS cache_hit_ratio
FROM pg_statio_user_tables;

\echo ''
\echo '========================================='
\echo 'FIN DU DIAGNOSTIC'
\echo '========================================='
