#!/bin/bash

# Script de démarrage pour le développement
# Usage: ./start-dev.sh

echo "🚀 Démarrage de l'annuaire d'entreprises du Québec"
echo "=================================================="
echo ""

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
  echo ""
fi

# Vérifier la clé API Google
if ! grep -q "GOOGLE_PLACES_API_KEY=AIzaSy" .env 2>/dev/null; then
  echo "⚠️  ATTENTION: Clé API Google Places non trouvée dans .env"
  echo "   L'import Google Business ne fonctionnera pas."
  echo ""
fi

# Exporter les variables d'environnement
export $(cat .env | grep -v '^#' | xargs)

echo "✅ Configuration chargée"
echo ""
echo "Démarrage des serveurs:"
echo "  • Frontend Vite sur http://192.168.2.226:5173"
echo "  • Backend proxy sur http://localhost:3001"
echo ""
echo "=================================================="
echo ""
echo "💡 Appuyez sur Ctrl+C pour arrêter les serveurs"
echo ""

# Démarrer les deux serveurs
npm run dev:all
