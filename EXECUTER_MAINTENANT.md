# 🚨 EXÉCUTER CE SCRIPT MAINTENANT DANS SUPABASE

## Erreur actuelle:
```
Could not find the 'notes' column of 'business_claims' in the schema cache
```

---

## ⚡ SOLUTION RAPIDE (5 minutes)

### Étape 1: Ouvrir Supabase
1. Allez sur: **https://supabase.com/dashboard**
2. Connectez-vous
3. Sélectionnez votre projet

### Étape 2: SQL Editor
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur le bouton **"+ New query"** (en haut)

### Étape 3: Copier-coller ce script

```sql
-- ✅ SCRIPT DE CORRECTION - Ajouter les colonnes manquantes
-- Exécution sans risque - utilise IF NOT EXISTS

ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS user_phone VARCHAR(50);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50);
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS verification_data JSONB;
ALTER TABLE business_claims ADD COLUMN IF NOT EXISTS notes TEXT;

-- Vérifier que tout est OK
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'business_claims'
ORDER BY ordinal_position;
```

### Étape 4: Exécuter
1. Cliquez sur le bouton **"Run"** (ou CTRL+Enter / CMD+Enter)
2. Attendez 2 secondes
3. ✅ Vous devriez voir "Success" et la liste des colonnes

### Étape 5: Vérifier le résultat
En bas, vous devriez voir ces colonnes:

```
✅ user_email
✅ user_name
✅ user_phone
✅ verification_method
✅ verification_data
✅ notes
```

---

## 🎯 Après l'exécution

1. Retournez sur votre site web
2. Essayez de réclamer une fiche
3. ✅ Ça devrait fonctionner!

---

## ❓ Besoin d'aide?

Le script est **sans danger** car il utilise `IF NOT EXISTS`:
- Si la colonne existe déjà → rien ne se passe
- Si la colonne n'existe pas → elle est créée

Vous pouvez l'exécuter plusieurs fois sans problème.

---

## 📸 Capture d'écran du résultat attendu

Après l'exécution, vous devriez voir quelque chose comme:

```
column_name          | data_type
---------------------|----------------------
id                   | uuid
business_id          | uuid
user_id              | uuid
user_email           | character varying  ⭐ NOUVEAU
user_name            | character varying  ⭐ NOUVEAU
user_phone           | character varying  ⭐ NOUVEAU
verification_method  | character varying  ⭐ NOUVEAU
verification_data    | jsonb              ⭐ NOUVEAU
notes                | text               ⭐ NOUVEAU
status               | character varying
created_at           | timestamp
```

---

**Une fois exécuté, rechargez votre site et tout fonctionnera!** ✅
