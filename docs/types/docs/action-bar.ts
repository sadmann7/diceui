import type { Button } from "@/components/ui/button";
import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether the action bar is open/visible.
   *
   * @default false
   */
  open?: boolean;

  /**
   * Event handler called when the open state changes.
   *
   * ```ts
   * onOpenChange={(open) => {
   *   console.log("Action bar open:", open)
   * }}
   * ```
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The side of the viewport to align the action bar.
   *
   * @default "bottom"
   */
  side?: "top" | "bottom";

  /**
   * Distance from the side of the viewport (in pixels).
   *
   * @default 16
   */
  sideOffset?: number;

  /**
   * The alignment of the action bar along the viewport side.
   *
   * @default "center"
   */
  align?: "start" | "center" | "end";

  /**
   * Distance from the aligned edge (in pixels). Only applies when `align` is "start" or "end".
   *
   * @default 0
   */
  alignOffset?: number;

  /**
   * The container to mount the portal into.
   * @default document.body
   */
  portalContainer?: Element | DocumentFragment | null;

  /**
   * Event handler called when the Escape key is pressed.
   * You can prevent the default dismissing behavior by calling `event.preventDefault()`.
   *
   * ```ts
   * onEscapeKeyDown={(event) => {
   *   console.log("Escape pressed!")
   *   // To prevent closing: event.preventDefault();
   * }}
   * ```
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export interface SelectionProps extends EmptyProps<"div">, CompositionProps {}

export interface ItemProps
  extends Omit<
      React.ComponentProps<typeof Button>,
      keyof React.ComponentProps<"button"> | "onSelect"
    >,
    CompositionProps {
  /**
   * Event handler called when the item is selected.
   * When provided, the action bar will automatically close after selection
   * unless `event.preventDefault()` is called.
   */
  onSelect?: (event: Event) => void;
}

export interface CloseProps extends EmptyProps<"button">, CompositionProps {}

export interface SeparatorProps extends EmptyProps<"div">, CompositionProps {}
