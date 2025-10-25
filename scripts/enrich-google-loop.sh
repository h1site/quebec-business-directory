#!/bin/bash

# Script pour enrichir en boucle via Google Places API
# Continue jusqu'à ce qu'il n'y ait plus d'entreprises à enrichir

LOG_FILE="logs/enrich-google.log"
BATCH_SIZE=500
PASSE=1

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

echo "🚀 DÉMARRAGE ENRICHISSEMENT GOOGLE PLACES" | tee -a "$LOG_FILE"
echo "📅 $(date)" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Compteur de passes sans enrichissement
ZERO_ENRICHED_COUNT=0

while true; do
    echo "🔄 PASSE #$PASSE" | tee -a "$LOG_FILE"
    echo "⏰ $(date)" | tee -a "$LOG_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

    # Exécuter l'enrichissement
    node scripts/enrich-req-data.js --limit=$BATCH_SIZE 2>&1 | tee -a "$LOG_FILE"

    # Extraire le nombre d'entreprises enrichies du log
    ENRICHED=$(tail -100 "$LOG_FILE" | grep "✅ Enrichies:" | tail -1 | grep -o "[0-9]*" | head -1)

    if [ -z "$ENRICHED" ]; then
        ENRICHED=0
    fi

    echo "" | tee -a "$LOG_FILE"
    echo "📊 Passe #$PASSE terminée: $ENRICHED entreprises enrichies" | tee -a "$LOG_FILE"

    # Si 0 enrichissement, incrémenter le compteur
    if [ "$ENRICHED" -eq 0 ]; then
        ZERO_ENRICHED_COUNT=$((ZERO_ENRICHED_COUNT + 1))
        echo "⚠️  Passe sans enrichissement: $ZERO_ENRICHED_COUNT/3" | tee -a "$LOG_FILE"

        # Arrêter après 3 passes consécutives sans enrichissement
        if [ "$ZERO_ENRICHED_COUNT" -ge 3 ]; then
            echo "" | tee -a "$LOG_FILE"
            echo "✅ ARRÊT: 3 passes consécutives sans enrichissement" | tee -a "$LOG_FILE"
            echo "📅 $(date)" | tee -a "$LOG_FILE"
            break
        fi
    else
        # Reset le compteur si on a enrichi des entreprises
        ZERO_ENRICHED_COUNT=0
    fi

    echo "" | tee -a "$LOG_FILE"
    echo "⏸️  Pause de 2 secondes avant la prochaine passe..." | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    sleep 2
    PASSE=$((PASSE + 1))
done

echo "" | tee -a "$LOG_FILE"
echo "🎉 ENRICHISSEMENT GOOGLE PLACES TERMINÉ!" | tee -a "$LOG_FILE"
echo "📊 Total de passes effectuées: $PASSE" | tee -a "$LOG_FILE"
echo "📅 $(date)" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
