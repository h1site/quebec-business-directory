# Guide d'Implémentation SSR pour SEO

**Status**: Implémentation en cours (70% complété)
**Objectif**: Améliorer le SEO en rendant les 480K pages d'entreprises indexables par Google
**Date**: 2025-10-26

## 🎯 Pourquoi SSR?

Actuellement, ton site est une **SPA (Single Page Application)**. Google voit ceci:
```html
<div id="root"></div>
<script src="/assets/main.js"></script>
```

Avec SSR, Google verra le **HTML complet** de chaque page:
```html
<div id="root">
  <h1>Restaurant La Belle Province - Montréal</h1>
  <p>📞 514-123-4567</p>
  <p>🌐 labelle.com</p>
  <!-- Tout le contenu visible! -->
</div>
```

## ✅ Ce qui a été fait

### 1. Configuration Vite SSR
- ✅ `vite.config.ssr.js` - Config pour build SSR
- ✅ `src/entry-server.jsx` - Entry point serveur
- ✅ `src/entry-client.jsx` - Entry point client (hydration)
- ✅ `server-ssr.js` - Serveur Express avec SSR
- ✅ `index.html` - Template avec placeholders SSR
- ✅ Scripts package.json mis à jour

### 2. Dépendances installées
```bash
npm install --save-dev cross-env compression sirv
```

## ❌ Problème actuel

**Erreur**: Incompatibilité CommonJS/ESM avec `react-helmet-async`

```
Named export 'HelmetProvider' not found
```

### Cause
`react-helmet-async` est un module CommonJS et Vite SSR a du mal avec les imports nommés.

## 🔧 Solutions possibles

### Option 1: Remplacer react-helmet-async (RECOMMANDÉ)

Utiliser `react-helmet` standard ou une alternative ESM:

**A. Solution rapide**: Ne pas utiliser Helmet pour SSR initial
```jsx
// Retirer HelmetProvider du SSR
// Les meta tags seront ajoutés dynamiquement côté client
```

**B. Utiliser une alternative**:
- `@unhead/react` - Moderne, ESM-first
- `react-head` - Alternat Native ESM

### Option 2: Configuration Vite plus permissive

Modifier `vite.config.ssr.js`:
```javascript
export default defineConfig({
  // ...
  ssr: {
    noExternal: ['react-helmet-async'],
    // Forcer le bundling complet
  },
  resolve: {
    alias: {
      'react-helmet-async': 'react-helmet-async/lib/index.js'
    }
  }
});
```

### Option 3: Pre-rendering statique (Plus simple)

Au lieu de SSR complet, générer des pages HTML statiques au build:

**Avantages**:
- Plus simple à implémenter
- Pas de serveur Node requis en prod
- Parfait pour les 480K pages qui changent rarement

**Outil recommandé**: `vite-plugin-ssr` ou `vite-ssg`

```bash
npm install --save-dev vite-ssg
```

## 📋 Prochaines étapes (Choix 1 - SSR Complet)

Si tu veux continuer avec SSR complet:

1. **Fixer react-helmet-async**
   - Soit remplacer par alternative ESM
   - Soit configurer Vite pour le supporter

2. **Tester le rendu**
   ```bash
   npm run dev:ssr
   curl http://localhost:5173/
   ```

3. **Implémenter le chargement de données**
   - Ajouter Supabase fetch dans entry-server.jsx
   - Passer les données initiales au client

4. **Build de production**
   ```bash
   npm run build:ssr
   npm run preview:ssr
   ```

5. **Déploiement**
   - Hébergement Node.js requis (pas de static hosting)
   - Options: Railway, Render, DigitalOcean, AWS

## 📋 Prochaines étapes (Choix 2 - Pre-rendering) ⭐ PLUS SIMPLE

**Je recommande cette approche pour ton use case:**

1. **Installer vite-ssg**
   ```bash
   npm install --save-dev vite-ssg
   ```

2. **Générer pages statiques au build**
   - Créer un script qui liste toutes les URLs (480K entreprises)
   - vite-ssg génère un HTML pour chaque URL
   - Résultat: 480K fichiers HTML statiques

3. **Avantages pour toi**:
   - ✅ Pas besoin de serveur Node en production
   - ✅ Hébergement static (Netlify, Vercel, GitHub Pages)
   - ✅ Performance maximale (HTML pré-généré)
   - ✅ SEO parfait (Google voit tout le HTML)
   - ✅ Moins complexe qu'un serveur SSR

4. **Build workflow**:
   ```bash
   # 1. Fetch toutes les URLs depuis Supabase
   # 2. Générer HTML statique pour chaque URL
   # 3. Upload vers CDN
   ```

## 🚀 Recommandation finale

**Pour registreduquebec.com, je recommande le Pre-rendering (Option 3)**

Raisons:
1. Tes pages changent rarement (données d'entreprises)
2. 480K pages = beaucoup, mais raisonnable pour pre-rendering
3. Tu peux rebuild périodiquement (1x/jour ou quand data change)
4. Hébergement gratuit possible (Netlify/Vercel)
5. Performance supérieure au SSR

## 📊 Comparaison

| Critère | SSR Complet | Pre-rendering | SPA actuel |
|---------|-------------|---------------|------------|
| SEO | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Complexité | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Coût hébergement | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Temps réel | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🔨 Script de Pre-rendering (À implémenter)

```javascript
// scripts/prerender-businesses.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import { render } from '../dist/server/entry-server.js';

const supabase = createClient(url, key);

// 1. Fetch toutes les entreprises
const { data: businesses } = await supabase
  .from('businesses')
  .select('slug, city');

// 2. Générer HTML pour chaque entreprise
for (const biz of businesses) {
  const url = `/entreprise/${biz.city}/${biz.slug}`;
  const html = await render(url);

  // 3. Sauvegarder le fichier HTML
  await fs.writeFile(`dist/${url}/index.html`, html);
}

console.log(`✅ ${businesses.length} pages generated!`);
```

## 📝 Décision requise

**Sébastien, quelle approche veux-tu?**

1. **SSR Complet** - Je continue de fixer react-helmet-async
2. **Pre-rendering** - Je crée un système de génération statique (RECOMMANDÉ)
3. **Hybride** - SSR pour certaines pages, pre-render pour d'autres
4. **Autre** - Tu as une préférence différente?

Dis-moi et je continue l'implémentation!
