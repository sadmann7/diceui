import type React from "react";
import type { ButtonProps, CompositionProps, EmptyProps } from "@/types";

export interface SelectionToolbarProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * Whether the toolbar is open.
   * Use this prop to control the component externally.
   *
   * ```tsx
   * const [open, setOpen] = useState(false)
   * <SelectionToolbar open={open} onOpenChange={setOpen} />
   * ```
   */
  open?: boolean;

  /**
   * Callback fired when the open state changes.
   *
   * ```ts
   * onOpenChange={(open) => {
   *   console.log({ open })
   * }}
   * ```
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Callback fired when the selection changes.
   *
   * ```ts
   * onSelectionChange={(text) => {
   *   console.log({ selectedText: text })
   * }}
   * ```
   */
  onSelectionChange?: (text: string) => void;

  /**
   * The container element to scope text selection to.
   * When provided, the toolbar will only appear for selections within this element.
   *
   * You can pass either a ref object or the element directly:
   *
   * ```tsx
   * <SelectionToolbar container={containerRef} />
   * // or
   * <SelectionToolbar container={containerRef.current} />
   * ```
   *
   * @default document
   */
  container?: HTMLElement | React.RefObject<HTMLElement | null> | null;

  /**
   * The container element where the toolbar will be portaled to.
   *
   * @default document.body
   */
  portalContainer?: Element | DocumentFragment | null;

  /**
   * The preferred side of the selection to place the toolbar.
   *
   * ```tsx
   * <SelectionToolbar side="bottom" />
   * ```
   *
   * @default "top"
   */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * The distance in pixels from the selection to the toolbar.
   *
   * @default 8
   */
  sideOffset?: number;

  /**
   * The preferred alignment along the side.
   *
   * ```tsx
   * <SelectionToolbar side="top" align="start" />
   * ```
   *
   * @default "center"
   */
  align?: "start" | "center" | "end";

  /**
   * An offset in pixels from the alignment axis.
   *
   * @default 0
   */
  alignOffset?: number;

  /**
   * When true, overrides the `side` and `align` preferences to prevent
   * collisions with boundary edges.
   *
   * @default true
   */
  avoidCollisions?: boolean;

  /**
   * The element(s) to keep the toolbar within.
   * Can be a single element or an array of elements.
   *
   * ```tsx
   * const boundaryRef = useRef<HTMLDivElement>(null)
   * <SelectionToolbar collisionBoundary={boundaryRef.current} />
   * // or multiple boundaries
   * <SelectionToolbar collisionBoundary={[boundary1, boundary2]} />
   * ```
   *
   * @default []
   */
  collisionBoundary?: Element | null | (Element | null)[];

  /**
   * The distance in pixels from the boundary edges where collision
   * detection should occur. Can be a number for all sides or an object
   * for per-side values.
   *
   * ```tsx
   * <SelectionToolbar collisionPadding={10} />
   * // or per-side
   * <SelectionToolbar collisionPadding={{ top: 10, bottom: 20 }} />
   * ```
   *
   * @default 0
   */
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;

  /**
   * The sticky behavior on the alignment axis.
   * - `"partial"` keeps the toolbar in the boundary as long as the trigger is at least partially in view.
   * - `"always"` keeps the toolbar in the boundary regardless.
   *
   * @default "partial"
   */
  sticky?: "partial" | "always";

  /**
   * Whether to hide the toolbar when the selection becomes fully occluded.
   *
   * @default false
   */
  hideWhenDetached?: boolean;

  /**
   * Strategy for updating the toolbar position.
   * - `"optimized"` only updates when needed for better performance.
   * - `"always"` updates on every animation frame for smoother tracking.
   *
   * @default "optimized"
   */
  updatePositionStrategy?: "optimized" | "always";
}

export interface SelectionToolbarItemProps
  extends Omit<ButtonProps, keyof React.ComponentProps<"button">>,
    CompositionProps {
  /**
   * Callback fired when the item is selected.
   * Receives the selected text and a custom event.
   *
   * ```tsx
   * <SelectionToolbarItem
   *   onSelect={(text, event) => {
   *     console.log({ selectedText: text })
   *     // Apply formatting, copy to clipboard, etc.
   *   }}
   * >
   *   <BoldIcon />
   * </SelectionToolbarItem>
   * ```
   */
  onSelect?: (text: string, event: Event) => void;
}

export interface SelectionToolbarSeparatorProps
  extends EmptyProps<"div">,
    CompositionProps {}
