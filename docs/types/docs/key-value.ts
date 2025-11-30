import type { CompositionProps, EmptyProps } from "@/types";

/**
 * Represents a single key-value pair entry.
 */
export interface KeyValueEntry {
  /**
   * Unique identifier for the entry.
   */
  id: string;

  /**
   * The key of the entry.
   */
  key: string;

  /**
   * The value of the entry.
   */
  value: string;
}

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique identifier for the key-value component.
   * @default React.useId()
   */
  id?: string;

  /**
   * The default value for uncontrolled usage.
   * @default [{ id: crypto.randomUUID(), key: "", value: "" }]
   */
  defaultValue?: KeyValueEntry[];

  /**
   * The controlled value of the key-value component.
   */
  value?: KeyValueEntry[];

  /**
   * Callback fired when the value changes.
   */
  onValueChange?: (value: KeyValueEntry[]) => void;

  /**
   * Whether the key-value component is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the key-value component is read-only.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether the key-value component is required.
   * @default false
   */
  required?: boolean;

  /**
   * The name of the key-value for form submission.
   * Submits as JSON string of entries array.
   */
  name?: string;

  /**
   * Maximum number of entries allowed.
   * @default undefined (unlimited)
   */
  maxEntries?: number;

  /**
   * Minimum number of entries required.
   * @default 0
   */
  minEntries?: number;

  /**
   * Placeholder text for the key input.
   * @default "Key"
   */
  keyPlaceholder?: string;

  /**
   * Placeholder text for the value input.
   * @default "Value"
   */
  valuePlaceholder?: string;

  /**
   * Text for the add button.
   * @default "Add"
   */
  addButtonText?: string;

  /**
   * Whether to show the add button.
   * @default true
   */
  showAddButton?: boolean;

  /**
   * Whether to show the remove button for each entry.
   * @default true
   */
  showRemoveButton?: boolean;

  /**
   * Whether to allow duplicate keys.
   * @default true
   */
  allowDuplicateKeys?: boolean;

  /**
   * Whether to enable paste support for bulk input.
   * Supports formats like:
   * - KEY=VALUE
   * - KEY: VALUE
   * - KEY VALUE (tab or multiple spaces)
   * @default true
   */
  enablePaste?: boolean;

  /**
   * Callback fired when paste is detected.
   * Can be used to customize paste parsing.
   */
  onPaste?: (event: ClipboardEvent, entries: KeyValueEntry[]) => void;

  /**
   * Callback fired when an entry is added.
   */
  onAdd?: (entry: KeyValueEntry) => void;

  /**
   * Callback fired when an entry is removed.
   */
  onRemove?: (entry: KeyValueEntry) => void;

  /**
   * Validator function for keys.
   * Return error message string if invalid, or undefined if valid.
   */
  validateKey?: (key: string, value: KeyValueEntry[]) => string | undefined;

  /**
   * Validator function for values.
   * Return error message string if invalid, or undefined if valid.
   */
  validateValue?: (
    value: string,
    key: string,
    entries: KeyValueEntry[],
  ) => string | undefined;

  /**
   * Whether to trim whitespace from keys and values.
   * @default true
   */
  trim?: boolean;
}

export interface ListProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The orientation of the list.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The entry data for this item.
   */
  entry: KeyValueEntry;
}

export interface KeyInputProps extends EmptyProps<"input">, CompositionProps {
  /**
   * The entry data for this input.
   */
  entry: KeyValueEntry;
}

export interface ValueInputProps extends EmptyProps<"input">, CompositionProps {
  /**
   * The entry data for this input.
   */
  entry: KeyValueEntry;
}

export interface RemoveButtonProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The entry data for this button.
   */
  entry: KeyValueEntry;
}

export interface AddButtonProps
  extends EmptyProps<"button">,
    CompositionProps {}

export interface ErrorProps extends EmptyProps<"span">, CompositionProps {
  /**
   * The entry data for this error message.
   */
  entry: KeyValueEntry;

  /**
   * The field type that has the error.
   */
  field: "key" | "value";
}
