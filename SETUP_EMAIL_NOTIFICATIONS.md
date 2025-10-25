# Configuration des Notifications Email

## 📧 Vue d'ensemble

Le système envoie automatiquement des emails pour:
1. **Nouvelle réclamation** → Email à info@h1site.com
2. **Réclamation approuvée** → Email au demandeur
3. **Réclamation rejetée** → Email au demandeur avec raison

## 🔧 Configuration (100% GRATUIT)

### Étape 1: Créer un compte Resend

1. Aller sur [resend.com](https://resend.com)
2. S'inscrire (gratuit jusqu'à 3000 emails/mois)
3. Vérifier votre email

### Étape 2: Obtenir la clé API Resend

1. Dans le dashboard Resend, aller dans **API Keys**
2. Cliquer sur **Create API Key**
3. Nommer: `Quebec Business Directory`
4. Copier la clé (commence par `re_...`)

### Étape 3: Configurer le domaine d'envoi

**Option A: Utiliser votre domaine (recommandé)**
1. Dans Resend, aller dans **Domains**
2. Cliquer **Add Domain**
3. Entrer: `registreduquebec.com`
4. Ajouter les enregistrements DNS (DKIM, SPF, etc.)
5. Attendre la vérification (~10 minutes)

**Option B: Utiliser le domaine sandbox (test seulement)**
- Emails envoyés uniquement aux adresses vérifiées
- Bon pour tester, pas pour production

### Étape 4: Installer Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### Étape 5: Déployer la fonction Edge

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref YOUR_PROJECT_REF
# Trouver YOUR_PROJECT_REF dans: Supabase Dashboard → Settings → General

# Déployer la fonction
supabase functions deploy send-claim-notification
```

### Étape 6: Configurer les secrets

```bash
# Ajouter la clé API Resend
supabase secrets set RESEND_API_KEY=re_votre_cle_ici

# Vérifier
supabase secrets list
```

### Étape 7: Tester la fonction

```bash
# Test local
supabase functions serve send-claim-notification

# Dans un autre terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-claim-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "new_claim",
    "claim": {
      "user_email": "test@example.com",
      "user_name": "Test User",
      "verification_method": "manual",
      "status": "pending"
    },
    "business": {
      "name": "Test Business",
      "city": "Montreal",
      "slug": "test-business"
    }
  }'
```

## 📝 Types d'emails envoyés

### 1. Nouvelle réclamation (`new_claim`)

**Destinataire:** info@h1site.com

**Contenu:**
```
Sujet: 🔔 Nouvelle réclamation: [Nom entreprise]

Nouvelle réclamation de fiche d'entreprise

Entreprise:
- Nom: [Nom]
- Ville: [Ville]
- URL: [Lien vers la fiche]

Demandeur:
- Email: [Email]
- Nom: [Nom]
- Téléphone: [Tél]

Méthode: [Email domaine / Google Business / Manuel]

Status:
✅ Approuvé automatiquement (si domaine correspond)
OU
⏳ En attente de révision

[Bouton: Gérer les réclamations]
```

### 2. Réclamation approuvée (`claim_approved`)

**Destinataire:** Email du demandeur

**Contenu:**
```
Sujet: ✅ Réclamation approuvée: [Nom entreprise]

Votre réclamation a été approuvée!

Félicitations! Votre demande pour [Nom entreprise] a été approuvée.

Prochaines étapes:
- Gérer cette fiche
- Modifier les informations
- Ajouter des photos
- Répondre aux avis

[Bouton: Gérer ma fiche]
```

### 3. Réclamation rejetée (`claim_rejected`)

**Destinataire:** Email du demandeur

**Contenu:**
```
Sujet: ❌ Réclamation non approuvée: [Nom entreprise]

Votre réclamation n'a pas été approuvée

Malheureusement, votre demande pour [Nom entreprise] n'a pas pu être approuvée.

