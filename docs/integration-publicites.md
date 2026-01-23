# Guide d'Intégration des Publicités

## Étape 1: Créer les Ad Slots dans AdSense

Va sur https://adsense.google.com et crée les ad slots suivants:

### Ad Slots à Créer

| Nom du Slot | Type | Taille | Où utiliser |
|-------------|------|--------|-------------|
| `business-sidebar-1` | Display | 300x250 | Pages entreprises - Sidebar haut |
| `business-sidebar-2` | Display | 300x600 | Pages entreprises - Sidebar sticky |
| `business-in-content` | Display | In-article | Pages entreprises - Entre sections |
| `business-before-related` | Display | Responsive | Pages entreprises - Avant entreprises similaires |
| `search-header` | Display | Leaderboard | Pages recherche - Sous barre recherche |
| `search-in-feed` | Display | In-feed | Pages recherche - Entre résultats |
| `homepage-hero` | Display | Leaderboard | Accueil - Sous hero |
| `homepage-in-feed` | Display | In-feed | Accueil - Entre sections |
| `blog-in-article-1` | Display | In-article | Blog - Après intro |
| `blog-in-article-2` | Display | In-article | Blog - Milieu article |

## Étape 2: Mettre à jour les Ad Slot IDs

Après avoir créé les slots, mets à jour le fichier `src/config/adSlots.ts`:

```typescript
export const AD_SLOTS = {
  business: {
    sidebar1: 'XXXXXXXX',      // Remplace par l'ID réel
    sidebar2: 'XXXXXXXX',
    inContent: 'XXXXXXXX',
    beforeRelated: 'XXXXXXXX',
  },
  // etc...
}
```

## Étape 3: Intégrer les Ads dans les Composants

### Pages Entreprises (`BusinessDetails.tsx`)

#### Position 1: Sidebar Haut (après infos contact)

```tsx
import AdSense, { AdSenseRectangle, AdSenseSidebar } from '@/components/AdSense'
import { AD_SLOTS } from '@/config/adSlots'

// Dans la sidebar, après la section "Coordonnées":
<div className="glass rounded-xl p-6">
  <h3 className="text-lg font-semibold text-white mb-4">Publicité</h3>
  <AdSenseRectangle slot={AD_SLOTS.business.sidebar1} />
</div>
```

#### Position 2: Sidebar Sticky (plus bas)

```tsx
// Après d'autres sections de la sidebar:
<div className="glass rounded-xl p-6">
  <h3 className="text-lg font-semibold text-white mb-4">Publicité</h3>
  <AdSenseSidebar slot={AD_SLOTS.business.sidebar2} sticky={true} />
</div>
```

#### Position 3: In-Content (entre sections principales)

```tsx
import { AdSenseInArticle } from '@/components/AdSense'

// Entre la section "À propos" et "Horaires" (ou FAQ):
<div className="my-8">
  <div className="text-center text-sm text-slate-500 mb-2">Publicité</div>
  <AdSenseInArticle slot={AD_SLOTS.business.inContent} />
</div>
```

#### Position 4: Avant Entreprises Similaires

```tsx
// Juste avant la section "Entreprises similaires":
<div className="my-8">
  <div className="text-center text-sm text-slate-500 mb-2">Publicité</div>
  <AdSense slot={AD_SLOTS.business.beforeRelated} format="auto" />
</div>
```

### Pages de Recherche (`recherche/page.tsx`)

#### Position 1: Sous la barre de recherche

```tsx
import { AdSenseLeaderboard } from '@/components/AdSense'
import { AD_SLOTS } from '@/config/adSlots'

// Après les filtres, avant les résultats:
<div className="my-6">
  <div className="text-center text-sm text-slate-500 mb-2">Publicité</div>
  <AdSenseLeaderboard slot={AD_SLOTS.search.header} />
</div>
```

#### Position 2: In-Feed entre résultats

```tsx
import { AdSenseInFeed } from '@/components/AdSense'

// Dans la boucle de résultats, tous les 7-8 résultats:
{businesses.map((business, index) => (
  <div key={business.id}>
    <BusinessCard business={business} />

    {/* Afficher ad tous les 8 résultats */}
    {(index + 1) % 8 === 0 && (
      <div className="my-6">
        <div className="text-center text-sm text-slate-500 mb-2">Publicité</div>
        <AdSenseInFeed slot={AD_SLOTS.search.inFeed} />
      </div>
    )}
  </div>
))}
```

