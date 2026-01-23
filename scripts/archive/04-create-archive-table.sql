-- ÉTAPE 4: Créer la table d'archive
-- Copie ce script dans Supabase SQL Editor et clique Run

CREATE TABLE IF NOT EXISTS businesses_archive (
  LIKE businesses INCLUDING ALL
);

-- Vérifier que la table existe
SELECT 'businesses_archive créée' as status;
