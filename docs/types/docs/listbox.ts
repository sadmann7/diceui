import type { CompositionProps, EmptyProps } from "@/types";

export interface ListboxProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The default value of the selectable.
   *
   * - When multiple is false: `string`
   * - When multiple is true: `string[]`
   */
  defaultValue?: string | string[];

  /**
   * The current value of the selectable.
   *
   * - When multiple is false: `string`
   * - When multiple is true: `string[]`
   */
  value?: string | string[];

  /**
   * Event handler called when the value changes.
   *
   * - When multiple is false: `(value: string) => void`
   * - When multiple is true: `(value: string[]) => void`
   */
  onValueChange?: (value: string | string[]) => void;

  /**
   * Whether the selectable allows multiple values.
   * @default false
   */
  multiple?: boolean;

  /**
   * The orientation of the selectable.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical" | "mixed";

  /**
   * Whether the selectable loops through items.
   * @default false
   */
  loop?: boolean;

  /**
   * The reading direction of the selectable.
   * @default "ltr"
   */
  dir?: "ltr" | "rtl";

  /**
   * Whether the selectable is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the selectable is virtual.
   * @default false
   */
  virtual?: boolean;

  /**
   * Whether to render the selectable as a child of another element.
   * @default false
   */
  asChild?: boolean;
}

export interface ListboxItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The value of the item.
   *
   * Cannot be an empty string.
   */
  value: string;

  /** Whether the item is disabled. */
  disabled?: boolean;
}
