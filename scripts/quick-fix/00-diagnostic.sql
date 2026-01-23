-- DIAGNOSTIC: Vérifier l'état de la base de données avant de créer les index

-- 1. Vérifier les index existants sur businesses
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'businesses'
ORDER BY indexname;

-- 2. Vérifier le nombre de lignes dans businesses
SELECT COUNT(*) as total_businesses FROM businesses;

-- 3. Vérifier s'il y a des locks actifs
SELECT
    pg_class.relname,
    pg_locks.mode,
    pg_locks.granted
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
WHERE pg_class.relname IN ('businesses', 'reviews');

-- 4. Vérifier la taille de la table
SELECT
    pg_size_pretty(pg_total_relation_size('businesses')) as total_size,
    pg_size_pretty(pg_relation_size('businesses')) as table_size,
    pg_size_pretty(pg_indexes_size('businesses')) as indexes_size;

-- 5. Vérifier les statistiques de la table
SELECT
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE tablename = 'businesses';
