/**
 * Check for duplicate and problematic slugs in the database
 * Usage: source .env.local && npx tsx scripts/check-slugs.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  console.log('Run: source .env.local && npx tsx scripts/check-slugs.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSlugs() {
  console.log('🔍 Vérification des slugs dans la base de données...\n')

  // 1. Compter le total
  const { count: total } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Total entreprises: ${total?.toLocaleString()}`)

  // 2. Compter les slugs null
  const { count: nullSlugs } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('slug', null)

  console.log(`📊 Slugs NULL: ${nullSlugs?.toLocaleString()}`)

  // 3. Compter les slugs vides
  const { count: emptySlugs } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('slug', '')

  console.log(`📊 Slugs vides: ${emptySlugs?.toLocaleString()}`)

  // 4. Compter celles avec slug valide
  const { count: validSlugs } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('slug', 'is', null)
    .neq('slug', '')

  console.log(`📊 Avec slug valide: ${validSlugs?.toLocaleString()}`)

  // 5. Trouver les slugs dupliqués avec SQL brut
  console.log('\n🔍 Recherche de slugs dupliqués...')

  const { data: duplicates, error } = await supabase
    .from('businesses')
    .select('slug')
    .not('slug', 'is', null)
    .neq('slug', '')

  if (error) {
    console.error('Erreur:', error.message)
    return
  }

  // Compter les occurrences de chaque slug
  const slugCounts: Record<string, number> = {}
  for (const row of duplicates || []) {
    if (row.slug) {
      slugCounts[row.slug] = (slugCounts[row.slug] || 0) + 1
    }
  }

  // Filtrer les dupliqués
  const duplicatedSlugs = Object.entries(slugCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])

  if (duplicatedSlugs.length > 0) {
    console.log(`\n⚠️  ${duplicatedSlugs.length} slugs dupliqués trouvés!`)
    console.log('\nTop 20 des slugs dupliqués:')
    duplicatedSlugs.slice(0, 20).forEach(([slug, count]) => {
      console.log(`   - "${slug}" (${count} fois)`)
    })

    // Afficher les détails des 5 premiers dupliqués
    console.log('\n📋 Détails des 5 premiers dupliqués:')
    for (const [slug] of duplicatedSlugs.slice(0, 5)) {
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, name, city, neq')
        .eq('slug', slug)
        .limit(5)

      console.log(`\n   "${slug}":`)
      businesses?.forEach(b => {
        console.log(`      - ID: ${b.id}, NEQ: ${b.neq || 'N/A'}, "${b.name}" à ${b.city}`)
      })
    }
  } else {
    console.log('\n✅ Aucun slug dupliqué!')
  }

  // 6. Vérifier les slugs avec caractères problématiques
  console.log('\n🔍 Vérification des caractères spéciaux...')

  const problematicSlugs = (duplicates || []).filter(row => {
    if (!row.slug) return false
    // Slugs valides: lettres minuscules, chiffres, tirets
    return !/^[a-z0-9-]+$/.test(row.slug)
  })

  if (problematicSlugs.length > 0) {
    console.log(`⚠️  ${problematicSlugs.length} slugs avec caractères non-standard`)
    problematicSlugs.slice(0, 10).forEach(row => {
      console.log(`   - "${row.slug}"`)
    })
  } else {
    console.log('✅ Tous les slugs utilisent des caractères valides')
  }

  console.log('\n✅ Vérification terminée!')
}

checkSlugs().catch(console.error)
