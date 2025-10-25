#!/bin/bash

# Script de monitoring en direct du progrès d'enrichissement

while true; do
  clear
  echo "════════════════════════════════════════════════════════════"
  echo "   📊 MONITORING EN DIRECT - ENRICHISSEMENT"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  date "+%Y-%m-%d %H:%M:%S"
  echo ""

  # Afficher la dernière ligne du log principal
  echo "🔄 PROCESSUS PRINCIPAL (0dc92b):"
  tail -1 logs/enrich-loop.log 2>/dev/null | grep -E "PASSE|enrichis|Ligne" || echo "   En cours..."
  echo ""

  # Statistiques de la base de données
  echo "📊 STATISTIQUES BASE DE DONNÉES:"
  node -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

(async () => {
  const { count: total } = await supabase.from('businesses').select('id', { count: 'exact', head: true });
  const { count: withAddress } = await supabase.from('businesses').select('id', { count: 'exact', head: true }).not('address', 'is', null).not('city', 'is', null);
  const { count: withActEcon } = await supabase.from('businesses').select('id', { count: 'exact', head: true }).not('act_econ_code', 'is', null);
  const { count: withCategories } = await supabase.from('businesses').select('id', { count: 'exact', head: true }).not('categories', 'is', null);

  console.log('   Total businesses:', total?.toLocaleString());
  console.log('   Avec adresse:', withAddress?.toLocaleString(), '(' + ((withAddress / total) * 100).toFixed(1) + '%)');
  console.log('   Avec ACT_ECON:', withActEcon?.toLocaleString(), '(' + ((withActEcon / total) * 100).toFixed(1) + '%)');
  console.log('   Avec catégories:', withCategories?.toLocaleString(), '(' + ((withCategories / total) * 100).toFixed(1) + '%)');
})();
" 2>/dev/null

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "Rafraîchissement dans 10 secondes... (Ctrl+C pour quitter)"
  echo "════════════════════════════════════════════════════════════"

  sleep 10
done
