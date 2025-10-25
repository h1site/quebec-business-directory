-- Ajouter la colonne is_visible à la table businesses
-- Par défaut, toutes les entreprises sont visibles (true)

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_businesses_is_visible
ON businesses(is_visible);

-- Créer un index composé pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_businesses_visible_source
ON businesses(is_visible, data_source);

COMMENT ON COLUMN businesses.is_visible IS 'Indique si l''entreprise est visible sur le site (doit avoir au moins un téléphone ou site web)';
