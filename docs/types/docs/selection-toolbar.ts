import type { CompositionProps, EmptyProps } from "@/types";

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
   * ```tsx
   * const containerRef = useRef<HTMLDivElement>(null)
   * <SelectionToolbar container={containerRef.current} />
   * ```
   *
   * @default document
   */
  container?: HTMLElement | null;

  /**
   * The container element where the toolbar will be portaled to.
   *
   * @default document.body
   */
  portalContainer?: Element | DocumentFragment | null;

  /**
   * The distance in pixels from the selection to the toolbar.
   *
   * @default 8
   */
  sideOffset?: number;
}

export interface SelectionToolbarItemProps
  extends Omit<
    React.ComponentProps<"button">,
    "onSelect" | "type" | "children"
  > {
  /**
   * Callback fired when the item is selected.
   * Receives the selected text and the event.
   *
   * ```ts
   * onSelect={(text, event) => {
   *   console.log({ selectedText: text })
   *   // Apply formatting
   * }}
   * ```
   */
  onSelect?: (text: string, event: Event) => void;

  /**
   * The content of the item (usually an icon).
   *
   * ```tsx
   * <SelectionToolbarItem>
   *   <Bold />
   * </SelectionToolbarItem>
   * ```
   */
  children?: React.ReactNode;
}

export interface SelectionToolbarSeparatorProps
  extends EmptyProps<"div">,
    CompositionProps {}
