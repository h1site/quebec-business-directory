#!/bin/bash

# Script to test blog short URL redirects for bots
# Tests that Googlebot and Screaming Frog get 301 redirects instead of 404

echo "=== Test des redirects blog pour les bots ==="
echo ""

BASE_URL="${1:-https://registreduquebec.com}"

echo "Base URL: $BASE_URL"
echo ""

# Function to test redirect
test_redirect() {
    local url=$1
    local expected_redirect=$2
    local test_name=$3

    echo "Testing: $test_name"
    echo "URL: $url"
    echo "Expected redirect: $expected_redirect"

    # Get response with headers only (like Googlebot does)
    response=$(curl -I -s "$url")

    # Extract status code
    status=$(echo "$response" | grep -i "HTTP/" | head -1 | awk '{print $2}')

    # Extract Location header
    location=$(echo "$response" | grep -i "^Location:" | cut -d' ' -f2- | tr -d '\r\n')

    echo "  Status code: $status"
    echo "  Location header: $location"

    # Validation
    if [[ "$status" == "301" ]]; then
        echo "  ✓ PASS: Returns 301 redirect"
    else
        echo "  ✗ FAIL: Status is $status (expected 301)"
        return 1
    fi

    if [[ "$location" == "$expected_redirect" ]]; then
        echo "  ✓ PASS: Redirect URL correct"
    else
        echo "  ⚠ WARNING: Redirect is $location (expected $expected_redirect)"
    fi

    echo ""
    return 0
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Short blog URL (restaurants)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_redirect \
    "$BASE_URL/blogue/top-10-restaurants-montreal" \
    "$BASE_URL/blogue/top-10-restaurants-montreal-2025" \
    "French short blog URL"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Short blog URL (reclamer fiche)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_redirect \
    "$BASE_URL/blogue/comment-reclamer-fiche-entreprise" \
    "$BASE_URL/blogue/comment-reclamer-fiche-entreprise-registre-quebec" \
    "French short blog URL"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: English version (restaurants)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_redirect \
    "$BASE_URL/en/blog/top-10-restaurants-montreal" \
    "$BASE_URL/en/blog/top-10-restaurants-montreal-2025" \
    "English short blog URL"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: English version (claim listing)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_redirect \
    "$BASE_URL/en/blog/comment-reclamer-fiche-entreprise" \
    "$BASE_URL/en/blog/comment-reclamer-fiche-entreprise-registre-quebec" \
    "English short blog URL"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ce script teste que les bots reçoivent des redirects 301 au lieu de 404."
echo ""
echo "Les URLs courtes testées:"
echo "  1. /blogue/top-10-restaurants-montreal → /blogue/top-10-restaurants-montreal-2025"
echo "  2. /blogue/comment-reclamer-fiche-entreprise → /blogue/comment-reclamer-fiche-entreprise-registre-quebec"
echo "  3. /en/blog/top-10-restaurants-montreal → /en/blog/top-10-restaurants-montreal-2025"
echo "  4. /en/blog/comment-reclamer-fiche-entreprise → /en/blog/comment-reclamer-fiche-entreprise-registre-quebec"
echo ""
echo "Les bots comme Googlebot et Screaming Frog ne chargent pas JavaScript,"
echo "donc ils ont besoin de redirects côté serveur (SSR) dans api/seo.js."
echo ""
echo "Pour tester après déploiement:"
echo "  ./scripts/test-blog-redirects.sh https://registreduquebec.com"
echo ""
