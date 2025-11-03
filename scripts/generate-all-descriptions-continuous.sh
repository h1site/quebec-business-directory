#!/bin/bash

# Script pour générer TOUTES les descriptions restantes en boucle
# Continue jusqu'à ce que toutes les 387k descriptions soient générées

echo "🚀 GÉNÉRATION CONTINUE DE TOUTES LES DESCRIPTIONS"
echo "=================================================="
echo ""
echo "Ce script tournera en boucle jusqu'à ce que TOUTES"
echo "les descriptions soient générées (~387k restantes)"
echo ""
echo "Chaque session génère 25,000 descriptions"
echo "Sessions estimées nécessaires: ~16"
echo "Temps total estimé: ~50-60 heures"
echo ""
echo "Le script peut être arrêté à tout moment avec Ctrl+C"
echo "et reprendra là où il s'est arrêté lors du prochain lancement."
echo ""
echo "=================================================="
echo ""

SESSION=1
TOTAL_GENERATED=0

while true; do
  echo ""
  echo "📍 SESSION #$SESSION - $(date '+%Y-%m-%d %H:%M:%S')"
  echo "=================================================="

  # Lance le script de génération
  node scripts/generate-descriptions-optimized.js

  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Erreur détectée (code: $EXIT_CODE)"
    echo "⏸️  Pause de 30 secondes avant de réessayer..."
    sleep 30
    continue
  fi

  # Incrémenter le compteur
  SESSION=$((SESSION + 1))
  TOTAL_GENERATED=$((TOTAL_GENERATED + 25000))

  echo ""
  echo "✅ Session terminée avec succès"
  echo "📊 Total généré (estimation): $TOTAL_GENERATED descriptions"
  echo ""

  # Vérifier s'il reste des descriptions à générer
  echo "🔍 Vérification des descriptions restantes..."

  # Attendre 10 secondes entre les sessions pour éviter de surcharger la DB
  echo "⏸️  Pause de 10 secondes avant la prochaine session..."
  sleep 10

  echo ""
  echo "▶️  Lancement de la session suivante..."
done
