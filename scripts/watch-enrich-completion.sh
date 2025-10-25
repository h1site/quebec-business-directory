#!/bin/bash

echo "🔍 SURVEILLANCE DE L'ENRICHISSEMENT"
echo "═══════════════════════════════════════════════════════════"
echo "Je surveille le fichier log et t'avertis quand c'est terminé"
echo "═══════════════════════════════════════════════════════════"
echo ""

LOGFILE="logs/enrich-loop/pass-2.log"

# Attendre que le fichier existe
while [ ! -f "$LOGFILE" ]; do
    echo "⏳ En attente du fichier log..."
    sleep 5
done

echo "✅ Fichier log trouvé: $LOGFILE"
echo ""

# Surveiller le fichier jusqu'à ce qu'on voie "ENRICHISSEMENT COMPLET!"
tail -f "$LOGFILE" | while read line; do
    # Afficher les lignes importantes
    if echo "$line" | grep -q "PASSE #"; then
        echo "$line"
    elif echo "$line" | grep -q "TERMINÉE"; then
        echo "$line"
    elif echo "$line" | grep -q "Entreprises enrichies:"; then
        echo "$line"
    elif echo "$line" | grep -q "ENRICHISSEMENT COMPLET"; then
        echo ""
        echo "🎉🎉🎉 TERMINÉ! 🎉🎉🎉"
        echo "═══════════════════════════════════════════════════════════"
        echo "L'enrichissement automatique est COMPLÉTÉ!"
        echo "═══════════════════════════════════════════════════════════"
        exit 0
    fi
done
