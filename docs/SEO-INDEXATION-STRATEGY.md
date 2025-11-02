# Stratégie d'indexation SEO - Registre du Québec

## Problème actuel

**Statut Google Search Console**: Beaucoup de pages avec "Explorée, actuellement non indexée"

### Statistiques du contenu

- **Total d'entreprises**: 480,168
- **Avec description**: 5 (0%)
- **Avec site web**: 46,669 (10%)
- **Avec avis Google**: 49,607 (10%)
- **Avec bon rating (4.0+)**: ~10%

**Diagnostic**: 90% des pages ont un contenu minimal (nom, adresse, téléphone seulement), considéré comme "thin content" par Google.

## Solutions implémentées

### 1. Priorisation dynamique dans les sitemaps

Les priorités sont maintenant calculées dynamiquement selon la qualité du contenu:

```
Priority = 0.4 (base)
+ 0.1 si description présente (>20 caractères)
+ 0.1 si site web présent
+ 0.1 si avis Google présents
+ 0.1 si bon rating (≥4.0)

Range: 0.4 - 0.8
```

**Impact**:
- Pages riches en contenu: priority 0.7-0.8 → crawlées en priorité
- Pages minimales: priority 0.4 → crawlées plus tard
- Google indexera d'abord les pages de meilleure qualité

### 2. Recommandations à court terme

#### A. Enrichir le contenu progressivement

**Option 1 - Descriptions automatiques**:
Générer des descriptions basées sur les données existantes:
```
"[Nom entreprise] est une entreprise située à [Ville], Québec,
spécialisée en [Catégorie]. Avec [X] avis sur Google et une note
moyenne de [Rating]/5, [Nom] offre [services basés sur catégorie]."
```

**Option 2 - Intégration avec APIs externes**:
- Google Places API: récupérer descriptions, photos, horaires
- Yelp API: enrichir avec plus d'avis
- OpenStreetMap: ajouter informations géographiques

**Option 3 - Contenu généré par IA**:
- Utiliser Claude/GPT pour générer descriptions uniques basées sur:
  - Nom de l'entreprise
  - Catégorie
  - Localisation
  - Avis existants

#### B. Robots.txt optimisé

Créer `/public/robots.txt`:
```
User-agent: *
Allow: /

# Prioritize high-quality content
Crawl-delay: 1

# Priority URLs
Allow: /categorie/*
Allow: /region/*
Allow: /blogue/*

# Sitemaps
Sitemap: https://registreduquebec.com/sitemap.xml
Sitemap: https://registreduquebec.com/sitemap-en.xml
```

#### C. Méta-données enrichies

Ajouter dans chaque page d'entreprise:
- Schema.org LocalBusiness (✅ déjà fait)
- Reviews Schema (si avis présents)
- OpeningHours Schema (si disponible)
- Images (logo, photos Google)

### 3. Recommandations à moyen terme

#### A. Créer du contenu unique par catégorie

Ajouter des pages de catégories enrichies:
```
/categorie/restaurants-montreal
├─ Description de la scène culinaire montréalaise
├─ Guide des meilleurs restaurants
├─ Articles de blog liés
└─ Top 10 des restaurants populaires
```

#### B. Blog actif

Créer du contenu de qualité:
- "Top 10 restaurants à [Ville]"
- "Comment choisir un [Service] au Québec"
- "Guide complet de [Catégorie] en [Région]"
- Interviews d'entreprises locales

#### C. Liens internes intelligents

Créer des liens contextuels:
- "Autres entreprises similaires"
- "Entreprises dans la même ville"
- "Catégories connexes"

### 4. Configuration Google Search Console

#### A. Limiter le budget de crawl

1. **Créer des sitemaps segmentés par qualité**:
   - `sitemap-premium.xml` (priority 0.7-0.8, ~50k URLs)
   - `sitemap-standard.xml` (priority 0.5-0.6, ~100k URLs)
   - `sitemap-basic.xml` (priority 0.4, ~330k URLs)

2. **Soumettre dans l'ordre**:
   - Semaine 1: sitemap-premium.xml
   - Semaine 3: sitemap-standard.xml
   - Semaine 5: sitemap-basic.xml

#### B. Utiliser l'outil d'inspection d'URL

Pour les pages importantes non indexées:
- Demander une indexation manuelle via Google Search Console
- Prioriser les pages de catégories principales
- Prioriser les entreprises avec avis et site web

### 5. Métriques à surveiller

Dans Google Search Console:

1. **Couverture**:
   - Réduction de "Explorée, actuellement non indexée"
   - Augmentation de "Valide"
   - Target: 50% des pages premium indexées en 3 mois

2. **Performance**:
   - Impressions: devrait augmenter de 20-30% par mois
   - CTR: optimiser pour atteindre 3-5%
   - Position moyenne: viser top 10 pour catégories principales

3. **Core Web Vitals**:
   - LCP < 2.5s (✅ actuellement bon)
   - FID < 100ms (✅ actuellement bon)
   - CLS < 0.1 (✅ récemment corrigé)

### 6. Plan d'action immédiat

**Cette semaine**:
- [x] Implémenter priorités dynamiques dans sitemaps
- [ ] Générer descriptions automatiques pour 50k entreprises premium
- [ ] Créer robots.txt optimisé
- [ ] Régénérer les sitemaps avec nouvelles priorités

**Mois 1**:
- [ ] Enrichir les 50k pages prioritaires avec descriptions
- [ ] Soumettre sitemap-premium.xml à GSC
- [ ] Écrire 10 articles de blog de qualité
- [ ] Ajouter images/photos pour top 1000 entreprises

**Mois 2-3**:
- [ ] Enrichir 100k pages standard
- [ ] Créer pages catégories enrichies pour top 20 catégories
- [ ] Implémenter liens internes intelligents
- [ ] Monitorer et ajuster selon métriques GSC

## Impact attendu

### Court terme (1-2 mois)
- **Pages indexées**: +20% pour contenu premium
- **Trafic organique**: +30-50%
- **Impressions**: +40-60%

### Moyen terme (3-6 mois)
- **Pages indexées**: 60-70% du contenu premium
- **Trafic organique**: +100-150%
- **Position moyenne**: Top 10 pour 50+ mots-clés

### Long terme (6-12 mois)
- **Pages indexées**: 80%+ du contenu total
- **Trafic organique**: +200-300%
- **Autorité de domaine**: Établi comme référence pour entreprises QC

## Ressources nécessaires

1. **Technique**:
   - Script de génération de descriptions automatiques
   - API Google Places (optionnel, ~$100-200/mois)
   - Système de cache pour images/données externes

2. **Contenu**:
   - Rédacteur pour blog (10-20h/mois)
   - Template de descriptions (1-2 jours de dev)
   - Validation qualité contenu généré

3. **Monitoring**:
   - Google Search Console (gratuit)
   - Google Analytics (gratuit)
   - Outils SEO additionnels (Ahrefs/SEMrush, optionnel)

## Conclusion

Le problème d'indexation est **normal et attendu** pour un site de cette taille avec contenu minimal. La stratégie proposée résout le problème en:

1. **Priorisant le contenu de qualité** via sitemaps dynamiques
2. **Enrichissant progressivement** les pages importantes
3. **Créant du contenu unique** pour se différencier
4. **Optimisant l'expérience utilisateur** pour signaux positifs à Google

Avec cette approche, vous devriez voir des améliorations significatives dans les 3-6 mois.
