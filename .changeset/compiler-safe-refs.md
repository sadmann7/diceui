---
"@diceui/shared": patch
"@diceui/listbox": patch
"@diceui/combobox": patch
"@diceui/mention": patch
"@diceui/tags-input": patch
"@diceui/checkbox-group": patch
---

Stop reading and writing refs during render, so the components pass the React Compiler lint rules without changing behavior.
