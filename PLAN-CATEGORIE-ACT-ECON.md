# Plan: Intégration ACT_ECON → Catégories du Site

## 🎯 Objectif

Utiliser la classification gouvernementale ACT_ECON (82,938+ entreprises) pour alimenter automatiquement les catégories du site (main_categories), permettant ainsi aux filtres de catégorie de fonctionner pour toutes les entreprises importées.

## 📊 État Actuel

### Bases de données
- **Total entreprises**: 480,168
- **Avec act_econ_code**: 82,938 (17.3%) → En augmentation via script de sync
- **Avec main_category_id**: 51,101 (10.6%)
- **Sans catégorie**: ~400,000

### Systèmes de catégories
1. **ACT_ECON** (Gouvernement du Québec)
   - `act_econ_main`: 74 codes principaux (0100, 0200... 9900)
   - `act_econ_codes`: 1,250 codes détaillés (niveaux 2 & 3)
   - Utilisé dans: `businesses.act_econ_code`

2. **Main Categories** (Site web)
   - `main_categories`: 19 catégories
   - `sub_categories`: 187 sous-catégories
   - Utilisé dans: `businesses.main_category_id`

## ✅ Travail Complété

### 1. Restructuration ACT_ECON
- ✅ Table `act_econ_main` créée avec 74 codes principaux
- ✅ Script `create-act-econ-main-final.js` généré
- ✅ Script `update-level2-and-3-simple.js` pour parent_code
- ⏳ **À EXÉCUTER**: Migrations SQL pour restructurer

### 2. Sync ACT_ECON depuis CSV
- ✅ Script `sync-act-econ-streaming.js` créé
- 🔄 **EN COURS**: Batch 17/398 (4.0%)
- 📋 Synchronise 397,229 entreprises depuis `data/Entreprise.csv`

### 3. Mapping ACT_ECON → Main Categories
- ✅ Table de mapping créée: `act_econ_to_main_category`
- ✅ Script `generate-act-econ-mappings.js` - Génère 74 mappings intelligents
- ✅ Migration SQL générée: `20250128_insert_act_econ_mappings.sql`
- ⏳ **À EXÉCUTER**: Migrations SQL

### 4. Attribution Automatique
- ✅ Script `assign-main-category-from-act-econ.js` créé
- ⏳ **À EXÉCUTER**: Après les migrations

## 🚀 Prochaines Étapes (ORDRE D'EXÉCUTION)

### Étape 1: Créer la table de mapping
```bash
# Dans Supabase SQL Editor ou via psql
psql -d <database> -f supabase/migrations/20250128_create_act_econ_mapping.sql
```

### Étape 2: Insérer les 74 mappings
```bash
psql -d <database> -f supabase/migrations/20250128_insert_act_econ_mappings.sql
```

### Étape 3: Assigner main_category_id aux entreprises actuelles
```bash
node scripts/assign-main-category-from-act-econ.js
```
**Résultat attendu**: ~82,938 entreprises auront automatiquement leur `main_category_id`

### Étape 4: Attendre la fin du sync (optionnel)
Le script `sync-act-econ-streaming.js` continue en arrière-plan:
- Ajoute act_econ_code à ~397,229 entreprises
- Temps estimé: Plusieurs heures

### Étape 5: Re-exécuter l'attribution (après sync)
```bash
node scripts/assign-main-category-from-act-econ.js
```
**Résultat attendu**: ~480,000 entreprises auront leur `main_category_id`

## 📋 Exemple de Mappings

### Agriculture (codes 0100-0500) → agriculture-et-environnement
- 0100: Agriculture
- 0200: Services relatifs à l'agriculture
- 0300: Pêche et piégeage
- 0400: Exploitation forestière
- 0500: Services forestiers

### Construction (4000-4400) → construction-et-renovation
- 4000: Constructeurs
- 4200: Entrepreneurs spécialisés
- 4400: Services relatifs à la construction

### Restauration (9200) → restauration-et-alimentation
- 9200: Restauration

### Commerce (5000-6900) → commerce-de-detail
- 5000-5900: Commerces de gros (divers)
- 6000-6900: Commerces de détail (divers)

### Industrie (0600-3900) → industrie-fabrication-et-logistique
- 0600-0900: Mines et extraction
- 1000-3900: Fabrication (aliments, textiles, métaux, etc.)

**Total**: 74 codes ACT_ECON → 19 catégories site avec 100% de couverture

## 🎯 Résultat Final

### Avant
- Filtres de catégorie: 51,101 entreprises (10.6%)
- Entreprises sans catégorie: 429,067 (89.4%)

### Après (Étape 3)
- Filtres de catégorie: ~134,000 entreprises (27.9%)
- Gain: +82,938 entreprises

### Après (Étape 5 - sync complet)
- Filtres de catégorie: ~480,000 entreprises (100%)
- Gain: +429,000 entreprises

## 🔧 Scripts Créés

1. **generate-act-econ-mappings.js**
   - Génère mappings ACT_ECON → main_categories
   - Produit SQL d'insertion

2. **assign-main-category-from-act-econ.js**
   - Lit `act_econ_to_main_category`
   - Assigne `main_category_id` aux businesses
   - Traite par batch de 500

3. **sync-act-econ-streaming.js** (EN COURS)
   - Lit `data/Entreprise.csv` (2.8M lignes)
   - Match NEQ entre CSV et DB
   - Ajoute act_econ_code manquants

## 💡 Avantages

1. **Automatique**: Pas besoin de catégoriser manuellement 480,000 entreprises
2. **Fiable**: Utilise la classification officielle du gouvernement
3. **Maintenable**: Mapping centralisé dans une table
4. **Évolutif**: Nouveaux imports auront automatiquement leur catégorie
5. **Filtres fonctionnels**: Toutes les entreprises seront trouvables par catégorie

## ⚠️ Notes Importantes

1. Le script de sync (`sync-act-econ-streaming.js`) tourne en arrière-plan
2. Vous pouvez exécuter les étapes 1-3 MAINTENANT sans attendre
3. L'étape 5 peut être faite plus tard quand le sync sera terminé
4. Les entreprises manuellement enregistrées utilisent déjà `main_categories`
5. Ce système co-existe avec les sous-catégories (`sub_categories`)

## 📝 Vérification

Après l'étape 3, vérifier:
```sql
-- Compter les entreprises avec catégorie
SELECT COUNT(*) FROM businesses WHERE main_category_id IS NOT NULL;

-- Distribution par catégorie
SELECT mc.label_fr, COUNT(*) as nb_entreprises
FROM businesses b
JOIN main_categories mc ON b.main_category_id = mc.id
GROUP BY mc.label_fr
ORDER BY nb_entreprises DESC;

-- Vérifier le mapping
SELECT COUNT(*) FROM act_econ_to_main_category;
-- Devrait retourner: 74
```
