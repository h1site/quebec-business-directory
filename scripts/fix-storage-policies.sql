-- =====================================================================
-- 📜 SCRIPT DE CORRECTION DE SÉCURITÉ POUR SUPABASE STORAGE
-- =====================================================================
--
-- ⚠️ **ACTION REQUISE**: Exécutez ce script dans l'éditeur SQL de votre
--    projet Supabase pour corriger une vulnérabilité critique.
--
-- **PROBLÈME DÉTECTÉ** (Audit de Sécurité du 2025-10-26):
-- Le bucket `review-photos` est trop permissif. N'importe quel
-- utilisateur authentifié peut supprimer les photos de n'importe quel autre
-- utilisateur, ce qui présente un risque majeur pour l'intégrité des données.
--
-- **CHANGEMENTS APPORTÉS PAR CE SCRIPT**:
-- 1. Supprime l'ancienne politique de suppression non sécurisée.
-- 2. Crée une nouvelle politique qui autorise un utilisateur à supprimer
--    UNIQUEMENT les photos liées à ses propres critiques.
-- 3. Supprime l'ancienne politique d'insertion.
-- 4. Crée une nouvelle politique d'insertion qui force les téléversements
--    dans un dossier correspondant à l'ID de l'utilisateur, empêchant
--    les téléversements non autorisés dans des dossiers arbitraires.
--
-- =====================================================================

-- =====================================================================
-- ÉTAPE 1: Corriger la politique de SUPPRESSION (DELETE)
-- =====================================================================

-- Supprimer l'ancienne politique permissive si elle existe
-- Utilise `DROP POLICY IF EXISTS` pour une exécution sans erreur
DROP POLICY IF EXISTS "Users can delete review photos" ON storage.objects;

-- Créer la nouvelle politique sécurisée pour la suppression
-- Un utilisateur peut supprimer une photo seulement s'il est le propriétaire
-- de la critique (`business_reviews`) à laquelle la photo est associée.
CREATE POLICY "Users can delete their own review photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'review-photos'
    AND auth.uid() IS NOT NULL
    AND (
      -- Vérifier que la photo (par son nom) appartient à une des critiques de l'utilisateur
      EXISTS (
        SELECT 1 FROM public.business_reviews br
        WHERE br.user_id = auth.uid()
        AND name = ANY(br.photos)
      )
    )
  );

-- =====================================================================
-- ÉTAPE 2: Corriger la politique d'INSERTION (INSERT)
-- =====================================================================

-- Supprimer l'ancienne politique permissive si elle existe
DROP POLICY IF EXISTS "Authenticated users can upload review photos" ON storage.objects;

-- Créer la nouvelle politique sécurisée pour l'insertion
-- Force l'utilisateur à téléverser des fichiers dans un dossier qui
-- correspond à son `user_id`. (Ex: `user-id-123/photo.jpg`)
CREATE POLICY "Users can upload review photos with path validation"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- FIN DU SCRIPT
-- Après exécution, la vulnérabilité est corrigée.
-- =====================================================================
