#!/bin/bash

# Script pour tester les rewrites Vercel avant déploiement
# Teste les URLs des 341k entreprises sans catégorie ET les 138k avec catégorie

echo "=== Test des URL rewrites Vercel ==="
echo ""

# URL de test (changera après déploiement pour tester en production)
BASE_URL="${1:-http://localhost:3000}"

echo "Base URL: $BASE_URL"
echo ""

# Fonction pour tester une URL
test_url() {
    local url=$1
    local expected_title=$2
    local test_name=$3

    echo "Testing: $test_name"
    echo "URL: $url"

    # Get response
    response=$(curl -s "$url")

    # Check for title
    title=$(echo "$response" | grep -o "<title>[^<]*</title>" | sed 's/<[^>]*>//g')

    # Check for canonical
    canonical=$(echo "$response" | grep -o 'rel="canonical" href="[^"]*"' | sed 's/.*href="\([^"]*\)".*/\1/')

    # Check for word count (SSR content)
    word_count=$(echo "$response" | grep -o '<div id="root">[^<]*' | wc -w)

    echo "  Title: $title"
    echo "  Canonical: $canonical"
    echo "  Has SSR content: $([ $word_count -gt 10 ] && echo 'YES' || echo 'NO')"

    # Validation
    if [[ "$title" == *"$expected_title"* ]]; then
        echo "  ✓ PASS: Title correct"
    else
        echo "  ✗ FAIL: Title incorrect"
        return 1
    fi

    if [[ "$canonical" == "$url" ]] || [[ "$canonical" == "${url%%\?*}" ]]; then
        echo "  ✓ PASS: Canonical correct"
    else
        echo "  ⚠ WARNING: Canonical is $canonical (expected $url)"
    fi

    echo ""
    return 0
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Entreprise SANS catégorie (341k URLs)"
echo "Format: /entreprise/ville/nom"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_url \
    "$BASE_URL/entreprise/mont-tremblant/gestion-mahd" \
    "Gestion MAHD" \
    "Entreprise sans catégorie"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Entreprise AVEC catégorie (138k URLs)"
echo "Format: /categorie/ville/nom"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_url \
    "$BASE_URL/sante-et-bien-etre/quebec/centre-de-garde-les-petits-coyotes-enr-3" \
    "Centre de garde les petits coyotes enr" \
    "Entreprise avec catégorie"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Version anglaise sans catégorie"
echo "Format: /en/entreprise/ville/nom"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_url \
    "$BASE_URL/en/entreprise/mont-tremblant/gestion-mahd" \
    "Gestion MAHD" \
    "English version sans catégorie"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Version anglaise avec catégorie"
echo "Format: /en/categorie/ville/nom"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_url \
    "$BASE_URL/en/services-professionnels/chateauguay/beaulieu-georges-2" \
    "Beaulieu Georges" \
    "English version avec catégorie"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Types d'URLs supportées:"
echo "  1. /entreprise/ville/nom (341,519 entreprises)"
echo "  2. /categorie/ville/nom (138,649 entreprises)"
echo "  3. /en/entreprise/ville/nom (English sans catégorie)"
echo "  4. /en/categorie/ville/nom (English avec catégorie)"
echo ""
echo "Total: 480,168 entreprises × 2 langues = 960,336 URLs"
echo ""
echo "Pour tester en production après déploiement:"
echo "  ./scripts/test-url-rewrites.sh https://registreduquebec.com"
echo ""
