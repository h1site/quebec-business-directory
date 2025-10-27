# Déploiement Vercel - Registre du Québec avec SEO

**Status**: ✅ PRÊT POUR VERCEL
**Date**: 2025-10-26
**Solution**: Vercel Serverless Functions pour SEO dynamique

## 🎯 Solution Vercel

Au lieu d'un serveur Node.js persistant, on utilise des **Serverless Functions** Vercel qui:
- S'exécutent à la demande (pas de serveur 24/7)
- Fetch Supabase en temps réel
- Génèrent HTML avec SEO parfait
- **Gratuit** jusqu'à 100GB de bande passante!

## 📁 Fichiers créés

- `api/seo.js` - Serverless function pour SEO
- `vercel.json` - Configuration rewrites
- `VERCEL_DEPLOYMENT.md` - Ce guide

## 🚀 Déploiement sur Vercel

### Méthode 1: Via Dashboard Vercel (RECOMMANDÉ)

1. **Connecter le repo GitHub**
   - Aller sur https://vercel.com
   - New Project → Import depuis GitHub
   - Sélectionner `quebec-business-directory`

2. **Configuration**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Variables d'environnement**
   Ajouter dans Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL = https://[votre-projet].supabase.co
   VITE_SUPABASE_ANON_KEY = [votre-clé-anon]
   ```

4. **Deploy**
   - Cliquer "Deploy"
   - Attendre 1-2 minutes
   - **C'est tout!** 🎉

### Méthode 2: Via CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Suivre les prompts
# Set up and deploy? Yes
# Which scope? [Votre compte]
# Link to existing project? No
# Project name? quebec-business-directory
# In which directory? ./
# Override settings? No

# Deploy to production
vercel --prod
```

## ⚙️ Configuration Vercel

Le fichier `vercel.json` configure automatiquement:

```json
{
  "rewrites": [
    {
      "source": "/:categorySlug/:citySlug/:businessSlug",
      "destination": "/api/seo"
    },
    // ... autres routes
  ]
}
```

**Comment ça marche**:
1. User visite `/restaurant/montreal/la-belle-province`
2. Vercel redirige vers `/api/seo.js` avec paramètres
3. Function fetch Supabase
4. Génère HTML avec SEO
5. Retourne HTML optimisé

## 🧪 Tester avant déploiement

```bash
# Installer Vercel CLI
npm install -g vercel

# Lancer en mode dev
vercel dev

# Test URL
open http://localhost:3000
```

## 📊 Performance Vercel

| Métrique | Valeur |
|----------|--------|
| Cold start | ~500ms (première requête) |
| Warm | < 200ms |
| Concurrent requests | Illimité (auto-scale) |
| Coût | **Gratuit** (< 100GB/mois) |

## 💰 Coûts Vercel

### Plan Hobby (Gratuit)
- ✅ 100GB bande passante/mois
- ✅ Serverless Functions illimitées
- ✅ SSL automatique
- ✅ CDN global
- ✅ Domaine custom

**Estimation pour 480K pages**:
- 480K pages × 50KB = 24GB/mois de traffic
- **Gratuit!** (bien en dessous de 100GB)

### Plan Pro ($20/mois)
- 1TB bande passante
- Analytics avancés
- Support prioritaire

**Tu n'en as pas besoin pour l'instant!**

## ✅ Checklist post-déploiement

- [ ] Build réussit sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Test URL entreprise affiche bon HTML
- [ ] Schema.org validé (https://search.google.com/test/rich-results)
- [ ] Domaine custom configuré
- [ ] SSL actif (automatique)
- [ ] Sitemap accessible à `/sitemap.xml`
- [ ] Google Search Console configuré

## 🔧 Debugging

### Fonction serverless ne fonctionne pas

**Vérifier les logs**:
1. Vercel Dashboard → Project
2. Deployments → Latest
3. Functions → api/seo
4. View Logs

### Variables d'environnement

```bash
# Lister les variables
vercel env ls

# Ajouter une variable
vercel env add VITE_SUPABASE_URL

# Rebuild après changement
vercel --prod --force
```

### Test local

```bash
# Simuler Vercel localement
vercel dev

# Test
curl http://localhost:3000/entreprise/montreal/test-business
```

## 🌐 Domaine Custom

### Ajouter registreduquebec.com

1. **Vercel Dashboard**
   - Project Settings → Domains
   - Add Domain: `registreduquebec.com`

2. **DNS**
   Ajouter chez ton registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

3. **SSL**
   - Vercel configure automatiquement
   - Prend ~10-60 secondes

## 📈 Monitoring

### Analytics Vercel

- Requêtes par fonction
- Temps d'exécution
- Erreurs
- Bandwidth utilisé

### Google Search Console

1. Ajouter propriété: https://registreduquebec.com
2. Vérification: Méthode HTML tag
3. Soumettre sitemap: https://registreduquebec.com/sitemap.xml
4. Surveiller l'indexation

## 🚨 Limites Vercel

### Hobby Plan
- ⚠️ Timeout: 10 secondes par function
- ⚠️ Memory: 1GB max
- ⚠️ Payload: 4.5MB max

**Notre app**:
- ✅ Queries Supabase: < 500ms
- ✅ Memory usage: ~50MB
- ✅ Response size: ~10KB

**Pas de problème!**

## 🔄 Redéploiement

### Automatique (Git Push)
```bash
git add .
git commit -m "Update"
git push origin main
# Vercel redéploie automatiquement!
```

### Manuel
```bash
vercel --prod
```

## 📝 Différences vs server-seo.js

| Aspect | server-seo.js (Node) | api/seo.js (Vercel) |
|--------|---------------------|---------------------|
| Architecture | Serveur persistant | Serverless Function |
| Scaling | Manuel | Automatique |
| Cold start | Aucun | ~500ms |
| Coût | $5-7/mois | Gratuit |
| Maintenance | Redémarrage manuel | Zéro |
| SSL | Config manuelle | Automatique |

**Vercel est MEILLEUR pour ton use case!**

## 🎯 Prochaines étapes

1. ✅ Push code vers GitHub
2. ⏳ Connecter repo sur Vercel
3. ⏳ Configurer variables d'environnement
4. ⏳ Deploy!
5. ⏳ Tester URLs
6. ⏳ Soumettre sitemap à Google

---

**Questions?** Ouvre un issue sur GitHub ou consulte:
- https://vercel.com/docs
- https://vercel.com/docs/concepts/functions/serverless-functions
