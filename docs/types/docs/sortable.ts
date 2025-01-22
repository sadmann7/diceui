import type {
  DndContextProps,
  DragEndEvent,
  DragOverlay,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { SlotProps } from "@radix-ui/react-slot";

import type { SortableContextProps } from "@dnd-kit/sortable";

export interface RootProps<TData> extends DndContextProps {
  /**
   * An array of items for sorting.
   *
   * Can be an array of primitives (string, number) or objects.
   *
   * @example
   * // Array of primitives
   * value={["Item 1", "Item 2"]}
   * // Array of objects
   * value={[{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]}
   */
  value: TData[];

  /** The callback function that is called when the order of the items changes. */
  onValueChange?: (items: TData[]) => void;

  /**
   * Callback that returns a unique identifier for each sortable item.
   *
   * Required when using an array of objects.
   *
   * @example
   * getItemValue={(item) => item.id}
   */
  getItemValue?: (item: TData) => UniqueIdentifier;

  /**
   * Callback to render each item in the list.
   * This will be used for both the list items and the drag overlay.
   *
   * @example
   * renderItem={(item) => <div>{item.name}</div>}
   */
  renderItem?: (item: TData) => React.ReactNode;

  /**
   * An optional callback function that is called when an item is moved.
   * Receives the full DragEndEvent object from @dnd-kit/core.
   *
   * Overrides the default behavior of updating the order of the data items.
   */
  onMove?: (event: DragEndEvent) => void;

  /**
   * The array of modifiers that will be used to modify the behavior of the sortable component.
   * @default
   * Automatically selected based on orientation:
   * - vertical: [restrictToVerticalAxis, restrictToParentElement]
   * - horizontal: [restrictToHorizontalAxis, restrictToParentElement]
   * - mixed: [restrictToParentElement]
   */
  modifiers?: DndContextProps["modifiers"];

  /**
   * The strategy to use for sorting the items.
   * @default
   * Automatically selected based on orientation:
   * - vertical: verticalListSortingStrategy
   * - horizontal: horizontalListSortingStrategy
   * - mixed: undefined
   */
  strategy?: SortableContextProps["strategy"];

  /**
   * An array of sensors that will be used to detect the position of the sortable items.\n
   * @default
   * [
   *   useSensor(MouseSensor),
   *   useSensor(TouchSensor),
   *   useSensor(KeyboardSensor, {
   *     coordinateGetter: sortableKeyboardCoordinates,
   *   }),
   * ]
   */
  sensors?: DndContextProps["sensors"];

  /**
   * Specifies the axis for the drag-and-drop operation.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "mixed";

  /**
   * The id of the sortable component.
   * @default React.useId()
   */
  id?: string;

  /** Accessibility options for the sortable component. */
  accessibility?: DndContextProps["accessibility"];

  /**
   * Specifies whether the sortable component should automatically scroll to the active item.
   * @default false
   */
  autoScroll?: DndContextProps["autoScroll"];

  /** Specifies whether the sortable component should cancel the drop event. */
  cancelDrop?: DndContextProps["cancelDrop"];

  /** The children of the sortable component. */
  children?: DndContextProps["children"];

  /**
   * Collision detection algorithm to determine drop targets during drag operations.
   * @default
   * Based on orientation:
   * - vertical: closestCenter
   * - horizontal: closestCenter
   * - mixed: closestCorners
   */
  collisionDetection?: DndContextProps["collisionDetection"];

  /** Specifies the measuring configuration for the sortable component. */
  measuring?: DndContextProps["measuring"];

  /** Event handlers for the sortable component. */
  onDragStart?: DndContextProps["onDragStart"];

  /** Event handler for the drag move event. */
  onDragMove?: DndContextProps["onDragMove"];

  /** Event handler for the drag over event. */
  onDragOver?: DndContextProps["onDragOver"];

  /** Event handler for the drag end event. */
  onDragEnd?: DndContextProps["onDragEnd"];

  /** Event handler for the drag cancel event. */
  onDragCancel?: DndContextProps["onDragCancel"];

  /**
   * Specifies whether to use a flat cursor style instead of grab/grabbing.
   * @default false
   */
  flatCursor?: boolean;
}

export interface ContentProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * The strategy to use for sorting the items.
   * @default
   * Automatically selected based on orientation:
   * - vertical: verticalListSortingStrategy
   * - horizontal: horizontalListSortingStrategy
   * - mixed: undefined
   */
  strategy?: SortableContextProps["strategy"];

  /** The children of the sortable component. */
  children: React.ReactNode;

  /**
   * Merges the content's props into its immediate child.
   * @default false
   */
  asChild?: boolean;
}

export interface ItemProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * The unique identifier of the item.
   * @example "item-1"
   */
  value: UniqueIdentifier;

  /**
   * Whether the item should act as a handle for dragging.
   * @default false
   */
  asHandle?: boolean;

  /**
   * Merges the item's props into its immediate child.
   * @default false
   */
  asChild?: boolean;

  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface ItemHandleProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"button">> {
  /**
   * Merges the item's props into its immediate child.
   * @default false
   */
  asChild?: boolean;
}

export interface OverlayProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DragOverlay>,
    keyof React.ComponentPropsWithoutRef<"div">
  > {
  /**
   * The container to render the overlay in.
   * @default globalThis.document?.body
   */
  container?: HTMLElement | DocumentFragment | null;

  /**
   * The drop animation to use for the sortable component.
   * @default
   * {
   *   sideEffects: defaultDropAnimationSideEffects({
   *     styles: {
   *       active: {
   *         opacity: "0.4",
   *       },
   *     },
   *   }),
   * }
   */
  dropAnimation?: DropAnimation;

  /**
   * The children of the sortable component.
   *
   * Can be a function that receives the value of the active item as an argument,
   * or a React node.
   */
  children?:
    | ((params: { value: UniqueIdentifier }) => React.ReactNode)
    | React.ReactNode;
}
