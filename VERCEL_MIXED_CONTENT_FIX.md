# 🔧 Fix Mixed Content Error (HTTP vs HTTPS)

## Le problème

Vous voyez cette erreur dans la console :
```
Mixed Content: The page at 'https://www.registreduquebec.com/...' was loaded over HTTPS,
but requested an insecure resource 'http://registreduquebec.com/api/...'.
This request has been blocked; the content must be served over HTTPS.
```

## ✅ Solution IMMÉDIATE

### Étape 1 : Vérifier les variables d'environnement Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `quebec-business-directory`
3. Allez dans **Settings → Environment Variables**
4. **Cherchez `VITE_API_URL`**

### Étape 2 : Supprimer VITE_API_URL (si elle existe)

**Si vous voyez `VITE_API_URL` dans la liste** :
1. Cliquez sur les **trois points** à droite de la variable
2. Cliquez sur **Delete**
3. Confirmez la suppression

**Pourquoi ?** L'application détecte automatiquement l'environnement et utilise `/api` (relatif) en production, ce qui évite les problèmes HTTP/HTTPS.

### Étape 3 : Vérifier les variables REQUISES

Assurez-vous que ces variables SONT présentes :

| ✅ Variable | Description |
|------------|-------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase |
| `GOOGLE_PLACES_API_KEY` | Clé API Google Places |

### Étape 4 : Redéployer

1. Allez dans **Deployments**
2. Cliquez sur les **trois points** du dernier déploiement
3. Cliquez sur **Redeploy**

**OU attendez simplement le prochain push Git** - Vercel redéploiera automatiquement.

## 🎯 Configuration correcte pour Vercel

### Variables à DÉFINIR :
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
GOOGLE_PLACES_API_KEY=AIzaSyD...
```

### Variables à NE PAS DÉFINIR :
```
❌ VITE_API_URL (laissez vide - l'app détecte automatiquement)
```

## 🔍 Comment ça fonctionne maintenant ?

Le code détecte automatiquement l'environnement :

- **En production (Vercel)** : Utilise `/api` (chemin relatif = même protocole que la page)
- **En développement local** : Utilise `http://localhost:3001/api`

Le code force aussi HTTPS si `VITE_API_URL` contient `http://` en production.

## ✅ Vérification

Après le redéploiement, testez :

1. **Health check** : https://registreduquebec.com/api/google-places
   - Devrait retourner : `{"status":"ok","message":"Google Places API proxy is running"}`

2. **Import Google My Business** :
   - Allez sur votre site
   - Créez une nouvelle entreprise
   - Cliquez sur "Importer depuis Google"
   - Essayez d'importer une entreprise
   - ✅ Aucune erreur "Mixed Content" ne devrait apparaître

## 🆘 Si ça ne fonctionne toujours pas

1. Vérifiez les logs Vercel :
   - Dashboard → Deployments → Dernier déploiement → Functions
   - Cherchez les erreurs liées à `google-places`

2. Testez l'API directement :
   ```bash
   curl https://registreduquebec.com/api/google-places
   ```

3. Vérifiez la console du navigateur (F12) pour d'autres erreurs

4. Assurez-vous que `GOOGLE_PLACES_API_KEY` est bien configurée
