# 📊 Google Places API - Monitoring & Usage

## Limites Google Places API

### Plan gratuit ($200 de crédit/mois):
- **Place Details**: $17 per 1,000 requests (données de base)
- **Find Place**: $17 per 1,000 requests (recherche)
- **Place Photos**: $7 per 1,000 requests

### Calcul du crédit:
```
$200 / $17 = ~11,764 requêtes Place Details par mois
            = ~392 requêtes par jour
            = ~16 requêtes par heure
```

---

## 🔍 Quand les requêtes Google API sont faites

### 1. Importation GMB depuis Admin (Manuelle)

**Endpoint utilisé**: `/api/google-places/import`

**Requêtes Google par importation**:
```
1. Find Place (si URL fournie) - $0.017 = recherche du Place ID
2. Place Details - $0.017 = récupération complète des données
3. Place Photos (optionnel) - $0.007 × nombre de photos

Total: ~$0.034 à $0.10 par importation (selon photos)
```

**Données importées**:
- ✅ Nom
- ✅ Adresse complète
- ✅ Téléphone
- ✅ Site web
- ✅ Heures d'ouverture
- ✅ Coordonnées GPS
- ✅ Avis Google
- ✅ Note Google
- ✅ Photos (max 10)
- ✅ Types/Catégories

