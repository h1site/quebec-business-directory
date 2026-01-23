-- Performance Optimizations - ÉTAPE 6 (Trigram Index - LOURD)
-- Exécuter après l'étape 5
-- ATTENTION: Cet index est LOURD et peut prendre 10-20 minutes
-- Il améliore drastiquement les recherches ILIKE sur les noms

-- ============================================================================
-- INDEX TRIGRAM pour recherche de texte sur name
-- ============================================================================

-- Cet index permet des recherches rapides avec ILIKE '%text%'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_name_trgm
ON businesses
USING gin(name gin_trgm_ops);

-- Vérification
SELECT 'Index trigram sur name créé' as status;
SELECT 'Cet index améliore les recherches ILIKE sur les noms d''entreprises' as note;
