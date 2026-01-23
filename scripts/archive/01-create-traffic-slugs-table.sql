-- ÉTAPE 1: Créer une table temporaire avec les slugs de trafic
-- Copie ce script COMPLET dans Supabase SQL Editor et clique Run

CREATE TABLE IF NOT EXISTS traffic_slugs (
  slug TEXT PRIMARY KEY
);

-- Vider si existe déjà
TRUNCATE traffic_slugs;
