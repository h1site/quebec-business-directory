/**
 * Script de validation des données REQ importées
 * Vérifie: NEQ, codes postaux, adresses, villes, catégories
 *
 * UTILISATION:
 * node scripts/validate-req-data.js
 *
 * OPTIONS:
 * --fix         Corriger automatiquement les erreurs simples
 * --limit=100   Limiter à 100 entreprises
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10000;
const autoFix = args.includes('--fix');

console.log('🔍 Validation des données REQ');
console.log('📊 Configuration:', { limit, autoFix });
console.log('');

// Statistiques
const stats = {
  total: 0,
  validNEQ: 0,
  invalidNEQ: 0,
  validPostalCode: 0,
  invalidPostalCode: 0,
  missingPostalCode: 0,
  hasAddress: 0,
  missingAddress: 0,
  hasCity: 0,
  missingCity: 0,
  cityMapped: 0,
  cityNotMapped: 0,
  hasSCIAN: 0,
  missingSCIAN: 0,
  hasCat: 0,
  missingCategory: 0,
  issues: []
};

/**
 * Valider format NEQ (10 chiffres)
 */
function validateNEQ(neq) {
  if (!neq) return { valid: false, error: 'NEQ manquant' };

  const cleaned = neq.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return { valid: false, error: `NEQ invalide (${cleaned.length} chiffres au lieu de 10)` };
  }

  return { valid: true };
}

/**
 * Valider code postal québécois (format: A1A 1A1 ou A1A1A1)
 */
function validatePostalCode(postalCode) {
  if (!postalCode) return { valid: false, error: 'Code postal manquant' };

  // Format canadien: lettre-chiffre-lettre chiffre-lettre-chiffre
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  const regex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;

  if (!regex.test(cleaned)) {
    return { valid: false, error: 'Format invalide', suggestion: null };
  }

  // Vérifier première lettre (doit être dans la plage du Québec: G, H, J)
  const firstLetter = cleaned[0];
  if (!['G', 'H', 'J'].includes(firstLetter)) {
    return { valid: false, error: 'Pas un code postal québécois', suggestion: null };
  }

  return { valid: true, normalized: `${cleaned.slice(0, 3)} ${cleaned.slice(3)}` };
}

/**
 * Valider la ville
 */
async function validateCity(city, mrc, region) {
  if (!city) return { valid: false, error: 'Ville manquante' };

  // Vérifier si la ville est mappée à une région/MRC
  const isMapped = mrc && region;

  return { valid: true, mapped: isMapped };
}

/**
 * Valider l'entreprise complète
 */
async function validateBusiness(business) {
  const issues = [];

  // NEQ
  const neqCheck = validateNEQ(business.neq);
  if (!neqCheck.valid) {
    issues.push({ type: 'NEQ', severity: 'HIGH', message: neqCheck.error });
    stats.invalidNEQ++;
  } else {
    stats.validNEQ++;
  }

  // Code postal
  if (!business.postal_code) {
    stats.missingPostalCode++;
    issues.push({ type: 'POSTAL_CODE', severity: 'MEDIUM', message: 'Code postal manquant' });
  } else {
    const postalCheck = validatePostalCode(business.postal_code);
    if (!postalCheck.valid) {
      stats.invalidPostalCode++;
      issues.push({ type: 'POSTAL_CODE', severity: 'MEDIUM', message: postalCheck.error });
    } else {
      stats.validPostalCode++;
    }
  }

  // Adresse
  if (!business.address || business.address.trim().length < 5) {
    stats.missingAddress++;
    issues.push({ type: 'ADDRESS', severity: 'HIGH', message: 'Adresse manquante ou invalide' });
  } else {
    stats.hasAddress++;
  }

  // Ville
  if (!business.city) {
    stats.missingCity++;
    issues.push({ type: 'CITY', severity: 'HIGH', message: 'Ville manquante' });
  } else {
    stats.hasCity++;

    const cityCheck = await validateCity(business.city, business.mrc, business.region);
    if (cityCheck.mapped) {
      stats.cityMapped++;
    } else {
      stats.cityNotMapped++;
      issues.push({ type: 'CITY', severity: 'LOW', message: `Ville "${business.city}" non mappée à une région/MRC` });
    }
  }

  // Code SCIAN
  if (!business.scian_code) {
    stats.missingSCIAN++;
    issues.push({ type: 'SCIAN', severity: 'LOW', message: 'Code SCIAN manquant' });
  } else {
    stats.hasSCIAN++;
  }

  // Catégorie
  const { data: category } = await supabase
    .from('business_categories')
    .select('id')
    .eq('business_id', business.id)
    .limit(1)
    .single();

  if (!category) {
    stats.missingCategory++;
    issues.push({ type: 'CATEGORY', severity: 'MEDIUM', message: 'Catégorie non assignée' });
  } else {
    stats.hasCat++;
  }

  return { business, issues };
}

/**
 * Validation principale
 */
