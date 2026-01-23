# Stratégie Publicitaire - Registre du Québec

## Vue d'ensemble

Registre du Québec est un annuaire d'entreprises avec ~48 000 entreprises indexées. Cette stratégie vise à maximiser les revenus publicitaires via Google AdSense tout en préservant l'expérience utilisateur.

---

## Types de Publicités

### Google AdSense Display Ads
Publicités visuelles intégrées dans le contenu de la plateforme.

**Compte AdSense:** `ca-pub-8781698761921917`

---

## Placement des Publicités par Section

### Page d'Accueil

| Type | Placement | Format |
|------|-----------|--------|
| Display | Sous le hero/search | Leaderboard 728x90 |
| Display | Entre catégories populaires | In-feed native |
| Display | Sidebar (desktop) | Rectangle 300x250 |
| Display | Avant footer | Leaderboard 728x90 |

**Recommandations:**
- Maximum 3 ads sur la page d'accueil
- In-feed ads entre les sections de contenu
- Responsive sur mobile

---

### Pages d'Entreprises

| Type | Placement | Format |
|------|-----------|--------|
| Display | Sous les infos de contact | Rectangle 300x250 |
| Display | Sidebar (desktop) | Skyscraper 300x600 sticky |
| Display | Entre sections (services/FAQ) | In-article responsive |
| Display | Avant entreprises similaires | Leaderboard 728x90 |

**Recommandations:**
- Ads contextuelles liées à l'industrie/catégorie
- Maximum 4 ads par page entreprise
- Sidebar sticky pour desktop
- Pas d'ads au-dessus des informations critiques (téléphone, adresse)

**CPM estimé:** 3-8$ (trafic local Québec)

---

### Pages de Recherche

| Type | Placement | Format |
|------|-----------|--------|
| Display | Sous la barre de recherche | Leaderboard 728x90 |
| Display | In-feed (tous les 5-7 résultats) | Native responsive |
| Display | Sidebar filtres (desktop) | Rectangle 300x250 |

**Recommandations:**
- Ads in-feed naturelles entre résultats
- Éviter de bloquer les filtres
- Mobile: in-feed seulement

---

### Pages de Catégories

| Type | Placement | Format |
|------|-----------|--------|
| Display | Sous le titre de catégorie | Leaderboard 728x90 |
| Display | Entre les entreprises | In-feed (tous les 8-10) |
| Display | Sidebar (desktop) | Rectangle 300x250 |

**Recommandations:**
- Ciblage contextuel par catégorie
- Sponsors potentiels: entreprises de la catégorie

---

### Pages de Villes

| Type | Placement | Format |
|------|-----------|--------|
| Display | Sous le titre ville | Leaderboard 728x90 |
| Display | Entre les catégories | In-feed native |
| Display | Sidebar | Rectangle 300x250 |

---

### Pages de Blog

| Type | Placement | Format |
|------|-----------|--------|
| Display | Après introduction | In-article responsive |
| Display | Milieu d'article | In-article responsive |
| Display | Fin d'article | Rectangle 336x280 |
| Display | Sidebar (desktop) | Skyscraper 300x600 |

**Recommandations:**
- Maximum 3 ads par article
- Ratio contenu/pub: minimum 70% contenu
- Éviter les popups

---

## Formats Display Recommandés

| Format | Dimensions | Usage |
|--------|------------|-------|
| Leaderboard | 728x90 | Header, sous sections |
| Rectangle moyen | 300x250 | Sidebar, in-content |
| Grand rectangle | 336x280 | In-article |
| Skyscraper | 300x600 | Sidebar sticky |
| Mobile banner | 320x50 | Header mobile |
| Responsive Auto | Auto | **Recommandé partout** |

---

## Placement Stratégique Visuel

### Page Entreprise (Desktop)

