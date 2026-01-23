# Guide d'Archivage des Businesses

## Contexte

Actuellement:
- **480,317 lignes** dans businesses
- **~48k enrichies** avec ai_enriched_at
- **~432k non-enrichies** qui consomment des ressources inutilement

## Stratégie d'Archivage

**Garder actif (dans businesses):**
- ✅ Businesses avec `website` (même si pas enrichies)
- ✅ Businesses dans le traffic report (1,463 slugs)

**Archiver (dans businesses_archive):**
- ❌ Businesses SANS website ET PAS dans le traffic report

## Fichiers Générés

1. **traffic-slugs-from-csv.json**
   - 1,463 slugs extraits du CSV de trafic
   - Ces pages reçoivent du trafic Google → doivent rester actives

2. **archive-businesses.sql**
   - Script SQL complet en 7 étapes
   - Sécurisé: archive d'abord, supprime ensuite

## Processus d'Archivage (15-20 minutes)

### Étape 1: Vérifier combien vont être archivées

Ouvre **Supabase SQL Editor** et exécute l'ÉTAPE 1 du fichier `archive-businesses.sql`:

```sql
SELECT
  COUNT(*) as total_to_archive,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NOT NULL) as enriched_to_archive,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NULL) as not_enriched_to_archive
FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (...);
```

**Attendu:** ~400-430k businesses à archiver

---

### Étape 2: Créer la table d'archive

Exécute l'ÉTAPE 2:

```sql
CREATE TABLE IF NOT EXISTS businesses_archive (
  LIKE businesses INCLUDING ALL
);
```

**Résultat:** Table businesses_archive créée

---

### Étape 3: Copier dans l'archive

Exécute l'ÉTAPE 3 (peut prendre 2-5 minutes):

```sql
INSERT INTO businesses_archive
SELECT * FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (...);
```

**Résultat:** ~400k lignes copiées dans businesses_archive

---

### Étape 4: Vérifier l'archive

Exécute l'ÉTAPE 4:

```sql
SELECT COUNT(*) as archived_count FROM businesses_archive;
```

**Attendu:** Doit matcher le nombre de l'étape 1

---

### Étape 5: Supprimer de la table principale

⚠️ **ATTENTION:** Seulement après avoir vérifié l'étape 4!

Décommente et exécute l'ÉTAPE 5:

```sql
DELETE FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (...);
```

**Résultat:** ~400k lignes supprimées

---

### Étape 6: Vérifier le résultat

Exécute l'ÉTAPE 6:

```sql
SELECT
  COUNT(*) as remaining_businesses,
  COUNT(*) FILTER (WHERE website IS NOT NULL AND website != '') as with_website,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NOT NULL) as enriched
FROM businesses;
```

**Attendu:**
- remaining_businesses: ~50-60k
- with_website: ~48k+
- enriched: ~48k

---

### Étape 7: VACUUM pour libérer l'espace

Exécute l'ÉTAPE 7 (peut prendre 5-10 minutes):

```sql
VACUUM FULL ANALYZE businesses;
```

**Résultat:** Espace disque libéré, statistiques mises à jour

---

## Après l'Archivage: Créer les Index

Une fois que businesses ne contient plus que ~50k lignes, les index vont se créer RAPIDEMENT:

```sql
-- Index critiques (chacun prend < 30 secondes)
CREATE INDEX idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX idx_businesses_website ON businesses(website) WHERE website IS NOT NULL;
CREATE INDEX idx_businesses_main_category_slug ON businesses(main_category_slug) WHERE main_category_slug IS NOT NULL;

-- Analyser les tables
ANALYZE businesses;
```

---

## Résultats Attendus

### Avant Archivage:
- 480k lignes
- Cache hit ratio: 73%
- CPU/Memory/Disk: 90-100%
- Queries timeout

### Après Archivage + Index:
- 50k lignes (90% de réduction!)
- Cache hit ratio: >95%
- CPU/Memory/Disk: 20-30%
- Queries rapides (< 50ms)

---

## Restaurer une Business Archivée (si besoin)

Si tu dois restaurer une business archivée:

```sql
-- Restaurer par slug
INSERT INTO businesses
SELECT * FROM businesses_archive
WHERE slug = 'nom-entreprise';

-- Supprimer de l'archive
DELETE FROM businesses_archive WHERE slug = 'nom-entreprise';
```

---

## Monitoring Post-Archivage

Après 1 heure, vérifie:

1. **Métriques Supabase:**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Cache hit ratio

2. **Query Performance:**
   ```sql
   SELECT
       calls,
       total_exec_time / 1000 as total_seconds,
       mean_exec_time / 1000 as avg_seconds
   FROM pg_stat_statements
   ORDER BY total_exec_time DESC
   LIMIT 5;
   ```

3. **Index Usage:**
   ```sql
   SELECT
       indexname,
       idx_scan,
       idx_tup_read,
       idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   AND tablename = 'businesses'
   ORDER BY idx_scan DESC;
   ```

---

## Backup Before Archiving

Si tu veux être extra-prudent, fais un backup manuel avant:

1. Supabase Dashboard → Database → Backups
2. Create backup manually
3. Attends confirmation
4. Puis lance l'archivage

---

## Questions Fréquentes

**Q: Et si je veux réactiver toutes les non-enrichies plus tard?**
A: Simple:
```sql
INSERT INTO businesses SELECT * FROM businesses_archive;
```

**Q: L'archive consomme aussi des ressources?**
A: Oui, mais elle n'est pas accédée par les queries de ton app, donc impact minimal.

**Q: Puis-je supprimer l'archive après?**
A: Oui, une fois sûr: `DROP TABLE businesses_archive;`

**Q: Ça va casser mon site?**
A: Non! Tu gardes toutes les businesses avec website + celles avec du trafic.

---

## Checklist Finale

- [ ] Exécuter étape 1 (vérifier count)
- [ ] Exécuter étape 2 (créer archive)
- [ ] Exécuter étape 3 (copier données)
- [ ] Exécuter étape 4 (vérifier archive)
- [ ] Exécuter étape 5 (delete) ⚠️
- [ ] Exécuter étape 6 (vérifier résultat)
- [ ] Exécuter étape 7 (VACUUM)
- [ ] Créer les index
- [ ] Vérifier les métriques après 1h
- [ ] Tester le site (recherche, pages entreprises)

---

**Prêt à commencer? Lance l'ÉTAPE 1 dans Supabase SQL Editor!** 🚀
