# Registry Scripts

Utilities for building, validating, and testing the component registry.

## Scripts

### `build-registry.mts`
Builds registry JSON files from TypeScript.

```bash
pnpm build:registry
```

### `validate-registry.mts`
Validates registry structure.

```bash
pnpm validate:registry
```

### `cleanup-registry.mts`
Cleans up generated files.

```bash
pnpm cleanup:registry
```

### `test-registry.mts`
Auto-detects server and dynamically loads all registry entries to test.

```bash
pnpm test:registry
VERBOSE=true pnpm test:registry  # Show loaded items + dependency counts
```

Automatically tests:
- All hooks from `registry-hooks.ts`
- All components with `@diceui/*` dependencies from `registry-ui.ts`

## Workflow

```bash
# After editing registry-*.ts
pnpm build:registry
pnpm test:registry  # Auto-detects local dev or production
```

The test script auto-detects if you're running local dev or production.