```
┌─────────────────────────────────┬───────────┐
│ Header Navigation               │           │
├─────────────────────────────────┤           │
│ Nom Entreprise + Note           │  Sidebar  │
│ Adresse, Téléphone, Site Web    │           │
│                                 │ [AD #1]   │
│ [AD #1 - Rectangle 300x250]    │ 300x250   │
│                                 │           │
│ Description / Services          │           │
│                                 │           │
│ Horaires                        │ [AD #2]   │
│                                 │ 300x600   │
│ [AD #2 - In-article]           │ Sticky    │
│                                 │           │
│ FAQ                             │           │
│                                 │           │
│ Avis clients                    │           │
│                                 │           │
│ [AD #3 - Leaderboard 728x90]   │           │
│                                 │           │
│ Entreprises similaires          │           │
├─────────────────────────────────┴───────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

### Page Recherche

```
┌─────────────────────────────────────────────┐
│ Header + Barre de recherche                 │
├─────────────────────────────────────────────┤
│ [AD #1 - Leaderboard 728x90]               │
├─────────────────────────────────────────────┤
│ Résultat 1                                  │
│ Résultat 2                                  │
│ Résultat 3                                  │
│ [AD #2 - In-feed Native]                   │
│ Résultat 4                                  │
│ Résultat 5                                  │
│ Résultat 6                                  │
│ [AD #3 - In-feed Native]                   │
│ ...                                         │
└─────────────────────────────────────────────┘
```

---

## Considérations UX

### À faire ✅

- Ads responsives pour tous les appareils
- Chargement asynchrone (lazy loading)
- Étiquettes "Publicité" claires
- Contraste avec le contenu
- Pas d'ads invasives sur mobile

### À éviter ❌

- Popups intrusifs
- Ads au-dessus des infos de contact critiques
- Trop d'ads sur pages mobiles
- Auto-play video avec son
- Ads qui ressemblent aux résultats de recherche

---

## Métriques à Suivre

| Métrique | Cible |
|----------|-------|
| RPM (Revenue per 1000) | 3-10$ |
| CTR Display | 0.5-2% |
| Viewability | 70%+ |
| Taux de rebond | < 40% |
| Temps sur page | > 1:30 min |

---

## Implémentation Technique

### Script global (layout.tsx)

```tsx
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8781698761921917"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

### Composant AdSense Réutilisable

```tsx
// components/AdSense.tsx
interface AdSenseProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle'
  layout?: 'in-article' | 'in-feed'
  responsive?: boolean
  className?: string
}

export default function AdSense({ slot, format = 'auto', layout, responsive = true, className }: AdSenseProps) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8781698761921917"
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}
```

---

## Slots AdSense à Créer

| Emplacement | Slot ID | Format |
|-------------|---------|--------|
| Homepage - Hero | À créer | Responsive |
| Homepage - In-feed | À créer | In-feed |
| Business - Sidebar 1 | À créer | 300x250 |
| Business - Sidebar 2 | À créer | 300x600 |
| Business - In-content | À créer | In-article |
| Search - Header | À créer | Leaderboard |
| Search - In-feed | À créer | In-feed |
| Blog - In-article 1 | À créer | In-article |
| Blog - In-article 2 | À créer | In-article |
| Blog - Sidebar | À créer | 300x600 |

> **Note:** Créer ces slots dans Google AdSense Dashboard avant déploiement

---

## Revenus Estimés

Basé sur 50 000 pages vues/mois:

| Scénario | RPM | Revenus/mois |
|----------|-----|--------------|
| Conservateur | 3$ | 150$ |
| Réaliste | 5-7$ | 250-350$ |
| Optimiste | 10$+ | 500$+ |

**Facteurs d'augmentation:**
- Trafic ciblé (recherches locales)
- Pages entreprises bien rankées
- Contenu blog de qualité
- Optimisation continue

---

## Plan de Déploiement

### Phase 1 - Setup (Semaine 1)
- [ ] Configurer compte AdSense
- [ ] Créer fichier ads.txt
- [ ] Créer tous les ad slots
- [ ] Développer composants React

### Phase 2 - Implémentation (Semaine 2)
- [ ] Intégrer ads sur pages entreprises
- [ ] Intégrer ads sur recherche
- [ ] Intégrer ads sur blog
- [ ] Tests multi-appareils

### Phase 3 - Optimisation (Semaine 3-4)
- [ ] Analyser métriques
- [ ] A/B testing placements
- [ ] Ajuster formats/positions
- [ ] Optimiser pour mobile

### Phase 4 - Scale (Mois 2+)
- [ ] Sponsorships directs
- [ ] Partenariats entreprises
- [ ] Listings premium payants
- [ ] Publicités ciblées par industrie

---

## Options de Monétisation Additionnelles

### 1. Listings Premium
- Entreprises peuvent payer pour apparaître en haut
- Badge "Premium" visible
- Photos illimitées
- Statistiques de vues

### 2. Sponsorships de Catégories
- Sponsors locaux pour catégories spécifiques
- Ex: "Plombiers à Montréal - Sponsorisé par ABC Plumbing"

### 3. Publicités Ciblées Direct
- Vendre directement aux grandes entreprises
- CPM plus élevé que AdSense (15-30$)

---

## Fichier ads.txt

Créer `/public/ads.txt`:

```
google.com, pub-8781698761921917, DIRECT, f08c47fec0942fa0
```

---

## Conformité RGPD/CCPA

### Consentement Cookies

Utiliser Google Consent Mode v2:

```tsx
// components/CookieConsent.tsx
// Implémenter bannière de consentement cookies
// Intégration avec gtag.js pour consent management
```

---

## Prochaines Étapes Immédiates

1. [ ] Créer/vérifier compte AdSense pour registreduquebec.com
2. [ ] Créer tous les ad slots dans AdSense
3. [ ] Développer composant `<AdSense />` réutilisable
4. [ ] Ajouter script global dans layout
5. [ ] Intégrer ads sur page entreprise (pilot)
6. [ ] Tester et monitorer pendant 7 jours
7. [ ] Déployer sur toutes les pages
8. [ ] Optimiser selon données Analytics

---

## KPIs de Succès

| Métrique | Mois 1 | Mois 3 | Mois 6 |
|----------|--------|--------|--------|
| RPM | 3-5$ | 5-8$ | 8-12$ |
| Revenus | 150-250$ | 400-600$ | 800-1200$ |
| CTR | 0.5% | 1% | 1.5% |
| Taux rebond | < 50% | < 45% | < 40% |

---

**Dernière mise à jour:** 2026-01-22
