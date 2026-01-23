# Configuration des Publicités - Registre du Québec

## Résumé de l'implémentation

### Fichiers créés

1. **Stratégie** `docs/strategie-publicitaire.md`
   - Plan complet de monétisation
   - Placements recommandés par section
   - Métriques et KPIs

2. **Guide d'intégration:** `docs/integration-publicites.md`
   - Instructions étape par étape
   - Code examples
   - Troubleshooting

3. **Composant AdSense:** `src/components/AdSense.tsx`
   - Composant réutilisable
   - Variants prédéfinis (Leaderboard, Rectangle, In-Article, In-Feed, Sidebar)
   - TypeScript avec props

4. **Configuration:** `src/config/adSlots.ts`
   - Centralisation des ad slot IDs
   - Fallback pour développement
   - Layout keys

5. **ads.txt:** `public/ads.txt`
   - Requis par Google AdSense
   - Accessible à `/ads.txt`

### Déjà configuré

✅ Script AdSense global dans `layout.tsx` (ligne 92-96)
✅ Compte AdSense: `ca-pub-8781698761921917`

## Prochaines Étapes

### 1. Créer les Ad Slots (15 min)

Va sur https://adsense.google.com et crée ces slots:

**Pages Entreprises (priorité #1)**
- `business-sidebar-1` (Rectangle 300x250)
- `business-sidebar-2` (Skyscraper 300x600)
- `business-in-content` (In-article)
- `business-before-related` (Responsive)

**Pages Recherche**
- `search-header` (Leaderboard)
- `search-in-feed` (In-feed)

**Page d'accueil**
- `homepage-hero` (Leaderboard)
- `homepage-in-feed` (In-feed)

### 2. Mettre à jour les IDs (5 min)

Édite `src/config/adSlots.ts` et remplace les `'1234567890'` par les vrais IDs.

### 3. Intégrer sur une page pilot (30 min)

Commence par la page entreprise (`BusinessDetails.tsx`):

```tsx
// Au début du fichier
import AdSense, { AdSenseRectangle, AdSenseSidebar, AdSenseInArticle } from '@/components/AdSense'
import { AD_SLOTS } from '@/config/adSlots'

// Dans la sidebar, après la section contact:
<div className="glass rounded-xl p-6">
  <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 text-center">
    Publicité
  </div>
  <AdSenseRectangle slot={AD_SLOTS.business.sidebar1} />
</div>

// Plus bas dans la sidebar:
<div className="glass rounded-xl p-6">
  <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 text-center">
    Publicité
  </div>
  <AdSenseSidebar slot={AD_SLOTS.business.sidebar2} sticky={true} />
</div>

// Dans le contenu principal, entre sections:
<div className="my-8">
  <div className="text-center text-xs text-slate-500 mb-3">Publicité</div>
  <AdSenseInArticle slot={AD_SLOTS.business.inContent} />
</div>
```

### 4. Tester (1 jour)

Build en production locale:
```bash
npm run build
npm run start
```

Ouvre http://localhost:3000/entreprise/[n'importe-quel-slug]

**Note:** Les ads peuvent prendre 24-48h pour apparaître si compte AdSense nouveau.

### 5. Déployer et monitorer (7 jours)

Deploy sur production et surveille:
- **RPM** dans AdSense
- **Taux de rebond** dans Analytics
- **Temps sur page**

Cible minimale: RPM de 3-5$ après 7 jours.

### 6. Étendre aux autres pages

Si les métriques sont bonnes:
- [ ] Pages de recherche
- [ ] Page d'accueil
- [ ] Pages de catégories
- [ ] Pages de blog

## Estimation des Revenus

| Trafic mensuel | RPM conservateur | RPM réaliste | Revenus/mois |
|----------------|------------------|--------------|--------------|
| 50 000 pages vues | 3$ | 5$ | 150-250$ |
| 100 000 pages vues | 3$ | 5$ | 300-500$ |
| 200 000 pages vues | 3$ | 5$ | 600-1000$ |

## Optimisations Futures

### Court terme (Mois 1-2)
- A/B test positions des ads
- Optimiser pour mobile
- Ajuster fréquence des in-feed ads

### Moyen terme (Mois 3-6)
- Sponsorships directs (CPM plus élevé)
- Listings premium payants
- Partenariats avec entreprises locales

### Long terme (6+ mois)
- Programme d'affiliation
- Lead generation payante
- API premium pour developers

## Support

### Documentation
- Stratégie complète: `docs/strategie-publicitaire.md`
- Guide d'intégration: `docs/integration-publicites.md`

### Ressources externes
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Policy](https://support.google.com/adsense/answer/48182)

### Vérifications

- ✅ Script AdSense chargé
- ✅ ads.txt accessible
- ✅ Composants créés
- ⏳ Ad slots à créer dans AdSense
- ⏳ Intégration dans les pages
- ⏳ Tests et monitoring

---

**Créé le:** 2026-01-22
**Dernière mise à jour:** 2026-01-22
