-- Performance Optimizations - ÉTAPE 1 (Extension + Index Slug)
-- Temps estimé: 1-2 minutes
-- Note: Sans CONCURRENTLY pour compatibilité Supabase SQL Editor

-- ============================================================================
-- EXTENSION REQUISE
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- INDEX: Slug (très utilisé pour lookups de pages)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;

-- Vérification
SELECT 'Étape 1 complétée: Extension pg_trgm + Index slug' as status;
