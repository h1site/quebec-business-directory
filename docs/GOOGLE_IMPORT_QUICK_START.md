# Guide de démarrage rapide - Import Google Business

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

Cela installera:
- `express` - Serveur backend
- `cors` - Pour permettre les requêtes cross-origin
- `dotenv` - Pour les variables d'environnement
- `node-fetch` - Pour les appels API
- `concurrently` - Pour exécuter les deux serveurs en même temps

### 2. Configurer la clé API Google

Votre clé API est déjà configurée dans `.env`:
```
GOOGLE_PLACES_API_KEY=AIzaSyBY1wKHk0p0bf_Cw2lNZDW2zypePUrylxM
```

⚠️ **IMPORTANT**: Sécurisez cette clé en production!

### 3. Démarrer l'application

#### Option A: Tout démarrer en une commande (Recommandé)
```bash
npm run dev:all
```

Cela démarre:
- Frontend Vite sur http://192.168.2.226:5173
- Backend proxy sur http://localhost:3001

#### Option B: Démarrer séparément

**Terminal 1** - Frontend:
```bash
npm run dev
```

**Terminal 2** - Backend:
```bash
npm run dev:server
```

### 4. Tester l'import Google

1. Ouvrez http://192.168.2.226:5173/entreprise/nouvelle
2. Connectez-vous si nécessaire
3. Cliquez sur **"Importer depuis Google Business"**
4. Testez avec:
   - **URL**: Collez un lien Google Maps
   - **Recherche**: Entrez "H1Site Vaudreuil" ou le nom de votre entreprise

## 📁 Architecture

```
quebec-business-directory-main/
├── server.js                          # Serveur Express (proxy)
├── google-places-routes.js            # Routes API Google Places
├── src/
│   ├── services/
│   │   └── googleBusinessService.js   # Service frontend (appelle le proxy)
│   └── components/
│       ├── GoogleImportModal.jsx      # Modal d'import
│       └── GoogleImportModal.css      # Styles du modal
```

## 🔌 Endpoints du proxy

Le serveur proxy expose ces endpoints:

### POST `/api/google-places/search`
Recherche une entreprise par nom et adresse
```json
{
  "businessName": "H1Site",
  "address": "Vaudreuil"
}
```

### GET `/api/google-places/details/:placeId`
Récupère les détails d'un Place ID

### POST `/api/google-places/import`
Import unifié (URL, Place ID ou recherche)
```json
{
  "input": "https://maps.google.com/...",
  "address": ""
}
```

### GET `/api/google-places/photo/:photoReference`
Récupère l'URL d'une photo

## 🐛 Dépannage

### Erreur: "Cannot find module 'express'"
```bash
npm install
```

### Erreur: "Port 3001 already in use"
Changez le port dans `.env`:
```
PORT=3002
```
Et dans `.env` (VITE_API_URL):
```
VITE_API_URL=http://localhost:3002/api
```

### Erreur CORS persiste
Vérifiez que:
1. Le serveur backend est démarré
2. `VITE_API_URL` pointe vers le bon port
3. Redémarrez les deux serveurs

### "Business not found"
- Vérifiez l'orthographe
- Ajoutez plus de détails (ville, adresse)
- Essayez avec l'URL directe de Google Maps

## 📊 Monitoring

Le serveur affiche dans la console:
```
✅ Proxy server running on http://localhost:3001
📍 Google Places API proxy available at http://localhost:3001/api/google-places
```

Si la clé API manque:
```
⚠️  WARNING: GOOGLE_PLACES_API_KEY not found in environment variables
```

## 🔒 Sécurité

### En développement
✅ La clé API est dans le backend (.env)
✅ CORS est activé pour le développement

### En production
Ajoutez des restrictions:
1. **IP whitelist** dans Google Cloud Console
2. **Rate limiting** sur le serveur
3. **Authentification** sur les endpoints
4. **Variables d'environnement** sécurisées

## 🎯 Prochaines étapes

1. ✅ Import Google fonctionne
2. 🔄 Complétez les champs manquants manuellement
3. 📝 Sauvegardez l'entreprise dans Supabase
4. 🚀 Déployez en production avec les restrictions appropriées

## 💡 Astuce

Pour un développement plus rapide, créez un alias dans votre `package.json`:
```json
"scripts": {
  "start": "npm run dev:all"
}
```

Puis lancez simplement:
```bash
npm start
```

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs du serveur backend
2. Ouvrez la console du navigateur (F12)
3. Consultez la documentation: [docs/GOOGLE_IMPORT_SETUP.md](./GOOGLE_IMPORT_SETUP.md)
