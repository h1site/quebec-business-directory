// Calcul approximatif des appels API Google effectués
// Basé sur les logs du script d'enrichissement

// D'après les logs, on a au moins 142 passes visibles
// Chaque passe traite 500 entreprises
// Moyenne d'enrichissement: ~440 entreprises par passe (88%)

const passesCompleted = 142; // Minimum observé dans les logs
const enterprisesPerPass = 500;
const avgEnrichedPerPass = 440; // Moyenne observée

// Calcul des appels API
// Chaque entreprise = 1 appel à Google Places API (recherche)
const totalAPICalls = passesCompleted * enterprisesPerPass;

// Total enrichi avec succès
const totalEnriched = passesCompleted * avgEnrichedPerPass;

console.log('\n📊 STATISTIQUES APPELS API GOOGLE PLACES\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📈 Passes complétées (minimum): ${passesCompleted.toLocaleString()}`);
console.log(`📊 Entreprises traitées par passe: ${enterprisesPerPass.toLocaleString()}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`🔍 TOTAL APPELS API GOOGLE:`);
console.log(`   ${totalAPICalls.toLocaleString()} appels`);
console.log(`   (${passesCompleted} passes × ${enterprisesPerPass} entreprises)\n`);

console.log(`✅ ENRICHISSEMENTS RÉUSSIS:`);
console.log(`   ${totalEnriched.toLocaleString()} entreprises (~88%)`);
console.log(`   Moyenne: ${avgEnrichedPerPass} entreprises par passe\n`);

console.log(`⚠️  NON TROUVÉES SUR GOOGLE:`);
const notFound = totalAPICalls - totalEnriched;
console.log(`   ${notFound.toLocaleString()} entreprises (~12%)\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`💰 COÛT ESTIMÉ (gratuit jusqu\'à 100K/mois):`);
console.log(`   Appels utilisés: ${totalAPICalls.toLocaleString()}`);
console.log(`   Limite gratuite: 100,000/mois`);
if (totalAPICalls > 100000) {
  console.log(`   ⚠️  Dépassement: ${(totalAPICalls - 100000).toLocaleString()} appels`);
} else {
  console.log(`   ✅ Dans la limite gratuite`);
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Si on a ~480K entreprises totales
const totalBusinesses = 480000;
const estimatedTotalPasses = Math.ceil(totalBusinesses / enterprisesPerPass);
const progressPct = ((passesCompleted / estimatedTotalPasses) * 100).toFixed(1);

console.log('🎯 PROGRESSION GLOBALE:');
console.log(`   Total entreprises estimé: ${totalBusinesses.toLocaleString()}`);
console.log(`   Passes nécessaires: ${estimatedTotalPasses.toLocaleString()}`);
console.log(`   Progression: ${progressPct}% (${passesCompleted}/${estimatedTotalPasses} passes)\n`);
