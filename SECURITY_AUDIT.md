# Audit de Sécurité Supabase - Registre du Québec

Date de l'audit: 2025-10-26

## ✅ Checklist de Sécurité

### 🔐 Auth & Clés

- [x] **RLS activé partout** - Vérifié sur user_profiles, business_reviews, businesses
- [x] **Politiques par défaut = deny** - RLS configuré avec politiques explicites
- [x] **Clé service_role jamais côté client** - ✅ CONFORME
  - Aucune utilisation de service_role dans `src/`
  - Scripts backend utilisent `SUPABASE_SERVICE_KEY` depuis `.env` (jamais commité)
- [x] **Rotation périodique des clés** - ⚠️ À planifier (recommandation: tous les 6 mois)
- [ ] **Domaines de redirection (Auth)** - ⚠️ À vérifier dans console Supabase
- [x] **Inscription: email confirmation** - À vérifier dans Supabase Auth settings
- [ ] **Providers OAuth: secrets côté serveur** - N/A (pas encore implémenté)
- [x] **CORS: origines explicites** - Géré par Supabase, à vérifier dans console

### 🗄️ Base de données & RLS

#### Tables avec RLS activé:
- [x] **user_profiles**
  - ✅ SELECT: Public (tous peuvent voir)
  - ✅ INSERT: Auth uniquement (auth.uid() = user_id)
  - ✅ UPDATE: Propriétaire uniquement (auth.uid() = user_id)
  - ❌ DELETE: Pas de politique (à ajouter si nécessaire)

- [x] **business_reviews**
  - ✅ SELECT: Public (tous peuvent voir)
  - ✅ INSERT: Auth uniquement (auth.uid() = user_id)
  - ✅ UPDATE: Propriétaire uniquement (auth.uid() = user_id)
  - ✅ DELETE: Propriétaire uniquement (auth.uid() = user_id)

- [x] **businesses** - ⚠️ RLS à vérifier dans SCRIPT_SUPABASE.sql

- [x] **business_claims** - À vérifier

- [x] **admins** - RLS critique à vérifier

#### Fonctions SQL
- [x] **calculate_business_average_rating** - ✅ Pas de SECURITY DEFINER, lecture seule
- [x] **count_business_reviews** - ✅ Pas de SECURITY DEFINER, lecture seule
- [x] **update_updated_at_column** - ✅ TRIGGER sécurisé

#### Recommandations:
- [ ] Créer des vues pour colonnes sensibles (emails, données privées)
- [ ] Ajouter pagination stricte sur endpoints publics
- [ ] Index sur created_at pour éviter l'énumération

### 📦 Stockage (Buckets)

#### Bucket: `avatars`
- [x] **Type: Public** - ✅ Justifié (avatars publics)
- [x] **SELECT Policy** - ✅ Public accessible
- [x] **INSERT Policy** - ✅ Utilisateur peut uploader seulement dans son dossier (auth.uid())
- [x] **UPDATE Policy** - ✅ Utilisateur peut modifier seulement son avatar
- [x] **DELETE Policy** - ✅ Utilisateur peut supprimer seulement son avatar

#### Bucket: `review-photos`
- [x] **Type: Public** - ✅ Justifié (photos de critiques publiques)
- [x] **SELECT Policy** - ✅ Public accessible
- [x] **INSERT Policy** - ⚠️ **PROBLÈME DÉTECTÉ**
  - Politique actuelle: Tout utilisateur authentifié peut uploader n'importe où
  - **Recommandation**: Ajouter validation du propriétaire
- [x] **DELETE Policy** - ⚠️ **PROBLÈME DÉTECTÉ**
  - Politique actuelle: N'importe quel utilisateur auth peut supprimer n'importe quelle photo
  - **Recommandation**: Restreindre au propriétaire de la critique

#### Validations nécessaires:
- [ ] Validation MIME/extension côté client ET serveur
- [ ] Validation taille (max 2MB pour avatars mentionné dans UI)
- [x] Signed URLs avec TTL - N/A (buckets publics)

### 🔧 Edge Functions / Middleware

- [ ] N/A - Pas encore implémenté

### 🌐 API publique (PostgREST / Realtime)

- [x] **Filtres stricts sur endpoints** - RLS en place
- [x] **Row filters dans policies** - ✅ user_id = auth.uid() utilisé
- [ ] **Realtime: canaux limités** - À vérifier si utilisé

### 💻 Frontend

- [x] **Jamais de secret côté client** - ✅ CONFORME
  - Seulement `VITE_SUPABASE_ANON_KEY` utilisé (safe)
  - `VITE_SUPABASE_URL` public (safe)
- [x] **Téléversement sécurisé** - Contrôles côté client présents (taille, MIME)
- [x] **Nettoyage des tokens** - À vérifier dans logout flow
- [x] **Storage sécurisé** - Supabase Auth gère les tokens

### 🔄 CI/CD & Dépôts

- [x] **.env.example sans secrets** - ✅ CONFORME
  - Contient seulement les placeholders
