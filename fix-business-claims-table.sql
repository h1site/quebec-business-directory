-- Ajouter la colonne user_email si elle n'existe pas déjà
ALTER TABLE business_claims
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Ajouter les autres colonnes manquantes si nécessaire
ALTER TABLE business_claims
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

ALTER TABLE business_claims
ADD COLUMN IF NOT EXISTS user_phone VARCHAR(50);

ALTER TABLE business_claims
ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50);

ALTER TABLE business_claims
ADD COLUMN IF NOT EXISTS verification_data JSONB;

ALTER TABLE business_claims
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'business_claims'
ORDER BY ordinal_position;
