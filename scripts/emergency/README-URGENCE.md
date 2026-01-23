# 🚨 GUIDE D'URGENCE - CPU/Memory/Disk à 100%

## Situation Critique

Ton projet Supabase est à 100% sur:
- ✅ CPU
- ✅ Memory
- ✅ Disk I/O

**Cela peut causer:**
- Timeout sur toutes les queries
- Site web inaccessible
- Impossibilité de créer des index
- Supabase peut suspendre le projet

---

## ACTIONS IMMÉDIATES (5 minutes)

### Étape 1: Diagnostic (2 min)

Dans **Supabase SQL Editor**, copie-colle:

```sql
-- Voir les requêtes actives
SELECT
    pid,
    NOW() - query_start as duration,
    state,
    LEFT(query, 100) as query
FROM pg_stat_activity
WHERE state != 'idle'
AND pid != pg_backend_pid()
ORDER BY query_start;
```

**Cherche:**
- ❌ Des requêtes qui tournent depuis des heures
- ❌ Des milliers de connexions
- ❌ Des requêtes en état "active" depuis longtemps

---

### Étape 2: Tuer les Requêtes Bloquées (1 min)

Si tu vois des requêtes qui tournent depuis > 1 minute:

```sql
-- Voir quelles requêtes vont être tuées
SELECT pid, NOW() - query_start as duration, LEFT(query, 80)
FROM pg_stat_activity
WHERE state != 'idle'
AND NOW() - query_start > interval '1 minute'
AND pid != pg_backend_pid();

-- TUER ces requêtes
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state != 'idle'
AND NOW() - query_start > interval '1 minute'
AND pid != pg_backend_pid();
```

---

### Étape 3: VACUUM d'Urgence (2 min)

```sql
VACUUM ANALYZE businesses;
VACUUM ANALYZE reviews;
```

Cela va:
- Libérer l'espace disque
- Mettre à jour les statistiques
- Réduire le Disk I/O

---

## ACTIONS RAPIDES DANS LE CODE

### 1. Désactiver Temporairement les Features Gourmandes

Dans ton `.env.local`, ajoute:

```env
NEXT_PUBLIC_DISABLE_ANALYTICS=true
NEXT_PUBLIC_DISABLE_SEARCH=true
```

### 2. Réduire les Limites de Queries

Édite rapidement les fichiers critiques:

**`src/lib/search.ts`** - Réduis les limites:
```typescript
.limit(10) // Au lieu de 20
```

**`src/app/(fr)/plan-du-site/page.tsx`** - Réduis encore:
```typescript
.limit(100) // Au lieu de 500
```

### 3. Redéploie Immédiatement

```bash
git add .
git commit -m "emergency: Reduce query limits to lower DB load"
git push
```

Vercel va redéployer en 2-3 minutes.

---

## VÉRIFIER SUPABASE DASHBOARD

### Database Health

1. Va dans **Supabase Dashboard**
2. Clique **Database** (dans la sidebar)
3. Regarde **Database Health**

**Vérifie:**
- Connection Pooling: Combien de connexions actives?
- Disk Usage: Quel % utilisé?
- RAM Usage: Quel % utilisé?

### Query Performance

1. Va dans **Database** → **Query Performance**
2. Regarde les requêtes les plus lentes
3. Note lesquelles consomment le plus de temps

---

## SOLUTIONS SELON LE DIAGNOSTIC

### Si: Beaucoup de Connexions Actives (> 100)

**Problème:** Trop de connexions simultanées

**Solution:**
```typescript
// Dans createServiceClient(), ajoute:
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-connection-timeout': '5000'
    }
  }
})
```

### Si: VACUUM n'a pas tourné depuis longtemps

**Problème:** Accumulation de dead tuples

**Solution:**
```sql
-- Force un VACUUM complet (prend 10-20 min, mais libère BEAUCOUP d'espace)
VACUUM FULL ANALYZE businesses;
```

⚠️ **ATTENTION:** Cela va verrouiller la table pendant 10-20 min!

### Si: Requêtes SELECT * partout

**Problème:** Trop de données transférées

**Solution:** Dans tous tes fichiers, remplace:
```typescript
// Avant
.select('*')

// Après
.select('id, name, slug, city, website, phone')
```

### Si: Index manquants

**Problème:** Full table scans sur 48k lignes

**Solution:** Essaie de créer AU MOINS ces 2 index:

```sql
-- Index le plus critique
CREATE INDEX idx_businesses_slug ON businesses(slug);

-- Index reviews
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

Si timeout, contacte le support Supabase pour upgrade temporaire.

---

## SOLUTIONS LONG TERME

### Option 1: Upgrade Supabase (Recommandé)

**Free Tier** → **Pro Tier ($25/mois)**

Avantages:
- 8 GB RAM (vs 500 MB)
- Pas de pause automatique
- Meilleure performance CPU
- Les index vont se créer sans timeout

### Option 2: Migrer vers Autre Provider

Si budget limité:
- Railway.app (PostgreSQL managé, $5/mois)
- Neon.tech (Serverless Postgres, gratuit jusqu'à 3 GB)
- DigitalOcean Managed Databases ($15/mois)

### Option 3: Optimiser Agressivement

- Implémenter un cache Redis
- Paginer TOUTES les requêtes
- Limiter les requêtes à 5-10 lignes max
- Désactiver les features non-essentielles

---

## MONITORING CONTINU

### Créer une Alerte

Dans Supabase Dashboard → **Project Settings** → **Integrations**

Configure des alertes pour:
- CPU > 80%
- Disk > 80%
- Connexions > 50

### Script de Monitoring

Exécute ce script toutes les 5 minutes:

```sql
SELECT
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state != 'idle') as active_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL) as waiting_queries,
    pg_size_pretty(pg_database_size('postgres')) as db_size;
```

---

## CHECKLIST D'URGENCE

- [ ] Exécuter diagnostic complet
- [ ] Tuer requêtes > 1 minute
- [ ] VACUUM ANALYZE businesses
- [ ] VACUUM ANALYZE reviews
- [ ] Réduire limites dans le code
- [ ] Redéployer
- [ ] Vérifier métriques après 5 min
- [ ] Si toujours critique → Upgrade Supabase
- [ ] Créer au moins 2 index si possible
- [ ] Monitorer les 24h suivantes

---

## CONTACT SUPPORT SUPABASE

Si rien ne marche:

1. Va sur https://supabase.com/dashboard/support
2. Explique la situation:
   ```
   My project is at 100% CPU/Memory/Disk.
   I cannot create indexes due to timeouts.
   Can you temporarily increase limits or help create indexes?
   Project ref: tiaofyawimkckjgxdnbd
   ```

Ils peuvent:
- Créer les index pour toi
- Augmenter temporairement les limites
- Diagnostiquer le problème exact

---

## APRÈS LA CRISE

Une fois stabilisé:

1. ✅ Créer tous les index manquants
2. ✅ Implémenter caching côté app
3. ✅ Optimiser toutes les queries
4. ✅ Considérer upgrade Pro
5. ✅ Setup monitoring permanent

---

**COMMENCE PAR ÉTAPE 1 DU DIAGNOSTIC MAINTENANT!** 🚨
