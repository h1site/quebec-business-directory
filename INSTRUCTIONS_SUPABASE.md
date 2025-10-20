# 📋 Instructions pour Exécuter les Migrations Supabase

## 🎯 Fichier à Exécuter

**Fichier:** `supabase/MIGRATIONS_A_EXECUTER.sql`

Ce fichier contient **TOUTES** les migrations nécessaires pour activer:
- ✅ Import REQ
- ✅ Système de réclamation de fiches
- ✅ Détection de doublons
- ✅ Slugs de catégories
- ✅ Support Google Types

---

## 🚀 Comment Exécuter les Migrations

### Étape 1: Ouvrir Supabase SQL Editor

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **quebec-business-directory**
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New Query** (ou "+ New query")

### Étape 2: Copier le Fichier SQL

1. Ouvrez le fichier `supabase/MIGRATIONS_A_EXECUTER.sql`
2. **Copiez TOUT le contenu** (Ctrl+A, Ctrl+C)
3. **Collez** dans le SQL Editor de Supabase (Ctrl+V)

### Étape 3: Exécuter les Migrations

1. Cliquez sur le bouton **Run** (en haut à droite) OU appuyez sur **Ctrl+Enter**
2. Attendez que l'exécution se termine (peut prendre 10-30 secondes)
3. Vérifiez qu'il n'y a **pas d'erreurs** dans l'output

### Étape 4: Vérifier que Tout Fonctionne

Vous devriez voir un message final comme:

```
Migration completed successfully!
total_businesses: 75
req_businesses: 75
claimed_businesses: 0
```

---

## ✅ Que Vont Faire Ces Migrations?

### 1. **Support Import REQ** (Registre des Entreprises du Québec)
- Ajoute les colonnes: `data_source`, `neq`, `etablissement_number`, `scian_code`, `mrc`
- Fixe la précision des coordonnées GPS
- Permet d'importer des entreprises depuis le CSV du REQ

### 2. **Système de Réclamation de Fiches**
- Crée la table `business_claims`
- Ajoute les colonnes: `claimed_by`, `claimed_at`, `is_claimed`
- **Auto-approbation** si domaine email = site web
- Politiques de sécurité (RLS) pour utilisateurs et admins

### 3. **Détection de Doublons**
- 8 nouveaux **indexes** pour recherches ultra-rapides:
  - Sur téléphone, nom, ville, adresse
  - Indexes composites (ville+nom, ville+adresse)
  - Google Place ID pour correspondance 100%
- Performance: **~50-100ms** pour analyser des milliers d'entreprises

### 4. **Slugs de Catégories**
- Recrée la vue `businesses_enriched`
- Ajoute `primary_main_category_slug` et `primary_sub_category_slug`
- URLs SEO-friendly pour navigation par catégorie

### 5. **Support Google Types**
- Ajoute colonne `google_types` (tableau de texte)
- Catégorisation plus précise via Google Places API

---

## ⚠️ Important

- **Les migrations sont idempotentes**: Vous pouvez les exécuter plusieurs fois sans problème
- **Aucune donnée ne sera perdue**: Seules des colonnes/tables/indexes sont ajoutés
- **Temps d'exécution**: ~10-30 secondes pour tout
- **Si erreur**: Contactez-moi avec le message d'erreur complet

---

## 🔍 Vérification Post-Migration

Pour vérifier que tout fonctionne, exécutez cette requête:

```sql
-- Vérifier les colonnes ajoutées
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'businesses'
ORDER BY ordinal_position;

-- Vérifier les indexes créés
SELECT indexname
FROM pg_indexes
WHERE tablename = 'businesses'
  AND indexname LIKE 'idx_businesses_%'
ORDER BY indexname;

-- Vérifier la table business_claims
SELECT COUNT(*) as total_claims FROM business_claims;
```

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Copiez le message d'erreur complet
2. Notez à quelle ligne l'erreur s'est produite
3. Contactez-moi avec ces informations

---

**Dernière mise à jour**: 2025-10-20
**Version**: 1.0.0
