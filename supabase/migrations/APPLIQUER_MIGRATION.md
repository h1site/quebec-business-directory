# 🔍 Guide d'application des améliorations de recherche

## Problème résolu
- ✅ "rennai" trouve maintenant "Rennaï" (recherche insensible aux accents)
- ✅ Fiches réclamées et manuelles en tête des résultats

---

## 📋 Instructions (3 étapes simples)

### Étape 1: Activer l'extension unaccent

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Clique sur **"SQL Editor"** dans le menu gauche
4. Clique sur **"New Query"**
5. Copie-colle ce SQL:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

6. Clique sur **"Run"** ou appuie sur `Ctrl+Enter`
7. Tu devrais voir: `Success. No rows returned`

---

### Étape 2: Créer la fonction normalize_text

Nouvelle query, copie-colle:

```sql
-- Fonction pour normaliser le texte (minuscules + sans accents)
CREATE OR REPLACE FUNCTION normalize_text(text)
RETURNS text
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT lower(unaccent($1));
$$;

-- Test
SELECT normalize_text('Rennaï Café');
-- Devrait retourner: "rennai cafe"
```

Clique **"Run"**. Tu devrais voir le résultat "rennai cafe".

---

### Étape 3: Créer les index

Nouvelle query, copie-colle:

```sql
-- Index sur nom normalisé
CREATE INDEX IF NOT EXISTS idx_businesses_normalized_name
ON businesses USING gin(to_tsvector('simple', normalize_text(name)));

-- Index sur adresse normalisée
CREATE INDEX IF NOT EXISTS idx_businesses_normalized_address
ON businesses USING gin(to_tsvector('simple', normalize_text(address)));

-- Index de priorisation
CREATE INDEX IF NOT EXISTS idx_businesses_priority
ON businesses (
  is_claimed DESC NULLS LAST,
  (CASE WHEN source = 'manual' THEN 1 ELSE 0 END) DESC,
  created_at DESC
);
```

Clique **"Run"**. Ça peut prendre 1-2 minutes (création d'index sur 480k entreprises).

---

### Étape 4: Mettre à jour la vue

**IMPORTANT**: Copie-colle TOUT le contenu du fichier `improve_search_ranking_step3.sql`

Ou copie ceci:

```sql
-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- Recréer avec les nouveaux champs
CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.id as main_category_id,
  mc.slug as main_category_slug,
  mc.label_fr as main_category_label_fr,
  mc.label_en as main_category_label_en,
  sc.id as sub_category_id,
  sc.slug as sub_category_slug,
  sc.label_fr as sub_category_label_fr,
  sc.label_en as sub_category_label_en,
  bs.id as business_size_id,
  bs.label_fr as business_size_label_fr,
  bs.label_en as business_size_label_en,
  -- Score de priorité
  CASE
    WHEN b.is_claimed = true THEN 3
    WHEN b.source = 'manual' THEN 2
    ELSE 1
  END as search_priority_score,
  -- Champs normalisés
  normalize_text(b.name) as normalized_name,
  normalize_text(b.address) as normalized_address
FROM businesses b
LEFT JOIN main_categories mc ON b.main_category_id = mc.id
LEFT JOIN sub_categories sc ON b.sub_category_id = sc.id
LEFT JOIN business_sizes bs ON b.business_size_id = bs.id;
```

Clique **"Run"**.

---

## ✅ Vérification

Pour vérifier que tout fonctionne, exécute:

```sql
-- Test 1: Recherche sans accents
SELECT name, search_priority_score, is_claimed, source
FROM businesses_enriched
WHERE normalized_name LIKE '%rennai%'
LIMIT 5;

-- Test 2: Vérifier les scores de priorité
SELECT
  search_priority_score,
  COUNT(*) as nombre,
  CASE
    WHEN search_priority_score = 3 THEN 'Fiches réclamées'
    WHEN search_priority_score = 2 THEN 'Fiches manuelles'
    ELSE 'Fiches GMB'
  END as type
FROM businesses_enriched
GROUP BY search_priority_score
ORDER BY search_priority_score DESC;
```

---

## 🎉 C'est tout!

L'application utilise maintenant automatiquement:
- ✅ La recherche insensible aux accents
- ✅ Le tri par priorité (claimed > manual > GMB)

---

## ⚠️ En cas d'erreur

### Erreur: "function unaccent does not exist"
→ Retourne à l'étape 1, l'extension n'est pas activée

### Erreur: "permission denied"
→ Tu n'as peut-être pas les droits. Va dans Settings > Database > Connection String et utilise le "Service Role Key" au lieu du "Anon Key"

### Erreur: "relation does not exist"
→ Vérifie que les tables `businesses`, `main_categories`, etc. existent bien

---

## 📞 Support

Si tu rencontres des problèmes, envoie-moi:
1. Le message d'erreur complet
2. L'étape où ça bloque
