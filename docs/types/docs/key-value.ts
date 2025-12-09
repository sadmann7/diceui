import type { Button } from "@/components/ui/button";
import type { CompositionProps, EmptyProps } from "@/types";

interface KeyValueItemData {
  id: string;
  key: string;
  value: string;
}

type ButtonProps = React.ComponentProps<typeof Button>;

export interface KeyValueProps extends EmptyProps<"div">, CompositionProps {
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
   * Event handler called when the value changes.
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
   * Submits as JSON string of items array.
   */
  name?: string;

  /**
   * Maximum number of items allowed.
   *
   * @default undefined (unlimited)
   */
  maxItems?: number;

  /**
   * Minimum number of items required.
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
   * Event handler called when paste is detected.
   * Can be used to customize paste parsing.
   *
   * ```ts
   * onPaste={(event, items) => {
   *   console.log(event, items);
   * }}
   * ```
   */
  onPaste?: (event: ClipboardEvent, items: KeyValueItemData[]) => void;

  /**
   * Event handler called when an item is added.
   *
   * ```ts
   * onAdd={(item) => {
   *   console.log(item);
   * }}
   * ```
   */
  onAdd?: (item: KeyValueItemData) => void;

  /**
   * Event handler called when an item is removed.
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

  /**
   * Whether to automatically strip surrounding quotes from pasted values.
   * When enabled, pasted values like `"kickflip"` or `'kickflip'` become `kickflip`.
   *
   * @default true
   */
  stripQuotes?: boolean;
}

export interface KeyValueListProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The orientation of the list.
   *
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
}

export interface KeyValueItemProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface KeyValueKeyInputProps
  extends EmptyProps<"input">,
    CompositionProps {
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

export interface KeyValueValueInputProps
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

export interface KeyValueRemoveProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {}

export interface KeyValueAddProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {}

export interface KeyValueErrorProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The field that has the error.
   *
   * ```ts
   * field="key"
   * ```
   */
  field: "key" | "value";
}
