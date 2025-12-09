# Testing DiceUI Installation

This directory contains scripts to test the DiceUI component installation process.

## Scripts

### 1. Quick Test (Bash) - Fastest

Quick validation that components and dependencies exist in the registry:

```bash
# Test default component (action-bar)
./scripts/quick-test.sh

# Test specific component
./scripts/quick-test.sh "color-picker"

# Test against local dev server
./scripts/quick-test.sh "action-bar" "http://localhost:3000"

# Test against production
./scripts/quick-test.sh "action-bar" "https://diceui.com"
```

### 2. Full Test (TypeScript) - Most Thorough

Comprehensive validation including dependency resolution:

```bash
# Test default component
pnpm test:installation

# Test specific component
TEST_COMPONENT="color-picker" pnpm test:installation

# Test against local dev server
REGISTRY_URL="http://localhost:3000" pnpm test:installation

# Test specific component against local dev server
TEST_COMPONENT="rating" REGISTRY_URL="http://localhost:3000" pnpm test:installation
```

## Testing Workflow

### Before Pushing

1. **Rebuild the registry** (after making changes to `registry-*.ts` files):
   ```bash
   pnpm build:registry
   ```

2. **Test against local dev server**:
   ```bash
   # Start dev server in one terminal
   pnpm dev
   
   # In another terminal, run quick test
   ./scripts/quick-test.sh "action-bar" "http://localhost:3000"
   ```

### After Deploying

1. **Test against production**:
   ```bash
   # Quick test
   ./scripts/quick-test.sh "action-bar" "https://diceui.com"
   
   # Or full test
   REGISTRY_URL="https://diceui.com" pnpm test:installation
   ```

2. **Test actual installation**:
   ```bash
   # In a separate Next.js project
   pnpm dlx shadcn@latest add "@diceui/action-bar"
   ```

## Common Test Scenarios

### Test All Custom Hooks

```bash
./scripts/quick-test.sh "use-as-ref"
./scripts/quick-test.sh "use-isomorphic-layout-effect"
./scripts/quick-test.sh "use-lazy-ref"
```

### Test Components with Many Dependencies

```bash
# Components with complex dependency chains
./scripts/quick-test.sh "action-bar"
./scripts/quick-test.sh "color-picker"
./scripts/quick-test.sh "stepper"
./scripts/quick-test.sh "tour"
```

## Troubleshooting

### Error: Component not found (HTTP 404)

- Make sure you've run `pnpm build:registry` after making changes
- Check that the component exists in `registry/registry-*.ts`
- Verify the dev server is running if testing locally

### Error: Dependency not found

- Check that all `registryDependencies` are prefixed with `@diceui/` for custom hooks
- Standard shadcn components (like `button`, `input`) should NOT have the prefix
- Run `pnpm build:registry` to regenerate JSON files

### Error: Invalid registry URL

- Make sure the registry URL in `components.json` matches your test URL
- Local: `http://localhost:3000`
- Production: `https://diceui.com`

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Test Installation
  run: |
    pnpm build:registry
    TEST_COMPONENT="action-bar" REGISTRY_URL="http://localhost:3000" pnpm test:installation
```

## What Gets Tested

1. ✅ Component registry entry exists
2. ✅ All `@diceui/*` dependencies exist
3. ✅ Nested dependency resolution works
4. ✅ Registry JSON is valid
5. ✅ File paths are correct
6. ✅ No broken dependency chains
