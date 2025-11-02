# Générateur de descriptions automatiques

## Vue d'ensemble

Script pour générer automatiquement des descriptions françaises et anglaises pour les entreprises du Registre du Québec. Utilise les données existantes pour créer du contenu unique et SEO-optimisé.

## Fonctionnalités

### Variables utilisées

- **Nom de l'entreprise**
- **Ville**
- **Région** (si disponible)
- **MRC** (si disponible)
- **Catégorie principale** (français et anglais)
- **Sous-catégorie** (si disponible)
- **Avis Google** (nombre et note moyenne)
- **Site web** (présence détectée)

### Templates multiples

3 templates différents en français et en anglais pour éviter le contenu dupliqué:

1. **Template Professionnel**: Focus sur localisation complète + qualité
2. **Template Service**: Focus sur services offerts + réputation
3. **Template Géographique**: Focus sur localisation détaillée

Le script alterne automatiquement entre les templates pour maximiser la diversité.

## Utilisation

### Commande de base

```bash
node scripts/generate-descriptions.js
```

### Configuration

Par défaut, le script traite **100 entreprises prioritaires** :
- Entreprises avec avis Google
- Entreprises avec site web
- Triées par nombre d'avis (décroissant)

### Augmenter le volume

Pour traiter plus d'entreprises, modifiez la ligne 252:

```javascript
.limit(100); // Augmenter à 1000, 5000, 10000, etc.
```

**Recommandations**:
- Démarrer avec 100 pour tester
- Passer à 1,000 pour validation
- Puis 10,000 pour pages premium
- Finalement 50,000+ pour contenu standard

## Exemples de résultats

### Avec catégorie et avis

**Input**:
```
Nom: Restaurant Le Gourmet
Ville: Montréal
Région: Montréal
Catégorie: Restaurants
Sous-catégorie: Cuisine française
Avis: 4.5/5 (245 avis)
Site web: oui
```

**Output FR**:
```
Restaurant Le Gourmet est un restaurant spécialisé en Cuisine française situé à Montréal
dans la région Montréal, Québec. Avec une note moyenne de 4.5/5 basée sur 245 avis Google,
Restaurant Le Gourmet est reconnu pour la qualité de ses services. Pour plus d'informations,
visitez le site web officiel ou contactez l'entreprise directement.
```

**Output EN**:
```
Restaurant Le Gourmet is a restaurant specializing in French Cuisine located in Montréal,
Montréal region, Quebec. With an average rating of 4.5/5 based on 245 Google reviews,
Restaurant Le Gourmet is recognized for quality service. For more information, visit the
official website or contact the business directly.
```

### Sans catégorie (fallback)

**Input**:
```
Nom: ABC Services
Ville: Québec
Avis: 4.2/5 (50 avis)
```

**Output**:
```
ABC Services est une entreprise située à Québec, Québec. Avec une note moyenne de 4.2/5
basée sur 50 avis Google, ABC Services est reconnu pour la qualité de ses services.
Contactez ABC Services pour obtenir plus d'informations sur les services offerts.
```

## Impact SEO

### Avantages

1. **Contenu unique**: 3 templates rotatifs évitent la duplication
2. **Mots-clés naturels**: Ville, région, catégorie intégrés organiquement
3. **Longueur optimale**: 100-200 caractères (bon pour meta descriptions aussi)
4. **Social proof**: Intègre notes et avis quand disponibles
5. **Call-to-action**: Encourage le contact/visite du site

### Métriques attendues

Après génération de descriptions pour 50,000 entreprises premium:

- **Priorité sitemap**: Passe de 0.4 à 0.5 (+0.1)
- **Taux d'indexation**: +30-40% dans les 2 mois
- **CTR organique**: +10-15% (descriptions plus attrayantes)
- **Temps sur page**: +20% (contenu plus riche)

## Stratégie de déploiement

### Phase 1: Premium (Semaine 1)
```bash
# 10,000 entreprises avec avis + site web
# Priorité sitemap: 0.7-0.8
node scripts/generate-descriptions.js
# (modifier .limit(10000))
```

### Phase 2: Standard (Semaine 3)
```bash
# 40,000 entreprises avec avis OU site web
# Priorité sitemap: 0.5-0.6
# Modifier la query pour inclure: .or('google_reviews_count.gt.0,website.neq.')
```

### Phase 3: Basic (Semaine 5)
```bash
# Restant ~430,000 entreprises
# Priorité sitemap: 0.4-0.5
# Générer descriptions génériques pour contenu minimal
```

## Maintenance

### Mise à jour des descriptions

Pour les nouvelles entreprises ajoutées:

```bash
# Exécuter hebdomadairement
node scripts/generate-descriptions.js
```

Le script skip automatiquement les entreprises avec descriptions existantes.

### Amélioration continue

À mesure que plus de données sont collectées:
- Avis Google mis à jour → descriptions automatiquement plus riches
- Catégories assignées → descriptions plus précises
- Données MRC ajoutées → géolocalisation améliorée

## Personnalisation

### Ajouter un nouveau template

Dans `generate-descriptions.js`, ajouter à `frenchTemplates`:

```javascript
(data) => {
  let desc = `Votre texte avec ${data.name} et ${data.city}...`;
  // Logique personnalisée
  return desc;
}
```

### Ajuster les critères de priorité

Modifier ligne 249-251 pour changer les critères:

```javascript
// Exemple: seulement entreprises avec 10+ avis
.gte('google_reviews_count', 10)

// Exemple: seulement à Montréal
.eq('city', 'Montréal')

// Exemple: catégorie spécifique
.eq('primary_main_category_slug', 'restaurants')
```

## Monitoring

### Vérifier les résultats

```sql
-- Compter entreprises avec descriptions
SELECT COUNT(*) FROM businesses WHERE description IS NOT NULL;

-- Vérifier qualité moyenne
SELECT
  COUNT(*) as total,
  AVG(LENGTH(description)) as avg_length,
  COUNT(DISTINCT LEFT(description, 50)) as unique_starts
FROM businesses
WHERE description IS NOT NULL;
```

### Dashboard Google Search Console

Après 2-4 semaines, surveiller:
- Pages indexées (devrait augmenter)
- Impressions (devrait augmenter)
- Position moyenne (devrait s'améliorer)
- CTR (devrait augmenter légèrement)

## Limites et considérations

### Limites actuelles

1. **Pas de description EN**: Colonne `description_en` pas encore créée
   - Solution temporaire: seulement FR pour l'instant
   - TODO: Ajouter colonne + migration

2. **Catégories manquantes**: ~40% des entreprises sans catégorie
   - Fallback: utilise "entreprise" générique
   - TODO: Améliorer l'assignation des catégories

3. **Templates statiques**: Pas d'IA générative
   - Avantage: Rapide et prévisible
   - Inconvénient: Moins créatif qu'un LLM

### Améliorations futures

1. **Intégration IA**: Utiliser Claude/GPT pour descriptions uniques
2. **Données enrichies**: Photos, horaires, services spécifiques
3. **A/B Testing**: Tester différents styles de descriptions
4. **Multilangue**: Ajouter descriptions EN complètes

## Support

Pour questions ou problèmes:
1. Vérifier logs de sortie du script
2. Consulter [docs/SEO-INDEXATION-STRATEGY.md](../docs/SEO-INDEXATION-STRATEGY.md)
3. Tester sur petit échantillon d'abord (limit 10)

## Changelog

### v1.0 (2025-11-02)
- Génération initiale français
- 3 templates rotatifs
- Priorisation par avis + site web
- Intégration données: nom, ville, région, MRC, catégorie, sous-catégorie, avis
