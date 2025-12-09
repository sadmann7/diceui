#!/bin/bash

# Test all components with @diceui dependencies
# Usage: ./scripts/test-all-components.sh [registry-url]

REGISTRY_URL=${1:-"https://diceui.com"}

echo "🧪 Testing All DiceUI Components"
echo "================================="
echo ""
echo "Registry: $REGISTRY_URL"
echo ""

# List of components to test (ones that have @diceui dependencies)
COMPONENTS=(
    "action-bar"
    "angle-slider"
    "color-picker"
    "compare-slider"
    "cropper"
    "editable"
    "file-upload"
    "key-value"
    "masonry"
    "media-player"
    "rating"
    "scroll-spy"
    "speed-dial"
    "stepper"
    "time-picker"
    "tour"
)

# Also test the hooks themselves
HOOKS=(
    "use-as-ref"
    "use-isomorphic-layout-effect"
    "use-lazy-ref"
)

PASSED=0
FAILED=0
FAILED_ITEMS=()

test_item() {
    local item=$1
    local url="$REGISTRY_URL/r/$item.json"
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$http_code" = "200" ]; then
        echo "✅ $item"
        ((PASSED++))
        return 0
    else
        echo "❌ $item (HTTP $http_code)"
        ((FAILED++))
        FAILED_ITEMS+=("$item")
        return 1
    fi
}

echo "Testing Hooks..."
echo "----------------"
for hook in "${HOOKS[@]}"; do
    test_item "$hook"
done

echo ""
echo "Testing Components..."
echo "---------------------"
for component in "${COMPONENTS[@]}"; do
    test_item "$component"
done

echo ""
echo "================================="
echo "Summary"
echo "================================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "Failed items:"
    for item in "${FAILED_ITEMS[@]}"; do
        echo "  - $item"
    done
    echo ""
    exit 1
else
    echo "🎉 All tests passed!"
    echo ""
fi
