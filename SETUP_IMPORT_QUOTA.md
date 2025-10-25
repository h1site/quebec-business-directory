# Configuration du Système de Quota d'Import Google

Ce guide explique comment configurer le système de quota pour limiter les imports Google Places à 90 par jour (restant sous la limite gratuite de 100).

## 📋 Vue d'ensemble

Le système de quota:
- ✅ Limite les imports à **90 par jour** (marge de sécurité de 10)
- ✅ Se réinitialise automatiquement à **minuit**
- ✅ Désactive le bouton pour le public après 90 imports
- ✅ Permet aux admins d'importer même après 90 (avec avertissement de coût)
- ✅ Affiche un compteur en temps réel: "45/90 imports"
- ✅ Page de monitoring dans le Dashboard admin

## 🛠️ Étape 1: Créer la table et les fonctions SQL

### Via Supabase Dashboard (Recommandé)

1. **Accédez à Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Projet: `xrmryfyhqrxzrhdbmwor`

2. **Ouvrez SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Exécutez le script SQL**
   - Copiez tout le contenu du fichier: `supabase/migrations/create_google_import_stats.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" (ou Ctrl+Enter)

4. **Vérifiez la création**
   - Allez dans "Table Editor"
   - Vous devriez voir la table `google_import_stats`
   - Elle devrait avoir une ligne avec la date d'aujourd'hui et count = 0

### Vérification avec SQL

```sql
-- Vérifier que la table existe
SELECT * FROM google_import_stats;

-- Tester la fonction get_import_quota_info
SELECT get_import_quota_info(90);

-- Résultat attendu:
-- {
--   "imports_today": 0,
--   "limit": 90,
--   "remaining": 90,
--   "can_import": true,
--   "percentage_used": 0,
--   "date": "2025-10-25"
-- }
```

## 🔧 Étape 2: Configurer les variables d'environnement

### Variables Vercel (Production)

Dans Vercel Dashboard, ajoutez ces variables:

```bash
VITE_SUPABASE_URL=https://tiaofyawimkckjgxdnbd.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_PLACES_API_KEY=AIzaSyAyZYhc6z1P7P6ZIyClIKfvIUhUhSoWH34
```

**Important**: Utilisez le `SUPABASE_SERVICE_KEY` (pas l'anon key) pour bypasser RLS.

### Variables Locales (.env)

Votre fichier `.env` local devrait déjà avoir ces variables:

```bash
VITE_SUPABASE_URL=https://tiaofyawimkckjgxdnbd.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_PLACES_API_KEY=AIzaSyAyZYhc6z1P7P6ZIyClIKfvIUhUhSoWH34
```

## 🚀 Étape 3: Redémarrer les serveurs

### En local

```bash
# Arrêter les serveurs actuels (Ctrl+C)

# Redémarrer avec les nouvelles variables
npm run dev:all
```

### En production

1. **Déployez les changements sur Vercel**:
   ```bash
   git add .
   git commit -m "Add import quota system"
   git push
   ```

2. Vercel redéploiera automatiquement

## ✅ Étape 4: Tester le système

### Test 1: Vérifier l'endpoint quota

```bash
# En local
curl http://localhost:3001/api/google-places/quota

