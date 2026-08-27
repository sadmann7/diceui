---
"@diceui/checkbox-group": patch
"@diceui/combobox": patch
"@diceui/listbox": patch
"@diceui/mention": patch
"@diceui/shared": patch
"@diceui/tags-input": patch
---

Switch package builds from tsup to tsdown so published ESM/CJS files and type declarations stay in sync. Require React 18+ and emit the automatic JSX runtime.
