-- ============================================================================
-- CORRECTIF SÉCURITÉ CRITIQUE: review-photos Bucket
-- Date: 2025-10-26
-- Problème: Policies trop permissives permettant suppression/upload non autorisés
-- ============================================================================

-- 1. SUPPRIMER LES POLICIES ACTUELLES (TROP PERMISSIVES)
DROP POLICY IF EXISTS "Authenticated users can upload review photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete review photos" ON storage.objects;

-- 2. CRÉER DE NOUVELLES POLICIES SÉCURISÉES

-- Policy INSERT: Forcer upload dans dossier user_id
-- Format obligatoire: review-photos/[user_id]/[filename]
CREATE POLICY "Users can upload photos in their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-photos'
    AND auth.uid() IS NOT NULL
    -- Forcer le path format: user_id/filename
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy DELETE: Permettre suppression seulement de ses propres photos
-- Vérifie que la photo appartient à une critique de l'utilisateur
CREATE POLICY "Users can delete only their own review photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'review-photos'
    AND auth.uid() IS NOT NULL
    AND (
      -- Vérifier que la photo appartient à une critique de cet utilisateur
      EXISTS (
        SELECT 1 FROM business_reviews br
        WHERE br.user_id = auth.uid()
        AND (
          -- La photo est dans l'array photos de la critique
          name = ANY(br.photos)
          -- OU le path commence par user_id (pour compatibilité)
          OR (storage.foldername(name))[1] = auth.uid()::text
        )
      )
    )
  );

-- Policy UPDATE: Permettre mise à jour metadata seulement pour ses photos
CREATE POLICY "Users can update metadata of their own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'review-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- NOTES D'IMPLÉMENTATION
-- ============================================================================

-- IMPORTANT: Le frontend doit uploader les photos avec ce format de path:
-- {user_id}/{timestamp}-{random}.{ext}
--
-- Exemple:
-- review-photos/550e8400-e29b-41d4-a716-446655440000/1698765432-abc123.jpg

-- MIGRATION DES PHOTOS EXISTANTES (si nécessaire):
-- Si des photos existent déjà sans suivre ce format, il faudra:
-- 1. Créer un script pour les déplacer vers le bon format
-- 2. Mettre à jour les références dans business_reviews.photos

-- VALIDATION CÔTÉ CLIENT À AJOUTER:
-- - Vérifier MIME type (image/jpeg, image/png, image/gif)
-- - Limiter taille (recommandé: 5MB max par photo)
-- - Limiter nombre de photos par critique (recommandé: 5 max)

-- ============================================================================
-- TESTS DE VALIDATION
-- ============================================================================

-- Test 1: Vérifier que les policies sont actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
  AND policyname LIKE '%review%';

-- Test 2: Compter les photos existantes
SELECT COUNT(*) as total_photos,
       COUNT(DISTINCT (storage.foldername(name))[1]) as unique_user_folders
FROM storage.objects
WHERE bucket_id = 'review-photos';

-- Test 3: Identifier les photos qui ne suivent pas le format user_id/filename
SELECT name, created_at
FROM storage.objects
WHERE bucket_id = 'review-photos'
  AND array_length(storage.foldername(name), 1) IS NULL
LIMIT 10;
