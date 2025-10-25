/**
 * Script pour cacher les entreprises REQ sans moyen de contact
 * Une entreprise doit avoir au minimum un téléphone OU un site web pour être visible
 *
 * UTILISATION:
 * node scripts/hide-businesses-without-contact.js
 *
 * OPTIONS:
 * --dry-run    Afficher les résultats sans les sauvegarder
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Clé Supabase manquante dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

console.log('🔍 Script de gestion de visibilité des entreprises');
console.log('📋 Critère: Au moins un téléphone OU un site web');
console.log('🎯 Mode:', dryRun ? 'DRY RUN (simulation)' : 'PRODUCTION');
console.log('');

async function main() {
  try {
    // 1. Compter les entreprises sans contact
    console.log('📊 Analyse des entreprises REQ...\n');

    const { count: withoutContact } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('data_source', 'req')
      .is('phone', null)
      .is('website', null);

    const { count: withContact } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('data_source', 'req')
      .or('phone.not.is.null,website.not.is.null');

    console.log('✅ Avec contact (téléphone OU site):', withContact);
    console.log('❌ Sans contact (ni téléphone ni site):', withoutContact);
    console.log('');

    if (withoutContact === 0) {
      console.log('✨ Toutes les entreprises ont au moins un moyen de contact!');
      return;
    }

    // 2. Marquer les entreprises sans contact comme cachées
    if (!dryRun) {
      console.log('🔄 Mise à jour de la visibilité...\n');

      // Cacher celles sans contact
      const { error: hideError } = await supabase
        .from('businesses')
        .update({ is_visible: false })
        .eq('data_source', 'req')
        .is('phone', null)
        .is('website', null);

      if (hideError) {
        throw new Error('Erreur lors du masquage: ' + hideError.message);
      }

      console.log(`✅ ${withoutContact} entreprises cachées (sans contact)`);

      // Afficher celles avec contact (par sécurité)
      const { error: showError } = await supabase
        .from('businesses')
        .update({ is_visible: true })
        .eq('data_source', 'req')
        .or('phone.not.is.null,website.not.is.null');

      if (showError) {
        throw new Error('Erreur lors de l\'affichage: ' + showError.message);
      }

      console.log(`✅ ${withContact} entreprises affichées (avec contact)`);
    } else {
      console.log('📝 DRY RUN: Les modifications suivantes seraient appliquées:');
      console.log(`   - ${withoutContact} entreprises seraient cachées (is_visible = false)`);
      console.log(`   - ${withContact} entreprises seraient affichées (is_visible = true)`);
    }

    console.log('');
    console.log('═'.repeat(60));
    console.log('📊 RÉSUMÉ FINAL');
    console.log('═'.repeat(60));
    console.log('🟢 Visibles (avec contact):', withContact);
    console.log('🔴 Cachées (sans contact):', withoutContact);
    console.log('📈 Taux de visibilité:', Math.round(withContact / (withContact + withoutContact) * 100) + '%');
    console.log('═'.repeat(60));
    console.log('');
    console.log('✅ Script terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
