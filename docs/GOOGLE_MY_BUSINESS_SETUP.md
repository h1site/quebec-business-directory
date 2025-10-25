# Configuration Google My Business pour Claims

Ce document explique comment configurer l'intégration Google My Business pour permettre aux utilisateurs de réclamer leurs fiches d'entreprise.

## Vue d'ensemble

Le système de réclamation simplifié utilise l'API Google My Business pour:
1. Authentifier l'utilisateur via OAuth 2.0
2. Récupérer la liste des entreprises liées à son compte GMB
3. Permettre la sélection de la bonne entreprise
4. Auto-approuver la réclamation instantanément

## Étape 1: Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Nom suggéré: "Quebec Business Directory - GMB"

## Étape 2: Activer les APIs nécessaires

Dans la console Google Cloud, activez les APIs suivantes:

### APIs à activer:
1. **Google My Business API** (obsolète, mais certaines fonctions l'utilisent encore)
2. **My Business Account Management API**
3. **My Business Business Information API**
4. **My Business Verifications API**

### Comment activer:
1. Dans le menu, aller à "APIs & Services" > "Library"
2. Rechercher chaque API listée ci-dessus
3. Cliquer sur "Enable" pour chacune

## Étape 3: Configurer l'écran de consentement OAuth

1. Aller à "APIs & Services" > "OAuth consent screen"
2. Type d'utilisateur: **External**
3. Remplir les informations:
   - **App name**: Quebec Business Directory
   - **User support email**: Votre email
   - **Developer contact**: Votre email
   - **App domain**: Votre domaine (ex: quebecbusinessdirectory.com)
   - **Authorized domains**: Ajouter votre domaine

4. **Scopes** - Ajouter les scopes suivants:
   ```
   https://www.googleapis.com/auth/business.manage
   ```

5. **Test users** (si l'app est en mode test):
   - Ajouter les emails des utilisateurs qui pourront tester

## Étape 4: Créer les identifiants OAuth 2.0

1. Aller à "APIs & Services" > "Credentials"
2. Cliquer sur "Create Credentials" > "OAuth client ID"
3. Type d'application: **Web application**
4. Nom: "Quebec Business Directory Web Client"

5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://votre-domaine.com
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:5173/claim-gmb-callback
   https://votre-domaine.com/claim-gmb-callback
   ```

7. Cliquer sur "Create"
8. **Copier le Client ID et Client Secret**

## Étape 5: Configurer Supabase

### Dans le dashboard Supabase:

1. Aller à "Authentication" > "Providers"
2. Trouver "Google" dans la liste
3. Activer le provider
4. Entrer les informations:
   - **Client ID**: (celui de l'étape 4)
   - **Client Secret**: (celui de l'étape 4)

5. **Authorized Client IDs**: Ajouter le Client ID

6. Dans "Additional Scopes", ajouter:
   ```
   https://www.googleapis.com/auth/business.manage
   ```

7. Sauvegarder

## Étape 6: Créer la page de callback

Créer le fichier `/src/pages/ClaimGMBCallback.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const ClaimGMBCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the access token from Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) {
          throw new Error('No session found');
        }

        // The access token is in session.provider_token
        const accessToken = session.provider_token;

        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Store in localStorage for the GMB component to use
        localStorage.setItem('gmb_access_token', accessToken);

        // Redirect back to the business page or claim page
        const businessSlug = localStorage.getItem('claim_business_slug');

        if (businessSlug) {
          localStorage.removeItem('claim_business_slug');
          navigate(`/entreprise/${businessSlug}?claim=gmb`);
        } else {
          navigate('/');
        }

      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      {status === 'processing' && (
        <>
          <h2>Connexion à Google My Business...</h2>
          <p>Veuillez patienter...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h2>Erreur</h2>
          <p>Une erreur est survenue lors de la connexion.</p>
          <button onClick={() => navigate('/')}>Retour</button>
        </>
      )}
    </div>
  );
};

export default ClaimGMBCallback;
```

## Étape 7: Ajouter la route dans l'application

Dans votre fichier de routes (ex: `App.jsx` ou `Routes.jsx`):

```javascript
import ClaimGMBCallback from './pages/ClaimGMBCallback';

// Dans vos routes:
<Route path="/claim-gmb-callback" element={<ClaimGMBCallback />} />
```

## Étape 8: Utiliser le composant

### Option 1: Remplacer le modal existant

Dans la page de détails de l'entreprise, remplacer `ClaimBusinessModal` par `ClaimBusinessModalSimple`:

```javascript
import ClaimBusinessModalSimple from '../components/ClaimBusinessModalSimple';

// Dans le composant:
{showClaimModal && (
  <ClaimBusinessModalSimple
    business={business}
    user={user}
    onClose={() => setShowClaimModal(false)}
    onSuccess={() => {
      setShowClaimModal(false);
      loadBusiness(); // Recharger les données
    }}
  />
)}
```

### Option 2: Utiliser directement GoogleMyBusinessClaim

```javascript
import GoogleMyBusinessClaim from '../components/GoogleMyBusinessClaim';

<GoogleMyBusinessClaim
  business={business}
  onSuccess={() => console.log('Success!')}
  onCancel={() => console.log('Cancelled')}
/>
```

## Notes importantes

### Limites de l'API

- **Quota quotidien**: L'API Google My Business a des limites de quota
- **Vérification**: L'application doit être vérifiée par Google pour la production
- **Mode test**: En développement, limitez aux utilisateurs test

### Sécurité

- ✅ Les tokens d'accès ne sont jamais stockés côté serveur
- ✅ La vérification GMB est instantanée et sécurisée
- ✅ Chaque réclamation crée un enregistrement dans `business_claims`

### Statuts de publication Google

Pour passer en production (plus de 100 utilisateurs):

1. L'app doit passer la vérification Google OAuth
2. Remplir le formulaire de demande de vérification
3. Peut prendre 4-6 semaines

En attendant, utilisez le **mode Test** avec des utilisateurs test spécifiques.

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Vérifier que les redirect URIs sont exactement configurés
- Vérifier que le domaine est autorisé dans OAuth consent screen

### "insufficient_scope"
- Ajouter le scope `business.manage` dans Supabase
- Vérifier que le scope est demandé dans `signInWithOAuth`

### "No locations found"
- L'utilisateur n'a pas de compte Google My Business
- L'utilisateur n'a pas accès aux localisations de cette entreprise

### Token expiré
- Les tokens GMB expirent après 1 heure
- Implémenter un refresh token si nécessaire

## Support

Pour plus d'informations:
- [Google My Business API Docs](https://developers.google.com/my-business)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
