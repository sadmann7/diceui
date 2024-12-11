import type {
  DndContextProps,
  DragEndEvent,
  DragOverlay,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { SlotProps } from "@radix-ui/react-slot";

import type { SortableContextProps } from "@dnd-kit/sortable";

interface SortableProps<TData extends { id: UniqueIdentifier }>
  extends DndContextProps {
  /**
   * An array of data items that the sortable component will render.
   * @example
   * value={[
   *   { id: 1, name: 'Item 1' },
   *   { id: 2, name: 'Item 2' },
   * ]}
   */
  value: TData[];

  /**
   * An optional callback function that is called when the order of the data items changes.
   * It receives the new array of items as its argument.
   * @example
   * onValueChange={(items) => console.log(items)}
   */
  onValueChange?: (items: TData[]) => void;

  /**
   * An optional callback function that is called when an item is moved.
   * It receives the full DragEndEvent object from @dnd-kit/core.
   * This will override the default behavior of updating the order of the data items.
   */
  onMove?: (event: DragEndEvent) => void;

  /**
   * The array of modifiers that will be used to modify the behavior of the sortable component.
   * @default
   * Automatically selected based on orientation:
   * - vertical: [restrictToVerticalAxis, restrictToParentElement]
   * - horizontal: [restrictToHorizontalAxis, restrictToParentElement]
   * - both: [restrictToParentElement]
   */
  modifiers?: DndContextProps["modifiers"];

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
  orientation?: "vertical" | "horizontal" | "both";

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
   * @default Automatically selected based on orientation:
   * - vertical: closestCenter
   * - horizontal: closestCenter
   * - both: closestCorners
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

interface SortableContentProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * The strategy to use for sorting the items.
   * @default
   * Automatically selected based on orientation:
   * - vertical: verticalListSortingStrategy
   * - horizontal: horizontalListSortingStrategy
   * - both: undefined
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

interface SortableOverlayProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DragOverlay>, "children"> {
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
   * @type React.ReactNode | ((params: { value: UniqueIdentifier }) => React.ReactNode)
   */
  children?:
    | ((params: { value: UniqueIdentifier }) => React.ReactNode)
    | React.ReactNode;
}

interface SortableItemProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * The unique identifier of the item.
   * @example "item-1"
   */
  value: UniqueIdentifier;

  /**
   * Specifies whether the item should act as a grip for dragging.
   * @default false
   */
  asGrip?: boolean;

  /**
   * Merges the item's props into its immediate child.
   * @default false
   */
  asChild?: boolean;
}

interface SortableItemGripProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"button">> {
  /**
   * Merges the item's props into its immediate child.
   * @default false
   */
  asChild?: boolean;
}

export type {
  SortableContentProps,
  SortableItemGripProps,
  SortableItemProps,
  SortableOverlayProps,
  SortableProps,
};
