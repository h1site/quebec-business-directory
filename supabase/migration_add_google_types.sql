-- Migration: Ajouter colonnes pour types Google et statut business
-- Description: Permet de stocker les catégories Google (plus précises que SCIAN)

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS google_types TEXT,
ADD COLUMN IF NOT EXISTS business_status VARCHAR(20) DEFAULT 'OPERATIONAL';

-- Index pour recherche par types Google
CREATE INDEX IF NOT EXISTS businesses_google_types_idx ON businesses USING GIN (to_tsvector('english', google_types));

-- Commentaires
COMMENT ON COLUMN businesses.google_types IS 'Types de business Google Places (ex: restaurant,cafe,bar)';
COMMENT ON COLUMN businesses.business_status IS 'Statut du business: OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY';
