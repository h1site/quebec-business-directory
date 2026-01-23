# Quick Start - Archivage des Businesses (Version Simplifiée)

## TL;DR

Tu as **480k lignes** dans businesses, mais seulement **~50k** sont actives.

**Ce process va:**
- Archiver ~430k businesses inactives (sans website ET sans trafic)
- Garder ~50k actives (avec website OU avec trafic Google)
- Libérer 90% des ressources
- Permettre la création des index

---

## Scripts à Exécuter (dans l'ordre)

Ouvre **Supabase SQL Editor** et exécute chaque script **UN PAR UN**.

### Étape 1: Créer la table des slugs de trafic
```
Fichier: 01-create-traffic-slugs-table.sql
```
**Clique Run** - Résultat: Table créée

---

### Étape 2: Insérer les slugs de trafic
```
Fichier: 02-insert-traffic-slugs.sql
```
**Clique Run** - Résultat: 1463 slugs insérés

---

### Étape 3: Vérifier combien vont être archivées
```
Fichier: 03-count-to-archive.sql
```
**Clique Run** - Résultat attendu: ~430,000

---

### Étape 4: Créer la table d'archive
```
Fichier: 04-create-archive-table.sql
```
**Clique Run** - Résultat: Table créée

---

### Étape 5: Copier dans l'archive
```
Fichier: 05-copy-to-archive.sql
```
**Clique Run** et **ATTENDS** (2-5 minutes)

**Si timeout:** Utilise `05b-copy-batched.sql` et exécute batch par batch.

---

### Étape 6: Supprimer de businesses
```
Fichier: 06-delete-archived.sql
```
1. D'abord exécute la vérification (première requête)
2. Si "OK", décommente le DELETE et exécute

**Si timeout:** Utilise `06b-delete-batched.sql` et exécute batch par batch.

---

### Étape 7: Vérifier le résultat
```
Fichier: 07-verify-result.sql
```
**Clique Run** - Résultat attendu:
- remaining_businesses: ~50-60k
- with_website: ~48k+

---

### Étape 8: VACUUM pour libérer l'espace
```
Fichier: 08-vacuum.sql
```
**Clique Run** et **ATTENDS** (5-10 minutes)

---

### Étape 9: Créer les index
```
Fichier: 09-create-indexes.sql
```
**Clique Run** - Chaque index prend < 30 secondes maintenant!

---

## Vérification Post-Archivage

### Attends 10 minutes puis vérifie Supabase Dashboard:

**Avant:**
- CPU: 90-100%
- Memory: 90-100%
- Disk I/O: 90-100%

**Après:**
- CPU: 20-30%
- Memory: 30-40%
- Disk I/O: 10-20%

### Cache Hit Ratio
```sql
SELECT
    ROUND(sum(heap_blks_hit) / NULLIF((sum(heap_blks_hit) + sum(heap_blks_read)), 0) * 100, 2) AS cache_hit_ratio
FROM pg_statio_user_tables;
```

**Avant:** 73%
**Après:** >95%

---

## Rollback (si besoin)

```sql
-- Restaurer depuis l'archive
INSERT INTO businesses SELECT * FROM businesses_archive;

-- Supprimer l'archive et la table de slugs
DROP TABLE businesses_archive;
DROP TABLE traffic_slugs;
```

---

## Checklist

- [ ] Script 01 - Créer table traffic_slugs
- [ ] Script 02 - Insérer 1463 slugs
- [ ] Script 03 - Vérifier count (~430k)
- [ ] Script 04 - Créer businesses_archive
- [ ] Script 05 - Copier dans archive
- [ ] Script 06 - DELETE de businesses
- [ ] Script 07 - Vérifier résultat (~50k)
- [ ] Script 08 - VACUUM FULL
- [ ] Script 09 - Créer les index
- [ ] Vérifier métriques après 10 min

---

**Prêt? Lance le script 01 maintenant!**
