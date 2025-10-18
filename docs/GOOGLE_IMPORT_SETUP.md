# Configuration de l'import Google Business Profile

Ce document explique comment configurer l'import automatique depuis Google Business Profile / Google Maps.

## Prérequis

Pour utiliser la fonctionnalité d'import Google Business, vous devez obtenir une clé API Google Places.

## Étapes de configuration

### 1. Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez le nom de votre projet

### 2. Activer l'API Places

1. Dans le menu de navigation, allez à **APIs & Services** > **Library**
2. Recherchez "Places API"
3. Cliquez sur **Places API**
4. Cliquez sur le bouton **Enable** (Activer)

### 3. Créer une clé API

1. Allez à **APIs & Services** > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
3. Une clé API sera générée
4. **IMPORTANT**: Cliquez sur le nom de la clé pour la configurer

### 4. Sécuriser votre clé API (Recommandé)

Pour éviter les utilisations non autorisées:

#### Option A: Restriction par domaine (Production)
1. Dans la section **Application restrictions**
2. Sélectionnez **HTTP referrers (web sites)**
3. Ajoutez vos domaines autorisés:
   ```
   https://votredomaine.com/*
   http://localhost:5173/*
   ```

#### Option B: Restriction par IP (Développement)
1. Dans la section **Application restrictions**
2. Sélectionnez **IP addresses**
3. Ajoutez votre adresse IP

### 5. Restreindre les APIs

1. Dans la section **API restrictions**
2. Sélectionnez **Restrict key**
3. Cochez uniquement **Places API**
4. Cliquez sur **Save**

### 6. Configurer votre application

1. Copiez votre clé API
2. Ouvrez le fichier `.env` à la racine du projet
3. Ajoutez votre clé:
   ```
   VITE_GOOGLE_PLACES_API_KEY=VOTRE_CLE_API_ICI
   ```
4. Redémarrez le serveur de développement

## Utilisation

### Depuis le formulaire d'ajout d'entreprise

1. Accédez à `/entreprise/nouvelle`
2. Cliquez sur le bouton **"Importer depuis Google Business"**
3. Choisissez votre méthode d'import:

   **Option 1: URL ou Place ID**
   - Trouvez votre entreprise sur Google Maps
   - Cliquez sur "Partager" ou copiez l'URL
   - Collez l'URL dans le champ

   **Option 2: Recherche**
   - Entrez le nom de votre entreprise
   - Ajoutez l'adresse (recommandé)
   - Cliquez sur "Importer"

4. Les données seront automatiquement remplies dans le formulaire
5. Vérifiez et complétez les informations manquantes
6. Soumettez le formulaire

## Formats d'URL supportés

Le système supporte plusieurs formats d'URL Google:

- `https://www.google.com/maps/place/...`
- `https://goo.gl/maps/...`
- `https://maps.app.goo.gl/...`
- Place ID direct (ex: `ChIJN1t_tDeuEmsRUsoyG83frY4`)

## Données importées

Les données suivantes sont automatiquement importées:

- ✅ Nom de l'entreprise
- ✅ Description (si disponible)
- ✅ Numéro de téléphone
- ✅ Site web
- ✅ Adresse complète
- ✅ Ville
- ✅ Code postal
- ✅ Coordonnées GPS (latitude/longitude)
- ✅ Note moyenne et nombre d'avis
- ✅ Suggestion de catégorie

## Données NON importées (à compléter manuellement)

- ❌ Email (non fourni par Google)
- ❌ Heures d'ouverture détaillées
- ❌ Photos (références disponibles mais nécessitent traitement)
- ❌ Services spécifiques
- ❌ Certifications
- ❌ Méthodes de paiement

## Tarification Google Places API

Google Places API offre:
- **200 000 requêtes gratuites par mois** pour Places Details
- Au-delà: $17 USD / 1000 requêtes

Pour un usage normal (quelques imports par jour), vous resterez dans le quota gratuit.

Plus d'infos: [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)

## Dépannage

### Erreur: "Google Places API key not configured"
- Vérifiez que `VITE_GOOGLE_PLACES_API_KEY` est défini dans `.env`
- Redémarrez le serveur de développement

### Erreur: "Business not found on Google Maps"
- Vérifiez l'orthographe du nom
- Ajoutez plus de détails d'adresse
- Essayez avec l'URL directe de Google Maps

### Erreur: "This API project is not authorized"
- Vérifiez que Places API est activée dans votre projet
- Vérifiez les restrictions de votre clé API
- Attendez quelques minutes pour la propagation

### L'import ne fonctionne pas en production
- Ajoutez votre domaine de production aux restrictions HTTP referrers
- Vérifiez les logs de la console du navigateur

## Sécurité

⚠️ **IMPORTANT**: Ne partagez JAMAIS votre clé API publiquement
- Ne la committez pas dans Git
- Utilisez toujours des restrictions d'API
- Surveillez votre utilisation dans Google Cloud Console

## Support

Pour plus d'informations:
- [Documentation Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Cloud Console](https://console.cloud.google.com/)
