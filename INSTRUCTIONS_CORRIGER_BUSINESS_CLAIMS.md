# ✅ Correction de la table business_claims

## Problème
Erreur: `Could not find the 'user_email' column of 'business_claims' in the schema cache`

## Solution
La colonne `user_email` (et autres colonnes nécessaires) manquent dans la table `business_claims`. Vous devez exécuter le script SQL pour les ajouter.

---

## Instructions (5 minutes)

### Étape 1: Ouvrir Supabase
1. Allez sur https://supabase.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### Étape 2: Ouvrir l'éditeur SQL
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"**

### Étape 3: Copier-coller le script SQL
Copiez et collez le script suivant:

```sql
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
```

### Étape 4: Exécuter le script
1. Cliquez sur le bouton **"Run"** (en bas à droite)
2. Vous devriez voir un message de succès
3. En bas, vous verrez la liste des colonnes de la table `business_claims`

### Étape 5: Vérifier que ça fonctionne
Vous devriez voir ces colonnes dans le résultat:
- ✅ `user_email`
- ✅ `user_name`
- ✅ `user_phone`
- ✅ `verification_method`
- ✅ `verification_data`
- ✅ `notes`

---

## Résultat attendu

Après l'exécution, la table `business_claims` aura la structure complète:

```
column_name          | data_type              | is_nullable
---------------------|------------------------|------------
id                   | uuid                   | NO
business_id          | uuid                   | NO
user_id              | uuid                   | NO
user_email           | character varying      | YES  ✨ AJOUTÉE
user_name            | character varying      | YES  ✨ AJOUTÉE
user_phone           | character varying      | YES  ✨ AJOUTÉE
verification_method  | character varying      | YES  ✨ AJOUTÉE
verification_data    | jsonb                  | YES  ✨ AJOUTÉE
notes                | text                   | YES  ✨ AJOUTÉE
status               | character varying      | YES
created_at           | timestamp              | YES
updated_at           | timestamp              | YES
```

---

## Test

Après avoir exécuté le script:

1. Retournez sur votre site web
2. Essayez de réclamer une fiche avec **"Demande manuelle"**
3. Remplissez le formulaire
4. Cliquez sur **"Soumettre la demande"**
5. ✅ Ça devrait fonctionner sans erreur!

---

## Note

Le script utilise `IF NOT EXISTS`, donc vous pouvez l'exécuter plusieurs fois sans problème. Si une colonne existe déjà, elle ne sera pas modifiée.

---

**Une fois le script exécuté, la réclamation de fiche fonctionnera parfaitement!** 🎯
