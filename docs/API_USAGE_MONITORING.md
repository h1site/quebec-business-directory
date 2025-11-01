# 📊 Monitoring API Usage - Supabase

## Limite actuelle
- **10,000 requêtes API / jour** (plan gratuit Supabase)
- Besoin de suivre la consommation pour éviter les dépassements

---

## Méthode 1: Via Chrome DevTools (Test en temps réel)

### Étapes:

1. **Ouvrir Chrome DevTools** (`F12` ou `Cmd+Option+I`)

2. **Aller dans l'onglet Network**

3. **Filtrer par "supabase"** dans la barre de recherche

4. **Recharger la page** (`Ctrl+R` ou `Cmd+R`)

5. **Compter les requêtes** qui apparaissent avec `supabase.co` dans l'URL

### Exemple de résultats typiques:

#### Page d'accueil (/)
```
1. GET /rest/v1/businesses?select=* (nouveaux commerces)
2. GET /rest/v1/businesses?select=* (commerces aléatoires)
3. GET /rest/v1/main_categories (catégories)
4. GET /rest/v1/business_reviews?select=* (témoignages)
Total: 4 requêtes
```

#### Page de détails d'entreprise (/entreprise/...)
```
1. GET /rest/v1/businesses_enriched?slug=eq.rennai (données entreprise)
2. GET /rest/v1/business_hours?business_id=eq.... (heures d'ouverture)
3. GET /rest/v1/business_reviews?business_id=eq.... (avis locaux - si présents)
4. GET /rest/v1/sponsors?... (sponsors - si activés)
Total: 2-4 requêtes (selon la fiche)
```

#### Page de recherche (/search)
```
1. GET /rest/v1/businesses_enriched?select=* (résultats de recherche)
2. GET /rest/v1/main_categories (filtre catégories - si affiché)
Total: 1-2 requêtes
```

---

## Méthode 2: Utiliser le script automatique

### Installation:

1. **Ouvrir la Console DevTools** (`F12` > Console)

2. **Copier-coller ce code**:

```javascript
// Copier le contenu de scripts/count-api-requests.js
```

3. **Naviguer vers une page** de votre site

4. **Exécuter dans la console**:
```javascript
getSupabaseRequestCount()
```

### Exemple de sortie:

```
📊 SUPABASE API REQUEST SUMMARY
================================
Total Requests: 2

Breakdown by table:
  - businesses_enriched: 1 request(s)
  - business_hours: 1 request(s)

Detailed log:
  1. [GET] businesses_enriched - 2025-10-31T22:15:30.123Z
  2. [GET] business_hours - 2025-10-31T22:15:30.456Z

💡 With 10,000 requests/day limit:
   5000 page views per day maximum
   208 page views per hour average
```

---

## Méthode 3: Via Supabase Dashboard (Historique)

### Étapes:

1. **Aller sur** https://supabase.com/dashboard

2. **Sélectionner votre projet**

3. **Cliquer sur "Settings" > "API"**

4. **Voir "API Usage"** dans la section Statistics

5. **Analyser**:
   - Requêtes totales aujourd'hui
   - Tendance sur 7 jours
   - Pics d'utilisation

### Exemple de lecture:

```
Today:        1,234 / 10,000 requests (12.3%)
Yesterday:    2,456 / 10,000 requests (24.5%)
7-day avg:    1,800 / 10,000 requests (18%)

Status: ✅ Safe (sous 80% de la limite)
```

---

## Calculs de capacité

### Formule de base:
```
Pages par jour = Limite API / Requêtes par page
```

### Scénarios réels:

#### Scénario 1: Site avec fiches simples (2 requêtes/page)
```
10,000 / 2 = 5,000 pages vues/jour maximum
= 208 pages/heure
= 3.5 pages/minute
```

#### Scénario 2: Site avec fiches enrichies (4 requêtes/page)
```
10,000 / 4 = 2,500 pages vues/jour maximum
= 104 pages/heure
= 1.7 pages/minute
```

#### Scénario 3: Mix 50/50 (home + fiches)
```
Page d'accueil: 4 requêtes
Page fiche: 2 requêtes
Moyenne: 3 requêtes

10,000 / 3 = 3,333 pages vues/jour maximum
= 139 pages/heure
= 2.3 pages/minute
```

---

## Optimisations pour réduire les requêtes

