import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixCategorySlug() {
  console.log('🔧 Mise à jour de main_category_slug pour fixer les URLs...\n');
  console.log('='.repeat(80));

  // 1. Compter combien d'entreprises ont main_category_id mais pas main_category_slug
  console.log('\n1️⃣ Analyse de la situation...\n');

  const { count: totalWithId } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  const { count: withSlug } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_slug', 'is', null);

  const needsUpdate = totalWithId - withSlug;

  console.log(`📊 Entreprises avec main_category_id:    ${totalWithId?.toLocaleString()}`);
  console.log(`✅ Avec main_category_slug déjà rempli:  ${withSlug?.toLocaleString()}`);
  console.log(`⚠️  BESOIN de mise à jour:               ${needsUpdate?.toLocaleString()}`);

  if (needsUpdate === 0) {
    console.log('\n✅ Aucune mise à jour nécessaire!');
    return;
  }

  // 2. Générer le SQL
  console.log('\n2️⃣ SQL pour mettre à jour main_category_slug:\n');
  console.log('='.repeat(80));

  const updateSQL = `
-- Mettre à jour main_category_slug pour toutes les entreprises
-- qui ont un main_category_id mais pas de main_category_slug

UPDATE businesses b
SET main_category_slug = mc.slug
FROM main_categories mc
WHERE b.main_category_id = mc.id
  AND (b.main_category_slug IS NULL OR b.main_category_slug = '');

-- Vérification
SELECT
  COUNT(*) FILTER (WHERE main_category_id IS NOT NULL) as with_id,
  COUNT(*) FILTER (WHERE main_category_slug IS NOT NULL) as with_slug,
  COUNT(*) FILTER (WHERE main_category_id IS NOT NULL AND main_category_slug IS NULL) as still_missing
FROM businesses;
`;

  console.log(updateSQL);
  console.log('='.repeat(80));

  // 3. Échantillon avant/après
  console.log('\n3️⃣ Échantillon de données avant la mise à jour:\n');

  const { data: beforeSample } = await supabase
    .from('businesses')
    .select('name, slug, city, main_category_id, main_category_slug')
    .not('main_category_id', 'is', null)
    .is('main_category_slug', null)
    .limit(5);

  if (beforeSample && beforeSample.length > 0) {
    for (const biz of beforeSample) {
      // Get category name
      const { data: cat } = await supabase
        .from('main_categories')
        .select('slug, label_fr')
        .eq('id', biz.main_category_id)
        .single();

      console.log(`📌 ${biz.name} (${biz.city || 'N/A'})`);
      console.log(`   Slug entreprise: ${biz.slug}`);
      console.log(`   main_category_id: ${biz.main_category_id}`);
      console.log(`   main_category_slug: ${biz.main_category_slug || 'NULL'} → DEVRAIT ÊTRE: ${cat?.slug || '?'}`);
      console.log(`   URL actuelle: /${biz.main_category_id}/${biz.city}/${biz.slug}`);
      console.log(`   URL future: /${cat?.slug}/${biz.city}/${biz.slug}`);
      console.log('');
    }
  }

  // 4. Instructions pour les redirections
  console.log('\n4️⃣ REDIRECTIONS 301 - Code à ajouter:\n');
  console.log('='.repeat(80));

  console.log(`
Dans src/pages/BusinessDetails.jsx, ajouter cette logique:

useEffect(() => {
  // Détecter si l'URL utilise un UUID au lieu d'un slug
  const categoryParam = params.categorySlug;

  // Pattern UUID: 8-4-4-4-12 caractères hexadécimaux
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (business && categoryParam && uuidPattern.test(categoryParam)) {
    // C'est un UUID! Rediriger vers l'URL avec le slug
    const correctUrl = getBusinessUrl(business); // Utilise le slug

    // Redirection 301 (permanente)
    window.location.replace(correctUrl);

    console.log('🔄 Redirection 301:', {
      from: location.pathname,
      to: correctUrl,
      reason: 'UUID détecté au lieu du slug'
    });
  }
}, [business, params.categorySlug, location.pathname]);
`);

  console.log('='.repeat(80));

  // 5. Instructions d'exécution
  console.log('\n📝 INSTRUCTIONS D\'EXÉCUTION:');
  console.log('\n▶️  Étape 1: Exécuter le SQL dans Supabase');
  console.log('   1. Va dans Supabase SQL Editor');
  console.log('   2. Copie-colle le SQL ci-dessus');
  console.log('   3. Exécute');
  console.log(`   ✅ Résultat: ${needsUpdate?.toLocaleString()} entreprises mises à jour\n`);

  console.log('▶️  Étape 2: Ajouter le code de redirection');
  console.log('   1. Modifie src/pages/BusinessDetails.jsx');
  console.log('   2. Ajoute le useEffect de redirection');
  console.log('   3. Deploy');
  console.log('   ✅ Résultat: URLs avec UUID redirigent vers slug\n');

  console.log('▶️  Étape 3: Vérifier');
  console.log('   1. Teste une ancienne URL avec UUID');
  console.log('   2. Vérifie la redirection 301');
  console.log('   3. Confirme que la nouvelle URL fonctionne\n');

  console.log('='.repeat(80));
  console.log('🎯 RÉSULTAT ATTENDU:');
  console.log('='.repeat(80));
  console.log(`
✅ AVANT la mise à jour:
   URL: /ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9/montreal/imo
   → Fonctionne mais mauvais pour SEO

✅ APRÈS la mise à jour:
   Ancienne URL: /ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9/montreal/imo
   → Redirection 301 automatique →
   Nouvelle URL: /restauration-et-alimentation/montreal/imo

✅ BÉNÉFICES:
   - SEO préservé (301 = permanente)
   - Anciennes URLs continuent de fonctionner
   - Nouvelles URLs propres et lisibles
   - Google suit les redirections automatiquement
  `);

  console.log('\n' + '='.repeat(80));
}

fixCategorySlug().catch(console.error);
