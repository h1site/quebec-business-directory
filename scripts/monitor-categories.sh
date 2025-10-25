#!/bin/bash

# Script de monitoring pour l'assignment des catégories

clear

echo "════════════════════════════════════════════════════════════"
echo "   📊 MONITORING - ASSIGNMENT DES CATÉGORIES"
echo "════════════════════════════════════════════════════════════"
echo ""

# Fonction pour obtenir les statistiques
get_stats() {
    node -e "
    import { createClient } from '@supabase/supabase-js';
    import dotenv from 'dotenv';
    dotenv.config();

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { count: withActEcon } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .not('act_econ_code', 'is', null);

    // Sample pour estimer le nombre avec catégories
    const { data: sample } = await supabase
      .from('businesses')
      .select('categories')
      .not('act_econ_code', 'is', null)
      .range(0, 4999); // 5000 samples

    const withCategories = sample?.filter(b => b.categories && b.categories.length > 0).length || 0;
    const estimatedTotal = Math.round((withCategories / 5000) * withActEcon);
    const percentage = ((estimatedTotal / withActEcon) * 100).toFixed(1);

    console.log('Total avec ACT_ECON:', withActEcon.toLocaleString());
    console.log('Échantillon (5000):', withCategories.toLocaleString(), 'avec catégories');
    console.log('Estimation totale:', estimatedTotal.toLocaleString(), 'avec catégories');
    console.log('Progression:', percentage + '%');
    console.log('Restant:', (withActEcon - estimatedTotal).toLocaleString());

    // Quelques exemples récents
    const { data: recent } = await supabase
      .from('businesses')
      .select('name, act_econ_code, categories')
      .not('act_econ_code', 'is', null)
      .not('categories', 'eq', '[]')
      .limit(5);

    console.log('');
    console.log('EXEMPLES:');
    recent?.forEach(b => {
      const catCount = b.categories?.length || 0;
      console.log('  ✅', b.name.substring(0, 40));
      console.log('     Code:', b.act_econ_code, '|', catCount, 'catégorie(s)');
    });
    "
}

# Mode continu (refresh toutes les 10 secondes)
if [ "$1" == "--watch" ] || [ "$1" == "-w" ]; then
    while true; do
        clear
        echo "════════════════════════════════════════════════════════════"
        echo "   📊 MONITORING - ASSIGNMENT DES CATÉGORIES (Auto-refresh)"
        echo "════════════════════════════════════════════════════════════"
        echo ""
        echo "⏰ $(date '+%H:%M:%S')"
        echo ""

        get_stats

        echo ""
        echo "════════════════════════════════════════════════════════════"
        echo "Prochaine mise à jour dans 10 secondes... (Ctrl+C pour arrêter)"
        sleep 10
    done
else
    get_stats
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "💡 Utilisez './scripts/monitor-categories.sh --watch' pour"
    echo "   un monitoring en continu (refresh toutes les 10s)"
    echo "════════════════════════════════════════════════════════════"
fi
