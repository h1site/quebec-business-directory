# Bot Visit Logging System

Ce système permet de logger et analyser toutes les visites des bots de moteurs de recherche (Googlebot, Bingbot) pour comprendre quelles pages sont indexables et pourquoi certaines ne le sont pas.

## Vue d'ensemble

Le système enregistre automatiquement dans Supabase toutes les requêtes provenant de Googlebot et Bingbot, incluant:

- ✅ Pages indexables (200 OK avec canonical, meta tags, schema.org)
- ❌ Pages non-indexables (404, 301 redirects, 500 errors)
- 🔀 Redirections 301 avec la raison (mauvaise catégorie, ville manquante)
- ⏱️ Temps de réponse pour chaque requête
- 📊 Détails complets sur le type de page, les slugs, etc.

## Installation

### 1. Créer la table dans Supabase

Exécutez le script SQL dans Supabase SQL Editor:

```bash
# Copiez le contenu de scripts/create-bot-logs-table.sql
# et exécutez-le dans Supabase SQL Editor
```

Le script crée:
- Table `bot_visit_logs` pour stocker tous les logs
- Indexes pour des requêtes rapides
- Views `bot_visit_stats` et `non_indexable_pages` pour analyses rapides

### 2. Le logging est automatique

Le code dans `api/seo.js` enregistre automatiquement chaque visite de bot. Aucune configuration supplémentaire nécessaire.

## Utilisation

### Voir les logs récents

```bash
node scripts/view-bot-logs.js recent 50
```

Affiche les 50 dernières visites de bots avec:
- Type de bot (GOOGLEBOT / BINGBOT)
- Status code (200, 301, 404, 500)
- Page indexable ou non
- Raison si non indexable
- Temps de réponse

### Voir les statistiques globales

```bash
node scripts/view-bot-logs.js stats
```

Affiche:
- Nombre de visites par type de bot
- Répartition indexable vs non-indexable
- Raisons de non-indexabilité

### Voir les redirections 301

```bash
node scripts/view-bot-logs.js redirects
```

Affiche:
- Nombre de redirections par raison (wrong_category, missing_city)
- Nombre d'entreprises uniques affectées

### Voir les erreurs 404

```bash
node scripts/view-bot-logs.js 404
```

Affiche:
- URLs qui génèrent des 404
- Nombre d'occurrences
- Quels bots ont rencontré l'erreur

### Voir les temps de réponse

```bash
node scripts/view-bot-logs.js response-times
```

Affiche les temps de réponse moyens par:
- Type de page (business, blog, category, etc.)
- Type de bot

### Voir tout

```bash
node scripts/view-bot-logs.js all
```

Affiche toutes les statistiques d'un coup.

## Requêtes SQL personnalisées

Utilisez le fichier `scripts/query-bot-logs.sql` qui contient 10 requêtes SQL prêtes à utiliser:

1. Dernières visites de bots
2. Visites par bot type et indexabilité
3. Pages non-indexables (vue pré-créée)
4. Statistiques par date (vue pré-créée)
5. Statistiques de redirections
6. Erreurs 404 par bot
7. Temps de réponse par page et bot
8. Pages sans canonical tag
9. Comparaison Googlebot vs Bingbot
10. Entreprises les plus visitées

## Structure des données

### Table `bot_visit_logs`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | BIGSERIAL | ID unique |
| `created_at` | TIMESTAMP | Date/heure de la visite |
| `bot_type` | VARCHAR(50) | 'googlebot', 'bingbot', 'other' |
| `user_agent` | TEXT | User agent complet |
| `url` | TEXT | URL complète avec query params |
| `path` | TEXT | Chemin sans query params |
| `query_params` | JSONB | Paramètres de query |
| `method` | VARCHAR(10) | HTTP method (GET) |
| `status_code` | INT | Code de statut HTTP |
| `indexable` | BOOLEAN | true si la page devrait être indexée |
| `indexable_reason` | TEXT | Si non-indexable: '404_not_found', '301_redirect', '500_error' |
| `page_type` | VARCHAR(50) | 'business', 'blog', 'category', 'city', etc. |
| `business_id` | BIGINT | ID de l'entreprise (si applicable) |
| `business_slug` | VARCHAR(255) | Slug de l'entreprise |
| `category_slug` | VARCHAR(255) | Slug de catégorie |
| `city_slug` | VARCHAR(255) | Slug de ville |
| `blog_slug` | VARCHAR(255) | Slug d'article de blog |
| `redirect_to` | TEXT | URL de redirection (si 301) |
| `redirect_reason` | TEXT | 'wrong_category', 'missing_city' |
| `has_canonical` | BOOLEAN | Présence de canonical tag |
| `canonical_url` | TEXT | URL canonical |
| `has_meta_tags` | BOOLEAN | Présence de meta tags SEO |
| `has_schema_org` | BOOLEAN | Présence de Schema.org |
| `response_time_ms` | INT | Temps de réponse en ms |

