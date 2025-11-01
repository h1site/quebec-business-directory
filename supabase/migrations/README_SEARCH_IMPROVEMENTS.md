# Améliorations de la recherche

## Objectifs

1. **Recherche insensible aux accents** : Permettre à "rennai" de trouver "Rennaï"
2. **Priorisation des fiches** : Les fiches réclamées et manuelles apparaissent en premier dans les résultats

## Application de la migration

### Option 1: Via Supabase Dashboard (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "SQL Editor"
4. Copier-coller le contenu de `improve_search_ranking.sql`
5. Cliquer sur "Run"

### Option 2: Via psql

```bash
psql "postgresql://[CONNECTION_STRING]" < supabase/migrations/improve_search_ranking.sql
```

## Ce que fait la migration

### 1. Extension unaccent
Active l'extension PostgreSQL pour retirer les accents des textes.

### 2. Fonction normalize_text()
Crée une fonction qui :
- Convertit en minuscules
- Retire les accents
- Permet la recherche insensible aux accents

### 3. Index de recherche
Crée des index GIN sur :
- `normalized_name` : nom normalisé sans accents
- `normalized_address` : adresse normalisée

### 4. Score de priorité
Ajoute un `search_priority_score` dans la vue `businesses_enriched` :
- **3** = Fiche réclamée (`is_claimed = true`)
- **2** = Fiche créée manuellement (`source = 'manual'`)
- **1** = Fiche GMB (`source = 'gmb'`)

### 5. Vue businesses_enriched mise à jour
La vue inclut maintenant :
- `search_priority_score` : pour le tri
- `normalized_name` : pour la recherche sans accents
- `normalized_address` : pour la recherche d'adresse sans accents

### 6. Fonction search_businesses_smart()
Fonction PostgreSQL optimisée pour la recherche qui :
- Recherche avec et sans accents
- Trie par priorité (claimed > manual > GMB)
- Puis par pertinence du texte
- Puis par date de création

## Ordre de tri des résultats

Quand un utilisateur fait une recherche, les résultats sont triés dans cet ordre :

1. **Type de fiche** (search_priority_score DESC)
   - Fiches réclamées d'abord
   - Puis fiches manuelles
   - Puis fiches GMB

2. **Date de création** (created_at DESC)
   - Dans chaque catégorie, les plus récentes d'abord

## Exemples

### Recherche "rennai"
Trouvera :
- "Rennaï Café"
- "Restaurant Rennai"
- "RENNAI & Associés"

### Résultats triés
Si on recherche "restaurant" :
1. Restaurants avec fiche réclamée (is_claimed = true)
2. Restaurants créés manuellement (source = 'manual')
3. Restaurants importés de GMB (source = 'gmb')

Dans chaque groupe, les plus récents apparaissent en premier.

## Vérification

Après application, vérifier que :

```sql
-- 1. Extension active
SELECT * FROM pg_extension WHERE extname = 'unaccent';

-- 2. Fonction normalize_text existe
SELECT proname FROM pg_proc WHERE proname = 'normalize_text';

-- 3. Vue mise à jour
SELECT column_name FROM information_schema.columns
WHERE table_name = 'businesses_enriched'
AND column_name IN ('search_priority_score', 'normalized_name');

-- 4. Index créés
SELECT indexname FROM pg_indexes
WHERE tablename = 'businesses'
AND indexname LIKE 'idx_businesses_normalized%';

-- 5. Test de recherche
SELECT name, search_priority_score, is_claimed, source
FROM businesses_enriched
WHERE search_vector @@ websearch_to_tsquery('french', 'rennai')
OR normalized_name LIKE '%rennai%'
ORDER BY search_priority_score DESC, created_at DESC
LIMIT 10;
```

## Rollback (si nécessaire)

```sql
-- Supprimer les index
DROP INDEX IF EXISTS idx_businesses_normalized_name;
DROP INDEX IF EXISTS idx_businesses_normalized_address;
DROP INDEX IF EXISTS idx_businesses_priority;

-- Supprimer la fonction de recherche
DROP FUNCTION IF EXISTS search_businesses_smart;

-- Supprimer la fonction normalize_text
DROP FUNCTION IF EXISTS normalize_text;

-- Recréer la vue businesses_enriched sans les nouveaux champs
-- (voir migration précédente)

-- Désactiver l'extension (optionnel)
DROP EXTENSION IF EXISTS unaccent;
```
