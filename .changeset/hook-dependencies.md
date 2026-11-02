---
"@diceui/combobox": patch
"@diceui/listbox": patch
"@diceui/mention": patch
"@diceui/tags-input": patch
---

Read context fields directly in event handler dependency lists, so the components pass `react-hooks/exhaustive-deps` without changing behavior.
