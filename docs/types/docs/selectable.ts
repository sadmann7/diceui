import type { CompositionProps, EmptyProps } from "@/types";

export interface SelectableProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The default selected value when component is uncontrolled.
   */
  defaultSelectedValue?: string;

  /**
   * The controlled selected value. Use with `onSelectedValueChange`.
   */
  selectedValue?: string;

  /**
   * Callback fired when the selected value changes.
   * @param value The new selected value
   */
  onSelectedValueChange?: (value: string) => void;

  /**
   * The orientation of the selection navigation.
   * - `horizontal`: Left/right arrow keys navigate
   * - `vertical`: Up/down arrow keys navigate
   * - `mixed`: Both directional navigation, optimal for grid layouts
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical" | "mixed";

  /**
   * Whether keyboard navigation should loop around when reaching the end.
   * @default false
   */
  loop?: boolean;

  /**
   * Text direction for navigation.
   * @default "ltr"
   */
  dir?: "ltr" | "rtl";

  /**
   * Whether the selectable component is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to use virtual focus management.
   * In virtual mode, items don't receive focus directly.
   * @default false
   */
  virtual?: boolean;
}

export interface SelectableItemProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The value associated with this item.
   * Must be unique among siblings.
   */
  value?: string;

  /**
   * Whether the item is disabled from selection.
   * @default false
   */
  disabled?: boolean;
}