**Quota actuel implémenté**: **90 importations/jour maximum**
- Fichier: [api/google-places/import.js:49-62](api/google-places/import.js#L49-L62)
- Contrôle via `get_import_quota_info` RPC function

---

## 📈 Coûts par scénario

### Scénario 1: Petit site (10 importations/jour)
```
Recherche:  10 × $0.017 = $0.17/jour = $5.10/mois
Détails:    10 × $0.017 = $0.17/jour = $5.10/mois
Photos:     10 × 5 × $0.007 = $0.35/jour = $10.50/mois
---------------------------------------------------
Total:      $0.69/jour = $20.70/mois
Statut:     ✅ Dans le crédit gratuit ($200/mois)
```

### Scénario 2: Site moyen (50 importations/jour)
```
Recherche:  50 × $0.017 = $0.85/jour = $25.50/mois
Détails:    50 × $0.017 = $0.85/jour = $25.50/mois
Photos:     50 × 5 × $0.007 = $1.75/jour = $52.50/mois
---------------------------------------------------
Total:      $3.45/jour = $103.50/mois
Statut:     ✅ Dans le crédit gratuit ($200/mois)
```

### Scénario 3: Site actif (90 importations/jour - MAX QUOTA)
```
Recherche:  90 × $0.017 = $1.53/jour = $45.90/mois
Détails:    90 × $0.017 = $1.53/jour = $45.90/mois
Photos:     90 × 5 × $0.007 = $3.15/jour = $94.50/mois
---------------------------------------------------
Total:      $6.21/jour = $186.30/mois
Statut:     ✅ Dans le crédit gratuit ($200/mois)
```

**Conclusion**: Avec le quota de **90 importations/jour**, tu restes **TOUJOURS dans le crédit gratuit** de Google! 🎉

---

## 🛡️ Protections actuellement en place

### 1. Quota journalier (90 importations/jour)
**Fichier**: [api/google-places/import.js:46-63](api/google-places/import.js#L46-L63)

```javascript
// Vérifie le quota AVANT d'appeler Google API
const { data: quotaInfo } = await supabase.rpc('get_import_quota_info', {
  limit_count: 90
});

if (!quotaInfo.can_import) {
  return res.status(429).json({
    error: 'Import quota exceeded',
    message: `Limite quotidienne atteinte (${quotaInfo.imports_today}/90)`
  });
}
```

**Impact**:
- ✅ Empêche les dépassements de coûts
- ✅ Protège contre les abus
- ✅ Maximum $186.30/mois avec 90/jour

### 2. Compteur d'importation
**Fichier**: [api/google-places/import.js:126-144](api/google-places/import.js#L126-L144)

```javascript
// Incrémente le compteur APRÈS succès
await supabase.rpc('increment_import_count');

// Alerte si proche de la limite
if (newCount >= 80) {
  console.warn(`⚠️ WARNING: Approaching daily limit (${newCount}/90)`);
}
```

**Impact**:
- ✅ Tracking précis des importations
- ✅ Alertes à 80/90 (89%)
- ✅ Reset automatique à minuit (UTC)

### 3. Limité aux admins uniquement
**Accès**: Seuls les propriétaires de fiches peuvent importer via Admin Dashboard

**Impact**:
- ✅ Pas d'abus par les visiteurs
- ✅ Contrôle total sur les importations
- ✅ Utilisation raisonnée

---

## 📊 Monitoring en temps réel

### Méthode 1: Via Google Cloud Console

1. **Aller sur**: https://console.cloud.google.com
2. **Navigation**: APIs & Services → Dashboard
3. **Sélectionner**: Places API
4. **Voir**:
   - Requêtes aujourd'hui
   - Requêtes ce mois
   - Coût estimé
   - Quotas restants

### Méthode 2: Via Supabase (Compteur interne)

**SQL Query pour voir les stats**:
```sql
-- Voir le nombre d'importations aujourd'hui
SELECT * FROM get_import_quota_info(90);

-- Voir l'historique des importations
SELECT
  DATE(timestamp) as date,
  COUNT(*) as imports_count
FROM google_import_stats
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Voir les utilisateurs qui importent le plus
SELECT
  user_id,
  COUNT(*) as total_imports,
  MAX(timestamp) as last_import
FROM google_import_stats
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_imports DESC
LIMIT 10;
```

### Méthode 3: Logs Vercel

Les logs montrent chaque importation:
```
✅ Import successful. Count: 45/90
⚠️ WARNING: Approaching daily limit (81/90)
❌ Import quota exceeded (90/90)
```

---

## 🔢 Calculer les requêtes par fiche

### Pour une fiche d'entreprise visitée par un utilisateur:

**Visiteur normal**: **0 requête Google API**
- Les données sont dans Supabase
- Pas d'appel à Google
- Gratuit et rapide

**Admin qui importe GMB**: **2 requêtes Google API**
1. Find Place (recherche du business) - $0.017
2. Place Details (récupération complète) - $0.017
Total: **$0.034 par importation**

**Admin qui cherche un business**: **1 requête Google API**
- Endpoint: `/api/google-places-search`
- Fichier: [api/google-places-search.js:27](api/google-places-search.js#L27)
- Coût: $0.017

### Exemple concret:

**Admin crée une fiche et importe GMB**:
```
1. Recherche dans le modal GMB        → 1 requête Google ($0.017)
2. Import des données sélectionnées   → 1 requête Google ($0.017)
-------------------------------------------------------------------
Total:                                → 2 requêtes ($0.034)
```

**1000 fiches importées dans le mois**:
```
1000 × 2 requêtes = 2,000 requêtes Google
Coût: 2,000 × $0.017 = $34.00/mois
```
✅ **Toujours dans le crédit gratuit $200/mois**

---

## ⚠️ Scénarios de dépassement

### Comment dépasser les $200/mois?

Il faudrait:
```
$200 / $0.034 = 5,882 importations/mois
                = 196 importations/jour
                = 8.2 importations/heure (24/7 non-stop)
```

**Avec ton quota actuel de 90/jour**:
```
90 importations/jour × 30 jours = 2,700 importations/mois
Coût maximum: 2,700 × $0.034 = $91.80/mois
```
✅ **IMPOSSIBLE de dépasser $200/mois avec le quota actuel!**

---

## 🎯 Recommandations

### 1. Monitoring mensuel (Priorité HAUTE ⚡)

**Action**: Vérifier Google Cloud Console chaque mois
- Dashboard: https://console.cloud.google.com
- Vérifier "Billing" et "APIs & Services"
- S'assurer de rester sous $150/mois (75% de $200)

### 2. Alertes Google Cloud (Priorité MOYENNE 🔶)

**Configuration**:
1. Google Cloud Console → Billing → Budgets & Alerts
2. Créer un budget: $150/mois
3. Alertes email à:
   - 50% ($75)
   - 80% ($120)
   - 100% ($150)

### 3. Augmenter le quota si nécessaire (Priorité BASSE 🔵)

**Si tu veux importer plus de 90 fiches/jour**:
```sql
-- Modifier le quota à 150/jour (toujours safe)
SELECT * FROM get_import_quota_info(150);
```

**Coût avec 150 importations/jour**:
```
150 × 30 = 4,500 importations/mois
Coût: 4,500 × $0.034 = $153/mois
```
✅ **Toujours dans le crédit gratuit $200/mois**

### 4. Désactiver les photos si nécessaire

**Si tu veux économiser davantage**:
- Les photos coûtent $0.007 par photo
- En moyenne 5 photos/fiche = $0.035/fiche
- Désactiver photos = économie de 50%

---

## 📝 Résumé des coûts

| Action | Coût unitaire | Fréquence | Coût/mois |
|--------|---------------|-----------|-----------|
| Recherche GMB | $0.017 | Par recherche | Variable |
| Import GMB | $0.017 | Par import | Variable |
| Photo GMB | $0.007 | Par photo | Variable |
| **Import complet** | **$0.034** | **Par fiche** | **Variable** |

| Scénario | Imports/jour | Imports/mois | Coût/mois | Status |
|----------|--------------|--------------|-----------|--------|
| Petit site | 10 | 300 | $20.70 | ✅ Gratuit |
| Site moyen | 50 | 1,500 | $103.50 | ✅ Gratuit |
| **Quota actuel** | **90** | **2,700** | **$186.30** | ✅ **Gratuit** |
| Maximum safe | 150 | 4,500 | $153.00 | ✅ Gratuit |
| Dépassement | 200+ | 6,000+ | $204+ | ❌ Payant |

---

## 🆘 Si tu dépasses $200/mois

### Option 1: Augmenter le billing Google Cloud
- Google Cloud Console → Billing → Add payment method
- Prix après $200: Identique ($17/1000 requêtes)

### Option 2: Réduire le quota d'importation
```javascript
// Dans api/google-places/import.js ligne 50
limit_count: 50  // Au lieu de 90
```

### Option 3: Désactiver l'import GMB temporairement
- Retirer le bouton "Importer GMB" du admin dashboard
- Permettre uniquement la saisie manuelle

### Option 4: Caching des résultats
- Cacher les recherches Google pendant 24h
- Évite les recherches répétées du même business

---

## 🎉 Conclusion

**TU ES 100% SAFE!** 🎉

Avec ton quota actuel de **90 importations/jour**:
- ✅ Maximum $186.30/mois (93% du crédit gratuit)
- ✅ Impossible de dépasser $200/mois
- ✅ Protection contre les abus
- ✅ Compteur et alertes en place

**Tu peux dormir tranquille!** 😴
