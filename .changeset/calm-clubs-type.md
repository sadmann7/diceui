---
"@diceui/combobox": major
---

# Breaking Change: Renamed `ComboboxProgress` to `ComboboxLoading`

## What Changed
- The component `ComboboxProgress` has been renamed to `ComboboxLoading` to better reflect its purpose and maintain consistency with other loading components in the library.

## Why This Change
- The new name better describes the component's functionality as a loading indicator within the combobox
- Aligns with common UI patterns where loading states are typically named "Loading" rather than "Progress"
- Makes the API more intuitive and easier to understand for developers

## How to Update Your Code
1. Replace all instances of `ComboboxProgress` with `ComboboxLoading` in your imports:
```tsx
// Before
import { ComboboxProgress } from "@diceui/combobox";

// After
import { ComboboxLoading } from "@diceui/combobox";
```

2. Update all component usage in your JSX:
```tsx
// Before
<ComboboxProgress value={progress} />

// After
<ComboboxLoading value={progress} />
```

Note: The component's props and functionality remain the same, only the name has changed.
