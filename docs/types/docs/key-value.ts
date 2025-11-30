import type { Button } from "@/components/ui/button";
import type { CompositionProps, EmptyProps } from "@/types";

interface KeyValueItemData {
  id: string;
  key: string;
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
  defaultValue?: KeyValueItemData[];

  /**
   * The controlled value of the key-value component.
   *
   * ```ts
   * value={[{ id: "1", key: "key1", value: "value1" }]}
   * ```
   */
  value?: KeyValueItemData[];

  /**
   * Callback fired when the value changes.
   *
   * ```ts
   * onValueChange={(value) => {
   *   console.log(value);
   * }}
   * ```
   */
  onValueChange?: (value: KeyValueItemData[]) => void;

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
  maxItems?: number;

  /**
   * Minimum number of entries required.
   *
   * @default 0
   */
  minItems?: number;

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
   * @default false
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
   * onPaste={(event, items) => {
   *   console.log(event, entries);
   * }}
   * ```
   */
  onPaste?: (event: ClipboardEvent, items: KeyValueItemData[]) => void;

  /**
   * Callback fired when an item is added.
   *
   * ```ts
   * onAdd={(item) => {
   *   console.log(item);
   * }}
   * ```
   */
  onAdd?: (item: KeyValueItemData) => void;

  /**
   * Callback fired when an item is removed.
   *
   * ```ts
   * onRemove={(item) => {
   *   console.log(item);
   * }}
   * ```
   */
  onRemove?: (item: KeyValueItemData) => void;

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
  onKeyValidate?: (
    key: string,
    value: KeyValueItemData[],
  ) => string | undefined;

  /**
   * Validator function for values.
   * Return error message string if invalid, or undefined if valid.
   *
   * ```ts
   * onValueValidate={(value, key, items) => {
   *   if (value.length < 3) return "Value must be at least 3 characters";
   *   return undefined;
   * }}
   * ```
   */
  onValueValidate?: (
    value: string,
    key: string,
    items: KeyValueItemData[],
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

export interface ItemProps extends EmptyProps<"div">, CompositionProps {}

export interface KeyInputProps extends EmptyProps<"input">, CompositionProps {
  /**
   * The item data for this input.
   *
   * ```ts
   * item={{
   *   id: "1",
   *   key: "key1",
   *   value: "value1",
   * }}
   * ```
   */
  item: KeyValueItemData;
}

export interface ValueInputProps
  extends EmptyProps<"textarea">,
    CompositionProps {
  /**
   * Maximum number of rows before the textarea starts scrolling.
   * Without it, the textarea expands infinitely with content.
   *
   * @default undefined
   */
  maxRows?: number;
}

export interface RemoveProps
  extends EmptyProps<"button", keyof React.ComponentProps<typeof Button>>,
    CompositionProps {
  /**
   * Callback fired when an item is removed.
   *
   * ```ts
   * onRemove={(value) => {
   *   console.log(value);
   * }}
   * ```
   */
  onRemove?: (value: KeyValueItemData) => void;
}

export interface AddProps
  extends EmptyProps<"button", keyof React.ComponentProps<typeof Button>>,
    CompositionProps {
  /**
   * Callback fired when an item is added.
   *
   * ```ts
   * onAdd={(value) => {
   *   console.log(value);
   * }}
   * ```
   */
  onAdd?: (value: KeyValueItemData) => void;
}

export interface ErrorProps extends EmptyProps<"div">, CompositionProps {
  /** The field that has the error. */
  field: "key" | "value";
}
