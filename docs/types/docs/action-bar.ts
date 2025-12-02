import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether the action bar is open/visible.
   * @default false
   */
  open?: boolean;

  /**
   * Callback when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The side of the viewport to align the action bar.
   * @default "bottom"
   */
  side?: "top" | "bottom";

  /**
   * The alignment of the action bar along the viewport side.
   * @default "center"
   */
  align?: "start" | "center" | "end";

  /**
   * Distance from the side of the viewport (in pixels).
   * @default 16
   */
  sideOffset?: number;
}

export interface ItemProps extends EmptyProps<"button">, CompositionProps {
  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface SelectionProps extends EmptyProps<"div">, CompositionProps {}

export interface CloseProps extends EmptyProps<"button">, CompositionProps {}

export interface SeparatorProps extends EmptyProps<"div">, CompositionProps {}