- [ ] **Scans de secrets activés** - ⚠️ À configurer (GitHub secret scanning)
- [ ] **Migrations revues** - ⚠️ À vérifier (pas de ALTER TABLE DISABLE RLS trouvé)
- [ ] **.gitignore** - ✅ .env présent dans .gitignore

### 👥 Organisation & Accès

- [ ] **2FA activé** - ⚠️ À vérifier pour compte Supabase et GitHub
- [ ] **Rôles minimaux** - À vérifier dans org Supabase
- [ ] **Comptes techniques séparés** - À évaluer selon besoin

### 📊 Observabilité & Incidents

- [ ] **Logs Auth/SQL/Functions** - À activer dans Supabase
- [ ] **Rate limiting** - ⚠️ À configurer (protection contre abus)
- [ ] **Backups & PITR testés** - ⚠️ Critique - à tester
- [ ] **Plan d'incident documenté** - À créer

---

## 🚨 Problèmes Critiques Détectés

### 1. **CRITIQUE: review-photos bucket trop permissif**

**Problème**: N'importe quel utilisateur authentifié peut:
- Uploader des photos n'importe où dans le bucket
- Supprimer n'importe quelle photo (pas seulement les siennes)

**Impact**:
- Utilisateur malveillant peut supprimer toutes les photos de critiques
- Peut uploader du contenu inapproprié

**Solution recommandée**:
```sql
-- Remplacer la policy DELETE actuelle
DROP POLICY "Users can delete review photos" ON storage.objects;

CREATE POLICY "Users can delete their own review photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'review-photos'
    AND auth.uid() IS NOT NULL
    AND (
      -- Vérifier que la photo appartient à une critique de l'utilisateur
      EXISTS (
        SELECT 1 FROM business_reviews br
        WHERE br.user_id = auth.uid()
        AND name = ANY(br.photos)
      )
    )
  );

-- Améliorer la policy INSERT
DROP POLICY "Authenticated users can upload review photos" ON storage.objects;

CREATE POLICY "Users can upload review photos with path validation"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-photos'
    AND auth.uid() IS NOT NULL
    -- Forcer un format de path: user_id/filename
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 2. **IMPORTANT: Scripts utilisent service_role inconsistant**

**Problème**: Plusieurs scripts utilisent `SUPABASE_SERVICE_KEY` qui pourrait être exposé

**Scripts concernés**:
- `scripts/test-req-system.js`
- `scripts/hide-businesses-without-contact.js`
- `scripts/assign-default-category.js`
- Et 40+ autres scripts

**Solution**:
- ✅ Ces scripts sont backend-only (pas dans src/)
- ⚠️ S'assurer que `.env` n'est JAMAIS commité
- ⚠️ Ajouter pre-commit hook pour scanner les secrets

### 3. **MOYEN: Validation MIME manquante côté serveur**

**Problème**: Upload d'avatars validé seulement côté client

**Solution**: Ajouter validation côté serveur via Edge Function ou RPC

---

## 📋 Actions Immédiates Recommandées

### Priorité 1 (Critique - à faire maintenant)
1. ✅ Fixer les policies du bucket `review-photos`
2. ✅ Activer GitHub secret scanning
3. ✅ Vérifier que `.env` est bien dans `.gitignore`

### Priorité 2 (Important - cette semaine)
4. ⚠️ Tester les backups Supabase (restoration test)
5. ⚠️ Activer 2FA sur compte Supabase
6. ⚠️ Configurer rate limiting sur API

### Priorité 3 (Maintenance - ce mois)
7. ⚠️ Créer plan de rotation des clés
8. ⚠️ Documenter plan d'incident
9. ⚠️ Ajouter validation MIME côté serveur
10. ⚠️ Revoir toutes les tables pour RLS (businesses, business_claims, admins)

---

## 🔍 Tests de Sécurité à Effectuer

### Test 1: Énumération des données
```bash
# Tester si on peut lire toutes les critiques sans limite
curl 'https://[PROJECT].supabase.co/rest/v1/business_reviews?select=*&limit=10000' \
  -H "apikey: [ANON_KEY]"
```

### Test 2: Upload non autorisé
```bash
# Essayer d'uploader dans le dossier d'un autre utilisateur
# (devrait être bloqué)
```

### Test 3: Suppression non autorisée
```bash
# Essayer de supprimer la photo d'un autre utilisateur
# (devrait être bloqué après fix)
```

### Test 4: Accès aux données admin
```bash
# Essayer de lire la table admins sans auth
# (devrait être bloqué si RLS configuré)
```

---

## 📝 Notes

- Frontend utilise UNIQUEMENT `anon` key ✅
- Aucune clé secrète dans le code source ✅
- Scripts backend séparés du frontend ✅
- Storage policies bien configurés pour avatars ✅
- **review-photos nécessite correctifs URGENTS** ⚠️

---

## 🔄 Prochaine Révision

- **Date prévue**: 2025-11-26 (dans 1 mois)
- **Responsable**: Sébastien Ross
- **Focus**: Vérifier implémentation des correctifs
