# DiceUI Scripts

Build and test utilities for the component registry.

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
Auto-detects server and tests all registry entries (19 total).

```bash
pnpm test:registry           
VERBOSE=true pnpm test:registry  # Show dependency counts
```

## Workflow

```bash
# After editing registry-*.ts
pnpm build:registry
pnpm test:registry  # Auto-detects local dev or production
```

The test script auto-detects if you're running local dev or production.
