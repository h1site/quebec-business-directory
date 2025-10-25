#!/bin/bash

# Script pour monitorer l'import en cours

echo "🔍 Monitoring de l'import REQ"
echo "═══════════════════════════════"
echo ""

# Vérifier si le processus tourne
PID=$(ps aux | grep "import-req-businesses" | grep -v grep | awk '{print $2}' | head -1)

if [ -z "$PID" ]; then
  echo "❌ Aucun processus d'import en cours"
else
  echo "✅ Processus en cours (PID: $PID)"
  ps aux | grep $PID | grep -v grep | awk '{print "   CPU: "$3"% | RAM: "$4"%"}'
fi

echo ""
echo "📊 Progression dans les logs:"
tail -5 logs/import-final.log

echo ""
echo "📈 Compte actuel dans la DB:"
node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const { count } = await supabase
  .from('businesses')
  .select('id', { count: 'exact', head: true })
  .eq('data_source', 'req');

console.log('   Total REQ:', count);
console.log('   Objectif: ~4,000+');
console.log('   Manque:', count < 4000 ? (4000 - count) : '0');
"