## Exemples d'analyse

### Trouver les pages avec mauvaises catégories

```sql
SELECT
  business_slug,
  redirect_reason,
  COUNT(*) as redirect_count
FROM bot_visit_logs
WHERE redirect_reason = 'wrong_category'
GROUP BY business_slug, redirect_reason
ORDER BY redirect_count DESC
LIMIT 50;
```

### Comparer performance Googlebot vs Bingbot

```sql
SELECT
  bot_type,
  AVG(response_time_ms) as avg_time,
  COUNT(*) as visits,
  SUM(CASE WHEN indexable THEN 1 ELSE 0 END) as indexable_count
FROM bot_visit_logs
GROUP BY bot_type;
```

### Trouver les articles de blog les plus visités

```sql
SELECT
  blog_slug,
  COUNT(*) as visits,
  COUNT(DISTINCT bot_type) as unique_bots
FROM bot_visit_logs
WHERE page_type = 'blog' AND indexable = true
GROUP BY blog_slug
ORDER BY visits DESC;
```

## Maintenance

### Nettoyer les vieux logs

Pour éviter que la table devienne trop grande, vous pouvez supprimer les logs de plus de 90 jours:

```sql
DELETE FROM bot_visit_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Créer un index partiel pour les erreurs

Si vous analysez souvent les erreurs:

```sql
CREATE INDEX idx_bot_logs_errors
ON bot_visit_logs(status_code, indexable_reason)
WHERE indexable = false;
```

## Monitoring en temps réel

Pour voir les logs en temps réel pendant que les bots crawlent le site:

```bash
# Terminal 1: Voir les logs en continu
watch -n 5 'node scripts/view-bot-logs.js recent 10'

# Terminal 2: Voir les stats en continu
watch -n 30 'node scripts/view-bot-logs.js stats'
```

## Alertes

Vous pouvez créer des alertes Supabase pour être notifié:

### Alerte sur trop d'erreurs 404

```sql
-- Si plus de 10 erreurs 404 dans la dernière heure
SELECT COUNT(*) as error_count
FROM bot_visit_logs
WHERE status_code = 404
  AND created_at > NOW() - INTERVAL '1 hour'
HAVING COUNT(*) > 10;
```

### Alerte sur temps de réponse lent

```sql
-- Si temps de réponse moyen > 2000ms
SELECT AVG(response_time_ms) as avg_time
FROM bot_visit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND response_time_ms IS NOT NULL
HAVING AVG(response_time_ms) > 2000;
```

## Intégration avec Vercel Logs

Les logs sont également visibles dans Vercel:

```bash
vercel logs --follow
```

Filtrez par bot:

```bash
vercel logs --follow | grep GOOGLEBOT
vercel logs --follow | grep BINGBOT
```

## Troubleshooting

### La table n'existe pas

Vérifiez que vous avez bien exécuté `scripts/create-bot-logs-table.sql` dans Supabase.

### Pas de logs enregistrés

1. Vérifiez que les bots visitent votre site (vérifiez Vercel logs)
2. Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont configurés
3. Vérifiez les permissions RLS dans Supabase (désactivez RLS pour cette table si besoin)

### Logs trop volumineux

Ajoutez une stratégie de rétention automatique:

```sql
-- Créer une fonction pour nettoyer automatiquement
CREATE OR REPLACE FUNCTION cleanup_old_bot_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM bot_visit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Créer un job cron (si disponible sur votre plan Supabase)
-- Ou appelez manuellement chaque mois
```

## Support

Pour toute question ou problème:
1. Vérifiez les logs Vercel: `vercel logs`
2. Vérifiez les logs Supabase dans le dashboard
3. Testez manuellement avec: `curl -A "Googlebot" https://registreduquebec.com/blogue/test`
