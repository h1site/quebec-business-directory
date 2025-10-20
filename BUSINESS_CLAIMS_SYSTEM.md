# Système de Réclamation de Fiche d'Entreprise

## 📋 Vue d'ensemble

Le système de réclamation permet aux propriétaires d'entreprises de revendiquer et gérer leurs fiches dans l'annuaire. Trois méthodes de vérification sont disponibles, avec une approbation automatique pour les emails avec domaine correspondant.

## 🔐 Méthodes de Vérification

### 1. Email Domaine (Auto-approuvé ✅)

**Comment ça fonctionne:**
- L'utilisateur se connecte avec un email dont le domaine correspond au site web de l'entreprise
- Le système vérifie automatiquement la correspondance
- Approbation instantanée sans intervention admin

**Exemples:**

| Email utilisateur | Site web entreprise | Résultat |
|-------------------|---------------------|----------|
| info@h1site.com | https://h1site.com | ✅ Auto-approuvé |
| contact@duvaltex.ca | www.duvaltex.ca | ✅ Auto-approuvé |
| jean@gmail.com | https://h1site.com | ❌ Vérification manuelle requise |

**Logique technique:**
```sql
-- Fonction de vérification
CREATE FUNCTION check_email_domain_match(email, website) RETURNS BOOLEAN

-- Extraction du domaine email: info@h1site.com → h1site.com
-- Extraction du domaine site: https://www.h1site.com/path → h1site.com
-- Comparaison: h1site.com = h1site.com → TRUE
```

**Trigger automatique:**
```sql
CREATE TRIGGER auto_approve_business_claim
  BEFORE INSERT ON business_claims
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_claim_if_domain_match();
```

### 2. Google My Business 🔗

**Comment ça fonctionne:**
1. L'utilisateur fournit l'URL de sa fiche Google My Business
2. L'utilisateur ajoute temporairement un code de vérification dans la description Google
3. L'admin vérifie la présence du code sur la fiche Google
4. L'admin approuve ou rejette manuellement

**Code de vérification:**
```
CODE-VERIFICATION-[8 premiers caractères de l'UUID de l'entreprise]
Exemple: CODE-VERIFICATION-B726F537
```

**Instructions pour l'utilisateur:**
1. Connectez-vous à Google My Business
2. Modifiez la description de votre fiche
3. Ajoutez le code de vérification fourni
4. Collez l'URL de votre fiche Google Maps
5. Soumettez la demande

**Vérification admin:**
- Ouvrir l'URL Google fournie
- Vérifier la présence du code dans la description
- Approuver si code présent, rejeter sinon

### 3. Vérification Manuelle 📝

**Comment ça fonctionne:**
1. L'utilisateur explique pourquoi il réclame cette fiche
2. L'admin contacte l'utilisateur par email ou téléphone
3. L'admin demande une preuve (facture, permis, document NEQ, etc.)
4. L'admin approuve ou rejette avec notes

**Informations fournies:**
- Nom complet
- Numéro de téléphone
- Message expliquant le lien avec l'entreprise

**Preuves acceptables:**
- Facture récente de l'entreprise
- Permis d'affaires
- Document d'incorporation (NEQ)
- Relevé bancaire au nom de l'entreprise
- Bail commercial
- Certificat d'assurance

## 🗄️ Structure de la Base de Données

### Table `business_claims`

```sql
CREATE TABLE business_claims (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  user_id UUID REFERENCES auth.users(id),

  -- Statut
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  verification_method VARCHAR(50), -- email_domain, google_business, manual

  -- Info utilisateur
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_phone VARCHAR(50),

  -- Données de vérification
  verification_data JSONB, -- { googleBusinessUrl, message, etc. }
  notes TEXT, -- Notes admin (raison du refus, etc.)

  -- Timestamps
  claimed_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES auth.users(id),

  UNIQUE(business_id, user_id)
);
```

### Colonnes ajoutées à `businesses`

```sql
ALTER TABLE businesses ADD COLUMN:
- claimed_by UUID REFERENCES auth.users(id)
- claimed_at TIMESTAMP
- is_claimed BOOLEAN DEFAULT FALSE
```

## 🎨 Interface Utilisateur

### Bouton "Réclamer votre fiche"

**Emplacement:** Page détails de l'entreprise (BusinessDetails.jsx)

**Conditions d'affichage:**
- ✅ Entreprise NON réclamée (`is_claimed = false`)
- ✅ Utilisateur connecté ou bouton redirige vers login

**États:**
```jsx
{!business.is_claimed && user && !isOwner && (
  <button onClick={() => setShowClaimModal(true)}>
    📋 Réclamer votre fiche
  </button>
)}

{!business.is_claimed && !user && (
  <button onClick={() => navigate('/login')}>
    📋 Réclamer votre fiche
  </button>
)}
```

### Modal de Réclamation (ClaimBusinessModal)

**Étapes:**
1. **Sélection** → Choix de la méthode (Google Business ou Manuel)
2. **Formulaire** → Remplir les informations requises
3. **Résultat** → Success (auto-approuvé) | Pending (en attente) | Error

**Détection auto-approbation:**
```jsx
const canAutoApprove = () => {
  const emailDomain = user.email.split('@')[1].toLowerCase();
  const websiteDomain = business.website
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
  return emailDomain === websiteDomain;
};
```

## 🛠️ Interface Admin

### Page Admin Claims (`/admin/claims`)

**Filtres:**
- Toutes
- En attente (pending)
- Approuvées (approved)
- Rejetées (rejected)

