#!/bin/bash
set -e

echo "🚀 Génération sitemaps français par tranches de 5000"
echo ""

for i in {0..95}; do
  START=$((i * 5000))
  END=$(((i + 1) * 5000))
  echo "📦 Tranche $((i+1))/96: Offset $START à $END"
  node scripts/generate-sitemap-fr-batch.js $START $END || echo "⚠️  Tranche $((i+1)) a échoué, on continue..."
  sleep 1
done

# Dernière tranche (480k = 96 * 5k)
echo "📦 Tranche 97/97: Offset 480000 à 485000"
node scripts/generate-sitemap-fr-batch.js 480000 485000

echo ""
echo "✅ Toutes les tranches générées!"
