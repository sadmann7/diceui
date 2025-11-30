import type { CompositionProps, EmptyProps } from "@/types";

export interface KeyValueEntry {
  /** Unique identifier for the entry. */
  id: string;

  /** The key of the entry. */
  key: string;

  /** The value of the entry. */
  value: string;
}

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique identifier for the key-value component.
   *
   * @default React.useId()
   */
  id?: string;

  /**
   * The default value for uncontrolled usage.
   *
   * @default [{ id: crypto.randomUUID(), key: "", value: "" }]
   */
  defaultValue?: KeyValueEntry[];

  /**
   * The controlled value of the key-value component.
   *
   * ```ts
   * value={[{ id: "1", key: "key1", value: "value1" }]}
   * ```
   */
  value?: KeyValueEntry[];

  /**
   * Callback fired when the value changes.
   *
   * ```ts
   * onValueChange={(value) => {
   *   console.log(value);
   * }}
   * ```
   */
  onValueChange?: (value: KeyValueEntry[]) => void;

  /**
   * Whether the key-value component is disabled.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the key-value component is read-only.
   *
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether the key-value component is required.
   *
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
   *
   * @default undefined (unlimited)
   */
  maxEntries?: number;

  /**
   * Minimum number of entries required.
   *
   * @default 0
   */
  minEntries?: number;

  /**
   * Placeholder text for the key input.
   *
   * @default "Key"
   */
  keyPlaceholder?: string;

  /**
   * Placeholder text for the value input.
   *
   * @default "Value"
   */
  valuePlaceholder?: string;

  /**
   * Whether to allow duplicate keys.
   *
   * @default true
   */
  allowDuplicateKeys?: boolean;

  /**
   * Whether to enable paste support for bulk input.
   * Supports formats like:
   * - KEY=VALUE
   * - KEY: VALUE
   * - KEY VALUE (tab or multiple spaces)
   *
   * @default true
   */
  enablePaste?: boolean;

  /**
   * Callback fired when paste is detected.
   * Can be used to customize paste parsing.
   *
   * ```ts
   * onPaste={(event, entries) => {
   *   console.log(event, entries);
   * }}
   * ```
   */
  onPaste?: (event: ClipboardEvent, entries: KeyValueEntry[]) => void;

  /**
   * Callback fired when an entry is added.
   *
   * ```ts
   * onAdd={(entry) => {
   *   console.log(entry);
   * }}
   * ```
   */
  onAdd?: (entry: KeyValueEntry) => void;

  /**
   * Callback fired when an entry is removed.
   *
   * ```ts
   * onRemove={(entry) => {
   *   console.log(entry);
   * }}
   * ```
   */
  onRemove?: (entry: KeyValueEntry) => void;

  /**
   * Validator function for keys.
   * Return error message string if invalid, or undefined if valid.
   *
   * ```ts
   * onKeyValidate={(key, value) => {
   *   if (key.length < 3) return "Key must be at least 3 characters";
   *   return undefined;
   * }}
   * ```
   */
  onKeyValidate?: (key: string, value: KeyValueEntry[]) => string | undefined;

  /**
   * Validator function for values.
   * Return error message string if invalid, or undefined if valid.
   *
   * ```ts
   * onValueValidate={(value, key, entries) => {
   *   if (value.length < 3) return "Value must be at least 3 characters";
   *   return undefined;
   * }}
   * ```
   */
  onValueValidate?: (
    value: string,
    key: string,
    entries: KeyValueEntry[],
  ) => string | undefined;

  /**
   * Whether to trim whitespace from keys and values.
   *
   * @default true
   */
  trim?: boolean;
}

export interface ListProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The orientation of the list.
   *
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The entry data for this item.
   *
   * ```ts
   * entry={{
   *   id: "1",
   *   key: "key1",
   *   value: "value1",
   * }}
   * ```
   */
  entry: KeyValueEntry;
}

export interface KeyInputProps extends EmptyProps<"input">, CompositionProps {
  /**
   * The entry data for this input.
   *
   * ```ts
   * entry={{
   *   id: "1",
   *   key: "key1",
   *   value: "value1",
   * }}
   * ```
   */
  entry: KeyValueEntry;
}

export interface ValueInputProps extends EmptyProps<"input">, CompositionProps {
  /**
   * The entry data for this input.
   *
   * ```ts
   * entry={{
   *   id: "1",
   *   key: "key1",
   *   value: "value1",
   * }}
   * ```
   */
  entry: KeyValueEntry;
}

export interface RemoveProps extends EmptyProps<"button">, CompositionProps {
  /**
   * The entry data for this button.
   *
   * ```ts
   * entry={{
   *   id: "1",
   *   key: "key1",
   *   value: "value1",
   * }}
   * ```
   */
  entry: KeyValueEntry;
}

export interface AddProps extends EmptyProps<"button">, CompositionProps {}

export interface ErrorProps extends EmptyProps<"span">, CompositionProps {
  /**
   * The entry data for this error message.
   *
   * ```ts
   * entry={{
   *   id: "1",
   *   key: "key1",
   *   value: "value1",
   * }}
   * ```
   */
  entry: KeyValueEntry;

  /**
   * The field type that has the error.
   *
   * @default "key"
   */
  field: "key" | "value";
}