Raison:
[Raison fournie par l'admin]

Que faire ensuite?
- Vérifier que vous êtes bien le propriétaire
- Préparer des documents justificatifs
- Nous contacter pour plus d'informations

[Bouton: Nous contacter]
```

## 🔍 Vérification du déploiement

### Dans Supabase Dashboard:

1. Aller dans **Edge Functions**
2. Vérifier que `send-claim-notification` apparaît
3. Cliquer dessus pour voir les logs

### Tester depuis l'application:

1. Se connecter avec un compte test
2. Réclamer une fiche d'entreprise
3. Vérifier l'email reçu à info@h1site.com

## 🐛 Dépannage

### Erreur: "Function not found"
```bash
# Re-déployer la fonction
supabase functions deploy send-claim-notification --no-verify-jwt
```

### Erreur: "RESEND_API_KEY not set"
```bash
# Vérifier les secrets
supabase secrets list

# Re-définir
supabase secrets set RESEND_API_KEY=re_votre_cle_ici
```

### Emails non reçus

1. **Vérifier les logs Supabase:**
   - Dashboard → Edge Functions → send-claim-notification → Logs

2. **Vérifier les logs Resend:**
   - Dashboard Resend → Emails
   - Chercher l'email par destinataire

3. **Vérifier le spam:**
   - Emails peuvent arriver dans spam initialement
   - Marquer comme "Pas spam" pour les futurs emails

### Domaine non vérifié

1. **Vérifier les enregistrements DNS:**
   ```bash
   dig TXT registreduquebec.com
   ```

2. **Attendre la propagation DNS:**
   - Peut prendre jusqu'à 24h
   - Utiliser [dnschecker.org](https://dnschecker.org)

3. **En attendant:**
   - Utiliser le domaine sandbox Resend
   - Ajouter info@h1site.com comme adresse vérifiée

## 💰 Limites gratuites

### Resend (gratuit)
- ✅ 3000 emails/mois
- ✅ 100 emails/jour
- ✅ Domaines personnalisés illimités
- ✅ API complète
- ✅ Webhooks
- ❌ Support prioritaire (payant)

### Supabase Edge Functions (gratuit)
- ✅ 500k invocations/mois
- ✅ 400k GB-s compute/mois
- ✅ 100 fonctions
- ❌ Support prioritaire (payant)

**Conclusion:** Largement suffisant pour des milliers de réclamations/mois, 100% gratuit!

## 🚀 Aller plus loin

### Ajouter plus de templates

Modifier `supabase/functions/send-claim-notification/index.ts`:

```typescript
case 'reminder':
  emailSubject = '⏰ Rappel: Réclamation en attente'
  emailHtml = `...`
  break
```

### Utiliser des templates Resend

```typescript
const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RESEND_API_KEY}`,
  },
  body: JSON.stringify({
    from: 'Registre du Québec <noreply@registreduquebec.com>',
    to: [toEmail],
    subject: emailSubject,
    react: EmailTemplate({ claim, business }) // Utiliser React Email
  }),
})
```

### Ajouter des pièces jointes

```typescript
body: JSON.stringify({
  from: '...',
  to: [...],
  subject: '...',
  html: '...',
  attachments: [
    {
      filename: 'verification.pdf',
      content: base64Content
    }
  ]
})
```

## 📊 Monitoring

### Dashboard Resend
- Emails envoyés/jour
- Taux de délivrabilité
- Bounces & Plaintes
- Temps de réponse API

### Dashboard Supabase
- Invocations de fonction
- Temps d'exécution
- Erreurs
- Logs en temps réel

### Alertes recommandées

1. **Email rate limit atteint** → Passer au plan payant
2. **Taux d'erreur > 5%** → Vérifier les logs
3. **Domaine non vérifié** → Vérifier DNS

bash scripts/enrich-google-loop.sh 2>&1 | tee logs/enrich-google-midnight.log &