async function validateAll() {
  console.log('📥 Récupération des entreprises REQ...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, neq, address, city, mrc, region, postal_code, province, scian_code')
    .eq('data_source', 'req')
    .limit(limit);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  stats.total = businesses.length;
  console.log(`✅ ${stats.total} entreprises à valider\n`);

  // Valider chaque entreprise
  for (let i = 0; i < businesses.length; i++) {
    const result = await validateBusiness(businesses[i]);

    if (result.issues.length > 0) {
      stats.issues.push({
        business: result.business.name,
        city: result.business.city,
        neq: result.business.neq,
        issues: result.issues
      });

      // Afficher les 10 premiers problèmes
      if (stats.issues.length <= 10) {
        console.log(`⚠️  ${result.business.name} (${result.business.city || 'Ville inconnue'})`);
        result.issues.forEach(issue => {
          const icon = issue.severity === 'HIGH' ? '🔴' : issue.severity === 'MEDIUM' ? '🟡' : '🔵';
          console.log(`   ${icon} ${issue.type}: ${issue.message}`);
        });
        console.log('');
      }
    }

    // Log progression
    if ((i + 1) % 100 === 0) {
      console.log(`📊 Progression: ${i + 1}/${stats.total}`);
    }
  }

  // Rapport final
  console.log('');
  console.log('✅ Validation terminée!');
  console.log('═'.repeat(60));
  console.log('📊 RAPPORT DE VALIDATION');
  console.log('═'.repeat(60));
  console.log(`\n🏢 TOTAL: ${stats.total} entreprises`);

  console.log(`\n📝 NEQ:`);
  console.log(`   ✅ Valides:    ${stats.validNEQ} (${Math.round(stats.validNEQ/stats.total*100)}%)`);
  console.log(`   ❌ Invalides:  ${stats.invalidNEQ} (${Math.round(stats.invalidNEQ/stats.total*100)}%)`);

  console.log(`\n📬 CODES POSTAUX:`);
  console.log(`   ✅ Valides:    ${stats.validPostalCode} (${Math.round(stats.validPostalCode/stats.total*100)}%)`);
  console.log(`   ❌ Invalides:  ${stats.invalidPostalCode} (${Math.round(stats.invalidPostalCode/stats.total*100)}%)`);
  console.log(`   ⚠️  Manquants:  ${stats.missingPostalCode} (${Math.round(stats.missingPostalCode/stats.total*100)}%)`);

  console.log(`\n🏠 ADRESSES:`);
  console.log(`   ✅ Présentes:  ${stats.hasAddress} (${Math.round(stats.hasAddress/stats.total*100)}%)`);
  console.log(`   ❌ Manquantes: ${stats.missingAddress} (${Math.round(stats.missingAddress/stats.total*100)}%)`);

  console.log(`\n🏙️  VILLES:`);
  console.log(`   ✅ Présentes:  ${stats.hasCity} (${Math.round(stats.hasCity/stats.total*100)}%)`);
  console.log(`   🗺️  Mappées:    ${stats.cityMapped} (${Math.round(stats.cityMapped/stats.total*100)}%)`);
  console.log(`   ⚠️  Non mappées: ${stats.cityNotMapped} (${Math.round(stats.cityNotMapped/stats.total*100)}%)`);
  console.log(`   ❌ Manquantes: ${stats.missingCity} (${Math.round(stats.missingCity/stats.total*100)}%)`);

  console.log(`\n🏷️  CODES SCIAN:`);
  console.log(`   ✅ Présents:   ${stats.hasSCIAN} (${Math.round(stats.hasSCIAN/stats.total*100)}%)`);
  console.log(`   ❌ Manquants:  ${stats.missingSCIAN} (${Math.round(stats.missingSCIAN/stats.total*100)}%)`);

  console.log(`\n📂 CATÉGORIES:`);
  console.log(`   ✅ Assignées:  ${stats.hasCat} (${Math.round(stats.hasCat/stats.total*100)}%)`);
  console.log(`   ❌ Manquantes: ${stats.missingCategory} (${Math.round(stats.missingCategory/stats.total*100)}%)`);

  console.log(`\n⚠️  PROBLÈMES DÉTECTÉS: ${stats.issues.length} entreprises`);

  console.log('═'.repeat(60));

  if (stats.issues.length > 10) {
    console.log(`\n💡 ${stats.issues.length - 10} autres entreprises avec problèmes non affichées`);
  }

  // Score de qualité
  const qualityScore = Math.round(
    ((stats.validNEQ + stats.validPostalCode + stats.hasAddress + stats.cityMapped + stats.hasSCIAN + stats.hasCat) /
    (stats.total * 6)) * 100
  );

  console.log(`\n🎯 SCORE DE QUALITÉ: ${qualityScore}%`);

  if (qualityScore >= 80) {
    console.log('✅ Excellent! Données de haute qualité.');
  } else if (qualityScore >= 60) {
    console.log('🟡 Bon. Quelques améliorations possibles.');
  } else {
    console.log('🔴 Attention. Données nécessitent des corrections.');
  }

  console.log('');
}

// Exécuter
validateAll()
  .then(() => {
    console.log('🎉 Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