**Informations affichées:**
- Nom de l'entreprise et ville
- Nom et email du demandeur
- Téléphone du demandeur
- Méthode de vérification
- Date de la demande
- Site web de l'entreprise
- Téléphone de l'entreprise
- Message ou URL Google Business
- Notes admin (si rejetée)

**Actions:**
- ✓ Approuver → Marque claimed, assigne l'utilisateur
- ✗ Rejeter → Demande raison, ajoute notes
- 👁 Voir la fiche → Ouvre la page de l'entreprise

### Dashboard Admin

**Statistique ajoutée:**
```jsx
<Link to="/admin/claims" className="stat-card stat-card-clickable">
  <div className="stat-value">{stats.pendingClaims}</div>
  <div className="stat-label">Réclamations en attente</div>
</Link>
```

**Style:**
- Fond jaune (alerte)
- Effet hover avec élévation
- Clickable vers /admin/claims

## 🔒 Sécurité et Permissions

### Row Level Security (RLS)

**Utilisateurs peuvent:**
- ✅ Voir leurs propres réclamations
- ✅ Créer de nouvelles réclamations
- ✅ Modifier leurs réclamations en attente

**Admins peuvent:**
- ✅ Voir toutes les réclamations
- ✅ Approuver/rejeter toutes les réclamations

**Emails admin autorisés:**
- karpe_25@hotmail.com
- info@h1site.com

```sql
CREATE POLICY "Admins can view all claims"
  ON business_claims FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'email' IN ('karpe_25@hotmail.com', 'info@h1site.com')
  );
```

### Protection contre les abus

**Contrainte d'unicité:**
```sql
UNIQUE(business_id, user_id)
-- Un utilisateur ne peut réclamer la même entreprise qu'une fois
```

**Vérification côté serveur:**
- Approbation automatique via trigger SQL (pas de bypass client)
- Validation du domaine email stricte
- Logs de qui a approuvé/rejeté (`verified_by`)

## 📊 Workflow Complet

### Cas 1: Auto-approbation (Email Domaine)

```
1. User: info@h1site.com visite /entreprise/h1site
2. Click "Réclamer votre fiche"
3. Modal détecte: email domain = website domain
4. Affiche message "Approbation automatique disponible!"
5. User clique "Continuer avec Google" ou "Demande manuelle"
6. Backend: INSERT INTO business_claims
7. Trigger: check_email_domain_match() → TRUE
8. Trigger: UPDATE status = 'approved'
9. Trigger: UPDATE businesses SET claimed_by = user_id, is_claimed = TRUE
10. Frontend: Affiche "✅ Approuvé automatiquement!"
11. Page reload → Bouton disparaît, user devient owner
```

### Cas 2: Google My Business

```
1. User: jean@gmail.com visite /entreprise/h1site
2. Click "Réclamer votre fiche"
3. Modal: Pas d'auto-approbation (domaines différents)
4. User choisit "Vérification Google My Business"
5. User entre nom, téléphone, URL Google
6. User modifie description Google avec code
7. Backend: INSERT INTO business_claims (status = 'pending')
8. Frontend: "⏳ Demande envoyée, admin va vérifier"
9. Admin va sur /admin/claims
10. Admin ouvre URL Google, vérifie code
11. Admin clique "✓ Approuver"
12. Backend: UPDATE claim status = 'approved'
13. Backend: UPDATE business claimed_by = user_id
14. User reçoit email de confirmation
```

### Cas 3: Vérification Manuelle

```
1. User: proprietaire@gmail.com visite /entreprise/restaurant-xyz
2. Click "Réclamer votre fiche"
3. User choisit "Demande manuelle"
4. User remplit: nom, téléphone, message
5. Message: "Je suis propriétaire depuis 2015, j'ai les factures"
6. Backend: INSERT INTO business_claims (status = 'pending')
7. Frontend: "⏳ Admin va vous contacter"
8. Admin va sur /admin/claims
9. Admin voit message, appelle le téléphone fourni
10. Admin demande preuve par email
11. User envoie facture récente
12. Admin clique "✓ Approuver" avec note: "Facture vérifiée"
13. Backend: UPDATE claim + business
14. User devient owner
```

## 🚀 Prochaines Étapes

### Avant mass import:

1. **Exécuter la migration:**
   ```sql
   -- Dans Supabase SQL Editor:
   -- Copier/coller le contenu de:
   -- supabase/migration_add_business_claims.sql
   ```

2. **Tester le système:**
   - Créer un compte test avec email domaine correspondant
   - Tester auto-approbation
   - Créer un compte test gmail
   - Tester vérification manuelle
   - Vérifier interface admin

3. **Importer les entreprises:**
   ```bash
   # Importer par batches de 100-200
   node scripts/import-req-businesses.js --offset=0 --limit=100
   node scripts/import-req-businesses.js --offset=100 --limit=100
   # etc.
   ```

4. **Enrichir avec Google Places:**
   ```bash
   # Ajouter téléphone, site web, ratings
   node scripts/enrich-req-data.js --limit=100
   ```

### Améliorations futures:

- [ ] Notifications email automatiques (approbation/refus)
- [ ] Vérification SMS (Twilio) pour les cas sans email domaine
- [ ] Dashboard propriétaire avec statistiques
- [ ] Historique des modifications de fiche
- [ ] Système de badges "Fiche vérifiée ✓"
- [ ] API Google My Business pour vérification automatique
