-- Migration Fix: Corriger la contrainte NEQ pour supporter multi-établissements
-- Description: Un même NEQ peut avoir plusieurs établissements (NO_SUF_ETAB dans REQ)
--              Cette migration corrige la contrainte unique pour permettre cela

-- Étape 1: Ajouter colonne etablissement_number si elle n'existe pas
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS etablissement_number VARCHAR(5) DEFAULT '1';

-- Étape 2: Supprimer l'ancienne contrainte UNIQUE sur NEQ seul
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_neq_unique;

-- Étape 3: Créer nouvelle contrainte composite sur (neq, etablissement_number)
-- Cela permet qu'un même NEQ ait plusieurs établissements avec des numéros différents
ALTER TABLE businesses
ADD CONSTRAINT businesses_neq_etablissement_unique
UNIQUE (neq, etablissement_number);

-- Note: Appliquer cette migration dans Supabase SQL Editor
-- Ensuite relancer l'import: node scripts/import-req-businesses.js --limit=10
