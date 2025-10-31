-- ========================================
-- POLITIQUES RLS POUR LES SPONSORS
-- ========================================
-- Ces politiques permettent l'accès public aux sponsors actifs
-- Exécutez ce fichier dans Supabase SQL Editor

-- Activer RLS sur la table sponsors
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public can view active sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can manage all sponsors" ON sponsors;

-- Politique pour permettre à tout le monde de voir les sponsors actifs
CREATE POLICY "Public can view active sponsors"
ON sponsors
FOR SELECT
USING (is_active = true);

-- Politique pour permettre aux utilisateurs authentifiés de voir tous les sponsors
CREATE POLICY "Authenticated can view all sponsors"
ON sponsors
FOR SELECT
TO authenticated
USING (true);

-- Politique pour permettre aux utilisateurs authentifiés d'insérer des sponsors
CREATE POLICY "Authenticated can insert sponsors"
ON sponsors
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour des sponsors
CREATE POLICY "Authenticated can update sponsors"
ON sponsors
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer des sponsors
CREATE POLICY "Authenticated can delete sponsors"
ON sponsors
FOR DELETE
TO authenticated
USING (true);

-- Activer RLS sur sponsor_stats
ALTER TABLE sponsor_stats ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de lire les stats (optionnel - peut être restreint)
CREATE POLICY "Public can view sponsor stats"
ON sponsor_stats
FOR SELECT
USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de gérer les stats
CREATE POLICY "Authenticated can manage sponsor stats"
ON sponsor_stats
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Activer RLS sur sponsor_impression_tracking
ALTER TABLE sponsor_impression_tracking ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (pour le tracking)
CREATE POLICY "Anyone can track impressions"
ON sponsor_impression_tracking
FOR INSERT
WITH CHECK (true);

-- Politique pour permettre aux authentifiés de voir les impressions
CREATE POLICY "Authenticated can view impressions"
ON sponsor_impression_tracking
FOR SELECT
TO authenticated
USING (true);

-- Activer RLS sur sponsor_click_tracking
ALTER TABLE sponsor_click_tracking ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (pour le tracking)
CREATE POLICY "Anyone can track clicks"
ON sponsor_click_tracking
FOR INSERT
WITH CHECK (true);

-- Politique pour permettre aux authentifiés de voir les clicks
CREATE POLICY "Authenticated can view clicks"
ON sponsor_click_tracking
FOR SELECT
TO authenticated
USING (true);

-- ========================================
-- VÉRIFICATION
-- ========================================
-- Exécutez cette requête pour vérifier que les politiques sont actives:
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('sponsors', 'sponsor_stats', 'sponsor_impression_tracking', 'sponsor_click_tracking');
