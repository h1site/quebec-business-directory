#!/bin/bash

echo "📊 ÉTAT DE L'IMPORT REQ"
echo "═══════════════════════════════════════════════"
echo ""

# Vérifier le processus
PID=$(ps aux | grep "import-reste-csv" | grep -v grep | awk '{print $2}' | head -1)

if [ -z "$PID" ]; then
  echo "❌ Processus d'import arrêté"
  echo ""
  echo "📝 Dernières lignes du log:"
  tail -10 logs/import-reste-csv.log
else
  echo "✅ Import en cours (PID: $PID)"
  ps aux | grep $PID | grep -v grep | awk '{print "   CPU: " $3"% | RAM: "$4"%"}'
  echo ""

  # Progression depuis le log
  echo "📈 Dernières insertions:"
  grep "Importé [0-9]" logs/import-reste-csv.log | tail -3
  echo ""

  echo "📊 Dernières lignes du log:"
  tail -5 logs/import-reste-csv.log
fi

echo ""
echo "═══════════════════════════════════════════════"
