# @diceui/combobox

## 1.2.0

### Minor Changes

- 473a777: Prevent item selection on Enter when list is empty

## 1.1.0

### Minor Changes

- 555796c: Update `manualFiltering` TSDoc default value

## 1.0.0

### Major Changes

- 2444c4d: # Breaking Change: Renamed `ComboboxProgress` to `ComboboxLoading`

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

## 0.10.0

### Minor Changes

- a13ae2e: Add better forwardRef

### Patch Changes

- Updated dependencies [a13ae2e]
  - @diceui/shared@0.12.0

## 0.9.0

### Minor Changes

- d38e0e1: Add exit animation support for `Combobox.Content` when it unmounts from the DOM

### Patch Changes

- Updated dependencies [d38e0e1]
  - @diceui/shared@0.11.0

## 0.8.0

### Minor Changes

- 90d0462: Bump `@floating-ui/react` and add `onSelect` custom event to `Combobox.Item`

### Patch Changes

- Updated dependencies [90d0462]
  - @diceui/shared@0.10.0

## 0.7.0

### Minor Changes

- 91c8b92: Better `Combobox.Item` highlighting management, and deletion with `Backspace` and `Delete` keys.
- 91c8b92: Add `autoHighlight` prop to `Combobox.Root` to auto highlight the matching item when the `Combobox.Content` is open.

### Patch Changes

- Updated dependencies [91c8b92]
  - @diceui/shared@0.9.0

## 0.6.0

### Minor Changes

- 732b7ce: Bump slot

### Patch Changes

- Updated dependencies [732b7ce]
  - @diceui/shared@0.8.0

## 0.5.0

### Minor Changes

- 7ab8505: Fixed text selection for `Combobox.Input` with pointer

## 0.4.0

### Minor Changes

- ca07b5d: Update keywords

## 0.3.0

### Minor Changes

- ba62131: Fixed event bubbling issues in `Combobox.Portal`

### Patch Changes

- Updated dependencies [ba62131]
  - @diceui/shared@0.7.0

## 0.2.0

### Minor Changes

- 2bbc35f: Update slot and primitive

### Patch Changes

- Updated dependencies [2bbc35f]
  - @diceui/shared@0.6.0

## 0.1.1

### Patch Changes

- Updated dependencies [6074f6a]
  - @diceui/shared@0.5.0

## 0.1.0

### Major Changes

- 175b0d1: Added `Badge` components for multiple selection
  - Added `BadgeList` component for displaying the list of selected items
  - Added `BadgeItem` component for displaying a selected item
  - Added `BadgeItemDelete` component for deleting a selected item

### Patch Changes

- Updated dependencies [175b0d1]
  - @diceui/shared@0.4.0

## 0.0.5

### Patch Changes

- Updated dependencies [b19c602]
  - @diceui/shared@0.3.0

## 0.0.4

### Patch Changes

- Updated dependencies [6217fa2]
  - @diceui/shared@0.2.1

## 0.0.3

### Patch Changes

- Updated dependencies [6ab450b]
  - @diceui/shared@0.2.0

## 0.0.2

### Patch Changes

- Updated dependencies [e60ff2d]
  - @diceui/shared@0.1.0
