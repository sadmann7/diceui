import type { Button } from "@/components/ui/button";
import type { CompositionProps, EmptyProps } from "@/types";

export interface ActionBarProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether the action bar is open/visible.
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
   * @default "center"
   */
  align?: "start" | "center" | "end";

  /**
   * Distance from the aligned edge (in pixels). Only applies when `align` is "start" or "end".
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

  /**
   * The reading direction of the toolbar.
   * @default "ltr"
   */
  dir?: "ltr" | "rtl";

  /**
   * The orientation of the toolbar.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Whether keyboard navigation should loop from last item to first item and vice versa.
   * @default true
   */
  loop?: boolean;
}

export interface ActionBarSelectionProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface ActionBarGroupProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface ActionBarItemProps
  extends Omit<
      React.ComponentProps<typeof Button>,
      keyof React.ComponentProps<"button">
    >,
    CompositionProps {
  /**
   * Event handler called when the item is selected.
   * When provided, the action bar will automatically close after selection
   * unless `event.preventDefault()` is called.
   *
   * ```ts
   * onSelect={(event) => {
   *   console.log("Item selected!")
   * }}
   * ```
   */
  onSelect?: (event: Event) => void;
}

export interface ActionBarCloseProps
  extends EmptyProps<"button">,
    CompositionProps {}

export interface ActionBarSeparatorProps
  extends EmptyProps<"div">,
    CompositionProps {}
