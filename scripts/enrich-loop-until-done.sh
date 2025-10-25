#!/bin/bash

# Script pour boucler l'enrichissement jusqu'à 3 passes consécutives avec zéro enrichissement
# Monitoring en temps réel

PASS=1
ZERO_COUNT=0
LOGDIR="logs/enrich-loop"

# Créer le dossier de logs
mkdir -p "$LOGDIR"

echo "🚀 DÉMARRAGE DE L'ENRICHISSEMENT EN BOUCLE"
echo "═══════════════════════════════════════════════════════════"
echo "Critère d'arrêt: 3 passes consécutives avec 0 enrichissement"
echo "═══════════════════════════════════════════════════════════"
echo ""

while [ $ZERO_COUNT -lt 3 ]; do
    echo "📊 PASSE #$PASS - $(date '+%H:%M:%S')"
    echo "───────────────────────────────────────────────────────────"

    LOGFILE="$LOGDIR/pass-$PASS.log"

    # Lancer l'enrichissement et capturer la sortie
    node scripts/enrich-from-entreprise-csv.js 2>&1 | tee "$LOGFILE"

    # Extraire le nombre d'entreprises enrichies
    ENRICHED=$(grep "Entreprises enrichies:" "$LOGFILE" | tail -1 | awk '{print $3}' | tr -d ',')

    echo ""
    echo "✅ PASSE #$PASS TERMINÉE"
    echo "   Entreprises enrichies: $ENRICHED"
    echo ""

    # Vérifier si zéro enrichissement
    if [ "$ENRICHED" -eq 0 ]; then
        ZERO_COUNT=$((ZERO_COUNT + 1))
        echo "⚠️  Zéro enrichissement ($ZERO_COUNT/3)"
    else
        ZERO_COUNT=0
        echo "✨ Enrichissement en cours, on continue!"
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    PASS=$((PASS + 1))

    # Petit délai pour éviter de surcharger
    sleep 2
done

echo ""
echo "🎉 ENRICHISSEMENT COMPLET!"
echo "═══════════════════════════════════════════════════════════"
echo "Total de passes exécutées: $((PASS - 1))"
echo "3 passes consécutives avec 0 enrichissement détectées"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📁 Logs disponibles dans: $LOGDIR/"
