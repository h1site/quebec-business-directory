# Configuration Google OAuth pour Supabase

Ce guide explique comment activer la connexion avec Google dans votre application.

## 📋 Prérequis

- Compte Google Cloud Console
- Projet Supabase configuré

## 🚀 Étape 1: Google Cloud Console

### 1.1 Créer/Sélectionner un projet

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant

### 1.2 Configurer l'écran de consentement OAuth

1. Dans le menu latéral, allez à **APIs & Services** → **OAuth consent screen**
2. Sélectionnez **External** (sauf si vous avez Google Workspace)
3. Remplissez les informations requises:
   - **App name**: Registre d'entreprise du Québec
   - **User support email**: Votre email
   - **Developer contact information**: Votre email
4. Cliquez sur **Save and Continue**
5. **Scopes**: Laissez par défaut (email, profile, openid)
6. **Test users**: Ajoutez vos emails de test
7. Cliquez sur **Save and Continue**

### 1.3 Créer les identifiants OAuth

1. Allez à **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: Registre Quebec Auth
5. **Authorized redirect URIs**: Ajoutez les URLs suivantes
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   Remplacez `YOUR_SUPABASE_PROJECT_REF` par votre référence de projet Supabase

   Exemple:
   ```
   https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```

6. Cliquez sur **Create**
7. **IMPORTANT**: Copiez votre **Client ID** et **Client Secret**

## 🔧 Étape 2: Configuration Supabase

### 2.1 Activer Google Provider

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez à **Authentication** → **Providers**
4. Trouvez **Google** dans la liste
5. Activez le toggle **Enable Sign in with Google**
6. Collez votre **Client ID** de Google
7. Collez votre **Client Secret** de Google
8. Cliquez sur **Save**

### 2.2 Configurer les URLs autorisées

1. Dans Supabase, allez à **Authentication** → **URL Configuration**
2. Ajoutez vos URLs de redirection:
   - **Development**: `http://localhost:5173/entreprise/nouvelle`
   - **Production**: `https://votredomaine.com/entreprise/nouvelle`

## ✅ Étape 3: Tester

### 3.1 En développement local

1. Lancez votre application: `npm run dev`
2. Allez à la page de connexion: `http://localhost:5173/login`
3. Cliquez sur **"Continuer avec Google"**
4. Sélectionnez votre compte Google
5. Vous devriez être redirigé vers `/entreprise/nouvelle`

### 3.2 En production

1. Assurez-vous que l'URL de production est ajoutée dans:
   - Google Cloud Console (Authorized redirect URIs)
   - Supabase (URL Configuration)
2. Déployez votre application
3. Testez la connexion Google

## 🔒 Sécurité

### Bonnes pratiques

- ✅ Ne JAMAIS exposer le Client Secret dans le code frontend
- ✅ Toujours vérifier l'email de l'utilisateur côté backend
- ✅ Limiter les domaines autorisés dans Supabase
- ✅ Utiliser HTTPS en production
- ✅ Restreindre les scopes OAuth au minimum nécessaire

### Configuration RLS (Row Level Security)

Assurez-vous que vos politiques RLS dans Supabase vérifient `auth.uid()` pour protéger les données des utilisateurs.

## 🐛 Dépannage

### Erreur: "redirect_uri_mismatch"

**Cause**: L'URL de redirection ne correspond pas à ce qui est configuré dans Google Cloud Console

**Solution**:
1. Vérifiez que l'URL dans Google Cloud Console est exactement: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
2. Pas de slash `/` à la fin
3. Utilisez la référence de projet Supabase, pas votre domaine custom

### Erreur: "access_denied"

**Cause**: L'utilisateur a refusé l'accès ou n'est pas dans les test users

**Solution**:
1. Si en mode "Testing", ajoutez l'email dans **OAuth consent screen** → **Test users**
2. Ou passez l'app en mode "Production" (nécessite validation Google pour les apps publiques)

### Connexion fonctionne mais redirection échoue

**Cause**: L'URL de redirection n'est pas autorisée dans Supabase

**Solution**:
1. Allez dans Supabase → **Authentication** → **URL Configuration**
2. Ajoutez votre URL dans **Redirect URLs**

## 📚 Ressources

- [Supabase Google OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

## 🎯 Prochaines étapes

Une fois Google OAuth configuré, vous pouvez:

1. **Tester avec différents comptes** pour valider le flux
2. **Ajouter d'autres providers** (Facebook, Apple, etc.)
3. **Personnaliser l'expérience** après connexion
4. **Configurer les métadonnées utilisateur** dans Supabase

## 💡 Notes importantes

- Le **Client ID** est public, il peut être dans le code frontend
- Le **Client Secret** ne doit JAMAIS être dans le code frontend (Supabase le gère côté serveur)
- Les utilisateurs créés via Google OAuth ont un email vérifié automatiquement
- L'email de l'utilisateur est disponible dans `user.email` après connexion
