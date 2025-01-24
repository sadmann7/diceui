import type {
  DndContextProps,
  DragEndEvent,
  DragOverlay,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { SortableContextProps } from "@dnd-kit/sortable";
import type { SlotProps } from "@radix-ui/react-slot";

export interface RootProps<T> extends DndContextProps {
  /**
   * A record of column IDs to arrays of items for the kanban board.
   * Can be an array of primitives (string, number) or objects.
   *
   * @example
   * // Record of arrays of primitives
   * value={{
   *   "todo": ["Task 1", "Task 2"],
   *   "done": ["Task 3"]
   * }}
   * // Record of arrays of objects
   * value={{
   *   "todo": [{ id: 1, title: "Task 1" }, { id: 2, title: "Task 2" }],
   *   "done": [{ id: 3, title: "Task 3" }]
   * }}
   */
  value: Record<UniqueIdentifier, T[]>;

  /** The callback function that is called when items are moved between columns or reordered. */
  onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void;

  /**
   * Callback that returns a unique identifier for each kanban item.
   * Required when using an array of objects.
   *
   * @example
   * getItemValue={(item) => item.id}
   */
  getItemValue?: (item: T) => UniqueIdentifier;

  /**
   * An optional callback function that is called when an item is moved.
   * Receives the full DragEndEvent object from @dnd-kit/core.
   */
  onMove?: (event: DragEndEvent) => void;

  /**
   * The array of modifiers that will be used to modify the behavior of the kanban component.
   * @default undefined
   */
  modifiers?: DndContextProps["modifiers"];

  /**
   * The strategy to use for the columns and items.
   * @default
   *
   * For `Root`, the strategy is verticalListSortingStrategy.
   *
   * For `Board`, the strategy is automatically selected based on orientation:
   * - vertical: verticalListSortingStrategy
   * - horizontal: horizontalListSortingStrategy
   */
  strategy?: SortableContextProps["strategy"];

  /**
   * An array of sensors that will be used to detect drag and drop interactions.
   * @default
   * [
   *   useSensor(MouseSensor),
   *   useSensor(TouchSensor),
   *   useSensor(KeyboardSensor, {
   *     coordinateGetter,
   *   }),
   * ]
   */
  sensors?: DndContextProps["sensors"];

  /**
   * Specifies the orientation of the kanban board.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * The id of the kanban component.
   * @default React.useId()
   */
  id?: string;

  /** Accessibility options for the kanban component. */
  accessibility?: DndContextProps["accessibility"];

  /**
   * Specifies whether the kanban component should automatically scroll during drag.
   * @default false
   */
  autoScroll?: DndContextProps["autoScroll"];

  /** Specifies whether the kanban component should cancel the drop event. */
  cancelDrop?: DndContextProps["cancelDrop"];

  /** The children of the kanban component. */
  children?: DndContextProps["children"];

  /**
   * Collision detection algorithm to determine drop targets during drag operations.
   * @default closestCorners with custom handling for containers
   */
  collisionDetection?: DndContextProps["collisionDetection"];

  /** Specifies the measuring configuration for the kanban component. */
  measuring?: DndContextProps["measuring"];

  /** Event handler for the drag start event. */
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

export interface BoardProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /** The children of the kanban board. */
  children: React.ReactNode;

  /**
   * Merges the board's props into its immediate child.
   * @default false
   */
  asChild?: boolean;
}

export interface ColumnProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * The unique identifier of the column.
   * @example "todo"
   */
  value: UniqueIdentifier;

  /** The children of the kanban column. */
  children: React.ReactNode;

  /**
   * Whether the column should act as a handle for dragging.
   * @default false
   */
  asHandle?: boolean;

  /**
   * Merges the column's props into its immediate child.
   * @default false
   */
  asChild?: boolean;

  /**
   * Whether the column is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface ColumnHandleProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"button">> {
  /**
   * Merges the handle's props into its immediate child.
   * @default false
   */
  asChild?: boolean;
}

export interface ItemProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * The unique identifier of the item.
   * @example "task-1"
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
   * Merges the handle's props into its immediate child.
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
   * The drop animation to use for the kanban component.
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
   * The children of the overlay component.
   *
   * Can be a function that receives the value and variant of the active item,
   * or a React node.
   */
  children?:
    | ((params: {
        value: UniqueIdentifier;
        variant: "column" | "item";
      }) => React.ReactNode)
    | React.ReactNode;
}
