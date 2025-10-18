# 🔧 Fix CORS Error (www vs non-www redirect)

## Le problème

Vous voyez cette erreur dans la console :
```
Access to fetch at 'https://registreduquebec.com/api/google-places/import'
from origin 'https://www.registreduquebec.com' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
Redirect is not allowed for a preflight request.
```

**Cause** : Votre site est accessible via `www.registreduquebec.com` ET `registreduquebec.com`, et quand le navigateur essaie de faire une requête API depuis `www.`, il y a une redirection vers la version sans `www`, ce qui casse le CORS preflight.

## ✅ Solution

J'ai appliqué **deux corrections** :

### 1. ✅ Code corrigé (déjà fait)
- L'API accepte maintenant l'origine dynamique (www ou non-www)
- Headers CORS ajoutés dans `vercel.json`
- Gestion correcte des requêtes OPTIONS (preflight)

### 2. ⚠️ Configuration Vercel requise

Vous devez configurer Vercel pour qu'il n'y ait **PAS de redirection** entre www et non-www pour les appels API.

## 🚀 Configuration recommandée dans Vercel

### Option A : Rediriger www → non-www (RECOMMANDÉ)

Cette option garantit que tout le trafic utilise `registreduquebec.com` (sans www).

**Dans Vercel Dashboard** :
1. Allez dans **Settings → Domains**
2. Pour `www.registreduquebec.com` :
   - Cliquez sur **Edit**
   - Sélectionnez **Redirect to registreduquebec.com**
   - Assurez-vous que le **Status Code est 308** (permanent redirect)
3. Gardez `registreduquebec.com` comme domaine principal

### Option B : Utiliser www partout

Si vous préférez garder le `www` :

1. Allez dans **Settings → Domains**
2. Définissez `www.registreduquebec.com` comme domaine principal
3. Redirigez `registreduquebec.com` → `www.registreduquebec.com`

### Option C : Les deux fonctionnent (déjà configuré dans le code)

Le code que j'ai écrit supporte les deux variantes grâce à :
- Headers CORS dynamiques basés sur l'origine
- Configuration dans `vercel.json` pour les API routes

**Mais** il est quand même recommandé d'avoir UNE seule version canonique pour le SEO.

## 🔍 Vérification

### Test 1 : Vérifier les domaines Vercel

Dans Vercel → Settings → Domains, vous devriez voir :

**Configuration recommandée** :
```
✓ registreduquebec.com (Production)
✓ www.registreduquebec.com → Redirects to registreduquebec.com
```

### Test 2 : Tester l'API

Après déploiement, testez les deux variantes :

```bash
# Version sans www
curl https://registreduquebec.com/api/google-places

# Version avec www
curl https://www.registreduquebec.com/api/google-places
```

Les deux devraient retourner :
```json
{"status":"ok","message":"Google Places API proxy is running"}
```

### Test 3 : Import Google My Business

1. Allez sur `https://registreduquebec.com` (ou `https://www.registreduquebec.com`)
2. Créez une nouvelle entreprise
3. Cliquez sur "Importer depuis Google"
4. Testez l'importation

**Résultat attendu** : ✅ Aucune erreur CORS !

## 📋 Checklist

- [ ] Code corrigé et pushé vers GitHub
- [ ] Vercel a redéployé automatiquement
- [ ] Domaine principal configuré dans Vercel
- [ ] Redirection www configurée (option A recommandée)
- [ ] Test API fonctionne sans erreur CORS
- [ ] Import Google My Business fonctionne

## 🆘 Si ça ne fonctionne toujours pas

### Vérifier les headers CORS dans le navigateur

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet **Network**
3. Essayez l'import Google My Business
4. Cherchez la requête vers `/api/google-places/import`
5. Vérifiez les **Response Headers** :
   - `Access-Control-Allow-Origin` devrait être présent
   - `Access-Control-Allow-Methods` devrait inclure `POST`

### Logs Vercel

1. Dashboard → Deployments → Dernier déploiement
2. Cliquez sur **Functions**
3. Cherchez les logs de `google-places`
4. Vérifiez s'il y a des erreurs

### Tester avec curl

```bash
# Test preflight (OPTIONS request)
curl -X OPTIONS https://registreduquebec.com/api/google-places/import \
  -H "Origin: https://www.registreduquebec.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Vérifiez que la réponse contient :
# Access-Control-Allow-Origin: https://www.registreduquebec.com
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

## 🎯 Résumé

Le code est maintenant configuré pour :
- ✅ Accepter les requêtes de `www.` et non-`www`
- ✅ Gérer correctement les requêtes preflight CORS
- ✅ Éviter les erreurs de redirection

**Action requise** : Configurez votre domaine dans Vercel (Option A recommandée) et poussez le code vers GitHub.
