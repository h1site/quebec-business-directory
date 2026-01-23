-- Performance Optimizations - ÉTAPE 6 (Trigram Index - LOURD)
-- Temps estimé: 10-20 minutes
-- ATTENTION: Cet index est très lourd, la table sera verrouillée pendant la création
-- Recommandation: Exécuter pendant heures creuses si possible

-- Option: Augmenter le timeout si nécessaire
-- SET statement_timeout = '30min';

CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON businesses USING gin(name gin_trgm_ops);

SELECT 'Étape 6 complétée: Index trigram sur name (recherche ILIKE)' as status;
SELECT 'Cet index améliore les recherches par nom d''entreprise' as note;