# En production
curl https://registreduquebec.com/api/google-places/quota
```

**Résultat attendu**:
```json
{
  "imports_today": 0,
  "limit": 90,
  "remaining": 90,
  "can_import": true,
  "percentage_used": 0,
  "date": "2025-10-25"
}
```

### Test 2: Tester l'import modal

1. Allez sur une fiche d'entreprise
2. Cliquez sur "Réclamer votre fiche"
3. Cliquez sur "Importer depuis Google"
4. Vous devriez voir: **"Imports aujourd'hui: 0/90"**
5. Le bouton "Rechercher" devrait avoir le badge "0/90"

### Test 3: Accéder au Dashboard Monitoring

1. Connectez-vous comme admin
2. Allez sur `/dashboard/import-monitoring`
3. Vous devriez voir:
   - Carte de statut avec emoji ✅
   - 4 cartes de statistiques
   - Barre de progression (devrait être à 0%)
   - Cartes d'information
   - Recommandations

## 📊 Utilisation du Dashboard

### Accès

URL: `/dashboard/import-monitoring`

Accessible uniquement aux administrateurs connectés.

### Fonctionnalités

1. **Statut en temps réel**
   - Compteur d'imports aujourd'hui
   - Imports restants
   - Pourcentage d'utilisation

2. **Alertes**
   - ✅ Vert: 0-79% (normal)
   - ⚠️ Orange: 80-99% (attention)
   - 🚨 Rouge: 100%+ (limite atteinte)

3. **Auto-refresh**
   - Actualisation automatique toutes les 30 secondes
   - Bouton manuel pour forcer la mise à jour

4. **Informations**
   - Coûts après dépassement
   - Réinitialisation quotidienne
   - Recommandations

## 🔒 Sécurité et Permissions

### Row Level Security (RLS)

Les politiques RLS sont configurées automatiquement:

- **Lecture publique**: Tout le monde peut lire le compteur (pour l'afficher sur le bouton)
- **Écriture restreinte**: Seul le service role peut incrémenter le compteur

### Backend uniquement

Le compteur est **toujours** incrémenté côté serveur (backend), jamais côté client. Impossible de contourner la limite depuis le navigateur.

## 🐛 Dépannage

### Problème: Erreur "Function get_import_quota_info does not exist"

**Solution**: Le script SQL n'a pas été exécuté correctement. Ré-exécutez le script SQL complet.

### Problème: Le compteur n'augmente pas

**Solution**:
1. Vérifiez que `SUPABASE_SERVICE_KEY` est configuré (pas l'anon key)
2. Vérifiez les logs du backend avec `console.log`
3. Testez manuellement dans SQL Editor:
   ```sql
   SELECT increment_import_count();
   ```

### Problème: Quota s'affiche comme "?/90"

**Solution**:
1. Vérifiez que l'endpoint `/api/google-places/quota` répond (test avec curl)
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que Supabase est accessible

### Problème: Le compteur ne se réinitialise pas à minuit

**Solution**: Le compteur se réinitialise automatiquement car chaque requête vérifie `CURRENT_DATE`. Aucune action nécessaire. Si problème persiste, vérifiez le fuseau horaire du serveur Supabase.

## 📈 Monitoring des coûts

### Google Cloud Console

Pour voir vos coûts réels:

1. Allez sur: https://console.cloud.google.com/billing
2. Sélectionnez votre projet
3. Regardez la section "Places API - Place Details"
4. Vérifiez le nombre d'appels ce mois-ci

### Calcul estimé

- 0-100 imports/jour = **$0 (GRATUIT)**
- 100-200 imports/jour = **~$2 CAD/jour**
- 200-500 imports/jour = **~$8 CAD/jour**
- 1000 imports/jour = **~$18 CAD/jour**

## 🎯 Prochaines étapes (optionnel)

### Améliorations possibles

1. **Notifications email**
   - Envoyer un email à l'admin à 80 imports
   - Envoyer un email à l'admin à 90 imports

2. **Historique sur 30 jours**
   - Graphique des imports quotidiens
   - Tendances et moyennes
   - Export CSV

3. **Alertes Slack/Discord**
   - Webhook pour notifier l'équipe
   - Alertes en temps réel

4. **Limites par utilisateur**
   - Limiter les imports par utilisateur (ex: 5/jour)
   - Prévenir les abus

5. **Tests automatisés**
   - Tests unitaires pour le service quota
   - Tests d'intégration end-to-end

## 📝 Résumé

✅ **Fichiers créés**:
- `supabase/migrations/create_google_import_stats.sql`
- `api/google-places/quota.js`
- `src/services/importQuotaService.js`
- `src/pages/Dashboard/ImportMonitoring.jsx`
- `src/pages/Dashboard/ImportMonitoring.css`

✅ **Fichiers modifiés**:
- `google-places-routes.js` (ajout route quota + vérification)
- `api/google-places/import.js` (ajout vérification quota)
- `src/components/GoogleImportModal.jsx` (affichage compteur)
- `src/components/GoogleImportModal.css` (styles quota)

✅ **Résultat**:
- 🎉 **100% gratuit** tant que < 90 imports/jour
- 🔒 **Sécurisé** - impossible de contourner
- 📊 **Monitoring** en temps réel dans le dashboard
- ⚠️ **Alertes** automatiques à 80 et 90 imports
- 🚫 **Désactivation** automatique du bouton public à 90

---

**Support**: Si vous rencontrez des problèmes, vérifiez d'abord les logs du backend et la console du navigateur.
