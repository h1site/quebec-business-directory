# Guide de débogage Vercel - Google Places API

## Comment tester l'API sur Vercel

### 1. Tester le Health Check

Ouvrez votre navigateur et allez à :
```
https://registreduquebec.com/api/google-places
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "message": "Google Places API proxy is running"
}
```

### 2. Tester avec curl (ligne de commande)

```bash
# Test du health check
curl https://registreduquebec.com/api/google-places

# Test d'importation avec une URL Google Maps
curl -X POST https://registreduquebec.com/api/google-places/import \
  -H "Content-Type: application/json" \
  -d '{"input": "ChIJN1t_tDeuEmsRUsoyG83frY4"}'

# Test d'importation avec un nom d'entreprise
curl -X POST https://registreduquebec.com/api/google-places/import \
  -H "Content-Type: application/json" \
  -d '{"input": "Tim Hortons", "address": "Montreal QC"}'
```

## Erreurs courantes et solutions

### Erreur : "Google Places API key not configured on server"

**Cause** : La variable d'environnement `GOOGLE_PLACES_API_KEY` n'est pas configurée dans Vercel.

**Solution** :
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Settings → Environment Variables
4. Ajoutez `GOOGLE_PLACES_API_KEY` avec votre clé
5. Redéployez (ou attendez le prochain déploiement automatique)

### Erreur : "Impossible de se connecter au serveur API"

**Cause** : L'URL de l'API n'est pas accessible ou la route n'existe pas.

**Solution** :
1. Testez le health check : `https://registreduquebec.com/api/google-places`
2. Vérifiez que le fichier `/api/google-places.js` existe dans votre repo
3. Vérifiez les logs de déploiement Vercel

### Erreur : "Business not found"

**Cause** : Google Places API ne trouve pas l'entreprise avec les critères fournis.

**Solution** :
1. Vérifiez que le nom de l'entreprise est correct
2. Ajoutez l'adresse pour être plus précis
3. Essayez avec l'URL Google Maps directement

## Vérifier les logs Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "Deployments"
4. Cliquez sur le déploiement le plus récent
5. Cliquez sur "Functions" pour voir les logs des fonctions serverless
6. Cherchez les erreurs liées à `google-places`

## Variables d'environnement requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | `eyJhbGc...` |
| `GOOGLE_PLACES_API_KEY` | Clé Google Places API | `AIzaSyD...` |

## Routes API disponibles

- `GET /api/google-places` - Health check
- `POST /api/google-places/search` - Rechercher un lieu par nom
- `GET /api/google-places/details/:placeId` - Obtenir les détails d'un lieu
- `POST /api/google-places/import` - Importer depuis Google (URL, Place ID, ou nom)
- `GET /api/google-places/photo/:photoReference` - Obtenir une photo

## Tester localement avant de déployer

```bash
# 1. Installer les dépendances
npm install

# 2. Créer un fichier .env avec vos clés
cp .env.example .env
# Éditez .env et ajoutez vos clés

# 3. Démarrer le serveur de développement
npm run dev:all

# 4. Tester l'API locale
curl http://localhost:3001/api/google-places
```
