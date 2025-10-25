#!/bin/bash

# Script de status complet pour tous les processus

clear

echo "════════════════════════════════════════════════════════════"
echo "   📊 STATUS COMPLET - Répertoire d'Entreprises du Québec"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. PROCESSUS EN COURS
echo "═══════════════════════════════════════════════════════════"
echo "🔄 PROCESSUS BACKGROUND EN COURS"
echo "═══════════════════════════════════════════════════════════"
echo ""

PROCESSES=$(ps aux | grep -E "enrich-from-entreprise|enrich-loop|assign-categories" | grep -v grep | wc -l)
if [ $PROCESSES -gt 0 ]; then
    echo "✅ $PROCESSES processus actifs:"
    ps aux | grep -E "enrich-from-entreprise|enrich-loop|assign-categories" | grep -v grep | awk '{print "   • PID " $2 ": " substr($0, index($0,$11))}'
else
    echo "❌ Aucun processus actif"
fi

echo ""

# 2. STATISTIQUES DATABASE
echo "═══════════════════════════════════════════════════════════"
echo "💾 STATISTIQUES DATABASE"
echo "═══════════════════════════════════════════════════════════"
echo ""

node -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Total businesses
const { count: total } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true });

// Avec NEQ
const { count: withNEQ } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .not('neq', 'is', null);

// Avec ACT_ECON
const { count: withActEcon } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .not('act_econ_code', 'is', null);

console.log('📊 BUSINESSES:');
console.log('   Total:', total?.toLocaleString() || 0);
console.log('   Avec NEQ:', withNEQ?.toLocaleString() || 0, '(' + ((withNEQ/total)*100).toFixed(1) + '%)');
console.log('   Avec ACT_ECON:', withActEcon?.toLocaleString() || 0, '(' + ((withActEcon/total)*100).toFixed(1) + '%)');
console.log('');

// Categories - échantillon pour estimation
const { data: sample } = await supabase
  .from('businesses')
  .select('categories')
  .not('act_econ_code', 'is', null)
  .range(0, 9999); // 10K sample

const withCats = sample?.filter(b => b.categories && b.categories.length > 0).length || 0;
const estimatedTotal = Math.round((withCats / 10000) * withActEcon);
const pctCats = ((estimatedTotal / withActEcon) * 100).toFixed(1);

console.log('📂 CATÉGORIES:');
console.log('   Échantillon (10K):', withCats.toLocaleString(), 'avec catégories');
console.log('   Estimation:', estimatedTotal.toLocaleString(), '/', withActEcon.toLocaleString());
console.log('   Progression:', pctCats + '%');
console.log('   Restant:', (withActEcon - estimatedTotal).toLocaleString());
"

echo ""

# 3. LOGS RÉCENTS
echo "═══════════════════════════════════════════════════════════"
echo "📋 LOGS RÉCENTS (Enrichissement)"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "logs/enrich-continue.log" ]; then
    echo "📄 enrich-continue.log (dernières 3 lignes):"
    tail -3 logs/enrich-continue.log | sed 's/^/   /'
    echo ""
fi

if [ -f "logs/enrich-pass4.log" ]; then
    echo "📄 enrich-pass4.log (dernières 3 lignes):"
    tail -3 logs/enrich-pass4.log | sed 's/^/   /'
    echo ""
fi

if [ -f "logs/enrich-pass5.log" ]; then
    echo "📄 enrich-pass5.log (dernières 3 lignes):"
    tail -3 logs/enrich-pass5.log | sed 's/^/   /'
    echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo "💡 COMMANDES UTILES:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  • Monitoring enrichissement:  bash scripts/monitor-import.sh"
echo "  • Monitoring catégories:      bash scripts/monitor-categories.sh --watch"
echo "  • Status complet:             bash scripts/status-complet.sh"
echo "  • Logs en direct:             tail -f logs/enrich-continue.log"
echo ""
echo "════════════════════════════════════════════════════════════"
