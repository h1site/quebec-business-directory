#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lire le CSV de trafic
const csvPath = path.join(__dirname, '../../registreduquebec.com_PageTrafficReport_2026-01-21 (1).csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parser le CSV
const lines = csvContent.split('\n').slice(1); // Skip header
const slugs = new Set();

for (const line of lines) {
  if (!line.trim()) continue;

  // Extraire l'URL (première colonne)
  const match = line.match(/^"([^"]+)"/);
  if (!match) continue;

  const url = match[1];

  // Extraire le slug selon les patterns
  let slug = null;

  // Pattern 1: /entreprise/{slug}
  const pattern1 = url.match(/\/entreprise\/([^\/\?]+)/);
  if (pattern1) {
    slug = pattern1[1];
  }

  // Pattern 2: /{category}/{city}/{slug}
  const pattern2 = url.match(/\/[^\/]+\/[^\/]+\/([^\/\?]+)$/);
  if (pattern2 && !pattern1) {
    slug = pattern2[1];
  }

  if (slug) {
    slugs.add(slug);
  }
}

console.log(`Extracted ${slugs.size} unique slugs from traffic report`);

// Générer le fichier de slugs JSON
const outputJson = path.join(__dirname, 'traffic-slugs-from-csv.json');
fs.writeFileSync(outputJson, JSON.stringify({
  generated_at: new Date().toISOString(),
  source: 'registreduquebec.com_PageTrafficReport_2026-01-21 (1).csv',
  count: slugs.size,
  slugs: Array.from(slugs).sort()
}, null, 2));

console.log(`✓ Saved to ${outputJson}`);

// Générer le script SQL
const sqlContent = `-- ============================================================================
-- ARCHIVAGE DES BUSINESSES SANS TRAFIC ET SANS WEBSITE
-- ============================================================================
-- Généré automatiquement le ${new Date().toISOString()}
-- Source: registreduquebec.com_PageTrafficReport_2026-01-21 (1).csv
-- Slugs de trafic: ${slugs.size}
-- ============================================================================

-- ÉTAPE 1: Vérifier combien de businesses vont être archivées
-- ============================================================================

SELECT
  COUNT(*) as total_to_archive,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NOT NULL) as enriched_to_archive,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NULL) as not_enriched_to_archive
FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (
  ${Array.from(slugs).map(s => `'${s.replace(/'/g, "''")}'`).join(',\n  ')}
);

-- ÉTAPE 2: Créer la table d'archive (si elle n'existe pas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS businesses_archive (
  LIKE businesses INCLUDING ALL
);

-- ÉTAPE 3: Copier dans l'archive
-- ============================================================================

INSERT INTO businesses_archive
SELECT * FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (
  ${Array.from(slugs).map(s => `'${s.replace(/'/g, "''")}'`).join(',\n  ')}
);

-- ÉTAPE 4: Vérifier que l'archive a bien été créée
-- ============================================================================

SELECT COUNT(*) as archived_count FROM businesses_archive;

-- ÉTAPE 5: Supprimer de la table principale
-- ============================================================================
-- ATTENTION: Décommenter seulement après avoir vérifié l'étape 4!
-- ============================================================================

/*
DELETE FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (
  ${Array.from(slugs).map(s => `'${s.replace(/'/g, "''")}'`).join(',\n  ')}
);
*/

-- ÉTAPE 6: Vérifier le résultat
-- ============================================================================

/*
SELECT
  COUNT(*) as remaining_businesses,
  COUNT(*) FILTER (WHERE website IS NOT NULL AND website != '') as with_website,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NOT NULL) as enriched
FROM businesses;
*/

-- ÉTAPE 7: VACUUM pour libérer l'espace (après DELETE)
-- ============================================================================

/*
VACUUM FULL ANALYZE businesses;
*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
`;

const sqlPath = path.join(__dirname, 'archive-businesses.sql');
fs.writeFileSync(sqlPath, sqlContent);

console.log(`✓ Saved SQL script to ${sqlPath}`);
console.log('');
console.log('Next steps:');
console.log('1. Review the SQL script');
console.log('2. Execute steps 1-4 in Supabase SQL Editor');
console.log('3. Verify the archive was created correctly');
console.log('4. Uncomment step 5 to actually delete');
console.log('5. Run step 6 to verify');
console.log('6. Run step 7 to free disk space');