### Page d'Accueil

#### Position 1: Sous le hero

```tsx
import { AdSenseLeaderboard } from '@/components/AdSense'
import { AD_SLOTS } from '@/config/adSlots'

// Après la section hero/search:
<div className="my-8">
  <div className="text-center text-sm text-slate-500 mb-2">Publicité</div>
  <AdSenseLeaderboard slot={AD_SLOTS.homepage.hero} />
</div>
```

#### Position 2: In-Feed entre sections

```tsx
import { AdSenseInFeed } from '@/components/AdSense'

// Entre "Catégories populaires" et "Villes":
<div className="my-8">
  <div className="text-center text-sm text-slate-500 mb-2">Publicité</div>
  <AdSenseInFeed slot={AD_SLOTS.homepage.inFeed} />
</div>
```

### Pages de Blog

#### Positions multiples

```tsx
import { AdSenseInArticle, AdSenseSidebar } from '@/components/AdSense'
import { AD_SLOTS } from '@/config/adSlots'

// Après introduction:
<AdSenseInArticle slot={AD_SLOTS.blog.inArticle1} className="my-8" />

// Milieu d'article:
<AdSenseInArticle slot={AD_SLOTS.blog.inArticle2} className="my-8" />

// Sidebar:
<AdSenseSidebar slot={AD_SLOTS.blog.sidebar} sticky={true} />
```

## Étape 4: Styles CSS Additionnels (optionnel)

Ajoute dans `globals.css` si nécessaire:

```css
/* AdSense containers */
.adsense-container {
  @apply w-full flex justify-center items-center;
}

/* Glass effect for ad containers */
.glass-ad {
  @apply bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4;
}

/* Responsive ad spacing */
.ad-spacer {
  @apply my-6 md:my-8;
}

/* Ad label styling */
.ad-label {
  @apply text-center text-xs text-slate-500 uppercase tracking-wide mb-2;
}
```

## Étape 5: Tests

### Vérifications

- [ ] Les ads s'affichent sur desktop
- [ ] Les ads s'affichent sur mobile (responsive)
- [ ] Pas de décalage (layout shift)
- [ ] Les ads ne bloquent pas le contenu
- [ ] Le chargement est asynchrone
- [ ] Les métriques AdSense fonctionnent

### Tester en Développement

Les ads ne s'affichent pas en mode développement par défaut. Pour tester:

1. Build production local:
   ```bash
   npm run build
   npm run start
   ```

2. Ou ajoute en développement:
   ```tsx
   // Dans adSlots.ts, change:
   export const isDevelopment = false
   ```

## Étape 6: Monitoring

### Métriques à surveiller dans AdSense

- **RPM** (Revenue per 1000 impressions)
- **CTR** (Click-through rate)
- **Impressions** par page
- **Viewability** (% ads visibles)

### Google Analytics

Track les pages avec le plus d'impressions:

```tsx
// Dans layout.tsx ou composant ad
gtag('event', 'ad_impression', {
  ad_slot: slot,
  page_type: 'business_page'
})
```

## Problèmes Fréquents

### Les ads ne s'affichent pas

1. Vérifie que le script AdSense est chargé (`layout.tsx`)
2. Vérifie les IDs de slots dans `adSlots.ts`
3. Vérifie que `ads.txt` est accessible à `https://registreduquebec.com/ads.txt`
4. Attends 24-48h après création compte AdSense (délai d'approbation)

### Layout Shift (CLS)

Si les ads causent des décalages:

```tsx
<div style={{ minHeight: '250px' }}>
  <AdSense slot={...} />
</div>
```

### Trop d'ads

Si taux de rebond augmente:
- Réduis le nombre d'ads par page
- Utilise des formats moins intrusifs
- Augmente l'espacement entre ads

## Optimisation Continue

### A/B Testing

Teste différentes positions:
- Header vs milieu de page
- Sidebar sticky vs fixed
- In-feed spacing (tous les 5 vs 10 résultats)

### Saisonnalité

Certaines catégories d'entreprises performent mieux à certaines périodes:
- Plombiers: hiver (plus de CPM)
- Paysagistes: été
- Restaurants: toute l'année

Ajuste la stratégie selon les données.

---

**Prochaine étape:** Implémente les ads sur une page pilot (page entreprise), teste pendant 7 jours, puis déploie partout.
