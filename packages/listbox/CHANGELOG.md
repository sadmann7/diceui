# @diceui/listbox

## 1.0.2

### Patch Changes

- bea95b8: Stop reading and writing refs during render, so the components pass the React Compiler lint rules without changing behavior.

## 1.0.1

### Patch Changes

- cac659e: Read context fields directly in event handler dependency lists, so the components pass `react-hooks/exhaustive-deps` without changing behavior.

## 1.0.0

### Major Changes

- dcb5f57: Publish ESM only. CommonJS `require()` builds are no longer included.

## 0.2.1

### Patch Changes

- 9632d6c: Switch package builds from tsup to tsdown so published ESM/CJS files and type declarations stay in sync. Require React 18+ and emit the automatic JSX runtime.

## 0.2.0

### Minor Changes

- 11a1247: Cleanup bundler

## 0.1.0

### Minor Changes

- a13ae2e: Add better forwardRef
