-- ============================================================================
-- DIAGNOSTIC D'URGENCE pour Supabase SQL Editor
-- ============================================================================
-- Copie-colle ces requêtes UNE PAR UNE dans SQL Editor
-- ============================================================================

-- REQUÊTE 1: Processus actifs (requêtes en cours)
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

-- REQUÊTE 2: Nombre de connexions par application
SELECT
    application_name,
    state,
    COUNT(*) as count
FROM pg_stat_activity
GROUP BY application_name, state
ORDER BY count DESC;

-- REQUÊTE 3: Tables les plus volumineuses
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

-- REQUÊTE 4: Statistiques AUTOVACUUM (dead tuples)
SELECT
    schemaname,
    relname,
    last_vacuum,
    last_autovacuum,
    vacuum_count,
    autovacuum_count,
    n_dead_tup as dead_tuples,
    n_live_tup as live_tuples,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) as dead_tuple_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC
LIMIT 10;

-- REQUÊTE 5: Cache hit ratio (doit être > 95%)
SELECT
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit)  as heap_hit,
    ROUND(sum(heap_blks_hit) / NULLIF((sum(heap_blks_hit) + sum(heap_blks_read)), 0) * 100, 2) AS cache_hit_ratio_percent
FROM pg_statio_user_tables;
