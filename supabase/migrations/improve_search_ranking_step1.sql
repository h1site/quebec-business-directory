-- ================================================
-- ÉTAPE 1: Activer l'extension unaccent
-- ================================================
-- Cette étape doit être exécutée en premier
-- Nécessite les droits superuser ou l'extension doit être dans shared_preload_libraries
-- ================================================

-- Activer l'extension unaccent pour la recherche sans accents
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Vérifier que l'extension est bien installée
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
    RAISE EXCEPTION 'Extension unaccent non disponible. Contactez votre administrateur Supabase.';
  END IF;
END $$;

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE 'Extension unaccent activée avec succès!';
END $$;
