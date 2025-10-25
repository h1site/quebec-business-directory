-- =====================================================
-- 🔧 SCRIPT DE CORRECTION BUSINESS_CLAIMS
-- =====================================================
-- À exécuter dans Supabase SQL Editor
-- Sans danger - utilise IF NOT EXISTS
-- =====================================================

-- Ajouter les colonnes manquantes
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS user_phone VARCHAR(50);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS verification_data JSONB;
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS notes TEXT;

-- Vérifier que tout est OK (résultat affiché en bas)
SELECT
  column_name,
  data_type,
  CASE
    WHEN column_name IN ('user_email', 'user_name', 'user_phone', 'verification_method', 'verification_data', 'notes')
    THEN '✅ AJOUTÉE'
    ELSE '  '
  END as status
FROM information_schema.columns
WHERE table_name = 'business_claims'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ Après exécution, vous devriez voir:
--    - user_email ✅
--    - user_name ✅
--    - user_phone ✅
--    - verification_method ✅
--    - verification_data ✅
--    - notes ✅
-- =====================================================
