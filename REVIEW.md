# Review

Dice UI ships published `@diceui/*` packages and copy-paste registry components in several bases and styles. Failure means a component that behaves differently per base, docs that describe an API the code doesn't have, or a release that breaks people on update.

## Checks

- `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`.
- `pnpm validate:registry` and `pnpm test:registry` when anything under `docs/registry` changes.
- `pnpm build:registry` when a registry item is added, renamed, or changes its imports or dependencies.

## What to look for

- **Bases drift.** Components exist under `docs/registry/bases/radix` and `docs/registry/bases/base`. A fix in one base and not the other is a bug unless the difference is the underlying primitive's API.
- **Docs match the code.** Props tables, examples, and the API section in `docs/content/docs` match the component as changed. A new prop without docs, or docs for a removed prop, is a finding.
- **Synced from tablecn.** The data table and data grid come from tablecn at the commit pinned in `docs/registry/tablecn.json`. Local edits to those files are overwritten on the next sync; the fix belongs in tablecn.
- **Published packages.** Changes to `packages/*` that change behavior or public types need a changeset. Breaking changes need a major or a clear migration note.
- **Accessibility.** Roles, `aria-*` state, focus management, and keyboard support match the WAI-ARIA pattern for the component. Check RTL for anything directional.
- **Fixes.** A bug fix names the cause and fixes it, not the symptom.
- **Comments.** Comments that restate the code, narrate steps, or explain the fix, and JSDoc on components, parts, or internal helpers. Lint only checks the form.

## Skip

- Formatting and lint-enforced style.
- `pnpm-lock.yaml`, `CHANGELOG.md`, and generated registry output.

## Format

- Start with a count: `N important, N nit, N pre-existing`. Say plainly when nothing needs fixing.
- Every finding gives `file:line` and the input or state that breaks.
- At most three nits.