### 1. Utiliser une vue jointe (Réduction: 2 → 1 requête)

**Avant:**
```javascript
// 2 requêtes séparées
const business = await getBusinessBySlug(slug)  // 1 requête
const hours = await getBusinessHours(id)         // 1 requête
```

**Après (avec vue optimisée):**
```sql
CREATE VIEW business_complete AS
SELECT
  b.*,
  json_agg(bh.*) as hours
FROM businesses_enriched b
LEFT JOIN business_hours bh ON b.id = bh.business_id
GROUP BY b.id;
```

```javascript
// 1 seule requête
const businessComplete = await getBusinessComplete(slug)  // 1 requête
```

**Impact:**
- Économie de 50% sur les pages de détails
- 5,000 pages/jour → 10,000 pages/jour

### 2. Cache côté client (React Query ou SWR)

```javascript
import { useQuery } from 'react-query';

const { data: business } = useQuery(
  ['business', slug],
  () => getBusinessBySlug(slug),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  }
);
```

**Impact:**
- Évite les requêtes répétées si l'utilisateur revient sur la page
- Réduction de 20-30% pour les utilisateurs actifs

### 3. Server-Side Rendering (SSR) avec cache

**Actuellement implémenté** dans `render.js`:
```javascript
// Les données sont pré-chargées côté serveur
// Le client réutilise ces données au lieu de refaire une requête
```

**Impact:**
- 1ère visite: 2 requêtes (SSR)
- Navigation client: 0 requêtes (utilise les données SSR)
- Économie de 50% sur les navigations internes

### 4. Pagination et limite de résultats

```javascript
// Au lieu de charger 100 résultats
.select('*').range(0, 99)  // 1 requête lourde

// Charger 20 résultats à la fois
.select('*').range(0, 19)  // 1 requête légère
```

**Impact:**
- Réduit la taille des réponses (économise la bande passante)
- Réduit les timeouts
- Améliore les performances

---

## Monitoring continu

### Créer une alerte Supabase:

1. **Dashboard > Settings > API**
2. **Activer les alertes email**:
   - Alerte à 80% (8,000/10,000)
   - Alerte à 95% (9,500/10,000)

### Script de monitoring quotidien:

```javascript
// scripts/check-daily-usage.js
// À exécuter chaque jour via cron job ou GitHub Actions

const SUPABASE_URL = 'https://xxx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function checkDailyUsage() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_api_usage`, {
    headers: { apikey: SUPABASE_KEY }
  });

  const usage = await response.json();
  console.log(`Usage: ${usage.count} / 10,000 (${usage.percentage}%)`);

  if (usage.percentage > 80) {
    console.warn('⚠️ WARNING: API usage above 80%!');
  }
}
```

---

## Actions si la limite est atteinte

### Solutions immédiates:

1. **Upgrade Supabase plan**:
   - Pro: 500,000 requêtes/jour ($25/mois)
   - Team: 2,000,000 requêtes/jour ($599/mois)

2. **Activer le cache Redis** (avec Vercel KV):
   - Cache les fiches les plus consultées
   - Réduction de 70-80% des requêtes Supabase

3. **Implémenter un CDN** pour les données statiques:
   - Catégories → cache 24h
   - Fiches récentes → cache 1h

4. **Rate limiting** par IP:
   - Max 60 requêtes/minute par IP
   - Évite les abus/bots

---

## Résumé des recommandations

### Priorité HAUTE ⚡
- [ ] Créer une vue jointe `business_complete` (économie 50%)
- [ ] Vérifier le dashboard Supabase quotidiennement
- [ ] Configurer les alertes email (80% et 95%)

### Priorité MOYENNE 🔶
- [ ] Implémenter React Query pour le cache client
- [ ] Optimiser les requêtes de la page d'accueil
- [ ] Limiter les résultats de recherche à 20 par défaut

### Priorité BASSE 🔵
- [ ] Ajouter Redis cache pour les pages populaires
- [ ] Implémenter rate limiting par IP
- [ ] Créer un dashboard custom de monitoring

---

## Contact et support

Si tu dépasses régulièrement la limite:
- **Option 1**: Upgrade vers Supabase Pro ($25/mois)
- **Option 2**: Implémenter un cache Redis
- **Option 3**: Migrer vers PostgreSQL auto-hébergé (gratuit mais plus complexe)
