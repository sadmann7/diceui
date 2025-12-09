#!/bin/bash

# Quick test script for DiceUI installation
# Usage: ./scripts/quick-test.sh [component-name] [registry-url]

COMPONENT=${1:-"action-bar"}
REGISTRY_URL=${2:-"https://diceui.com"}

echo "🧪 Quick Installation Test"
echo "=========================="
echo ""
echo "Component: @diceui/$COMPONENT"
echo "Registry: $REGISTRY_URL"
echo ""

# Test 1: Check if registry entry exists
echo "📥 Test 1: Fetching component registry..."
COMPONENT_URL="$REGISTRY_URL/r/$COMPONENT.json"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$COMPONENT_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Component registry found ($HTTP_CODE)"
else
    echo "❌ Component registry not found (HTTP $HTTP_CODE)"
    echo "   URL: $COMPONENT_URL"
    exit 1
fi

# Test 2: Parse and check dependencies
echo ""
echo "🔍 Test 2: Checking dependencies..."
COMPONENT_DATA=$(curl -s "$COMPONENT_URL")

# Extract registryDependencies
DEPS=$(echo "$COMPONENT_DATA" | grep -o '"registryDependencies":\s*\[[^]]*\]' | grep -o '@diceui/[^"]*' || echo "")

if [ -z "$DEPS" ]; then
    echo "ℹ️  No @diceui registry dependencies found"
else
    echo "   Found dependencies:"
    for dep in $DEPS; do
        dep_name=$(echo "$dep" | sed 's/@diceui\///')
        dep_url="$REGISTRY_URL/r/$dep_name.json"
        dep_code=$(curl -s -o /dev/null -w "%{http_code}" "$dep_url")
        
        if [ "$dep_code" = "200" ]; then
            echo "   ✅ $dep"
        else
            echo "   ❌ $dep (HTTP $dep_code)"
            echo "      URL: $dep_url"
            exit 1
        fi
    done
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "💡 To install this component, run:"
echo "   pnpm dlx shadcn@latest add \"@diceui/$COMPONENT\""
echo ""
