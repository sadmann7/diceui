import type {
  DndContextProps,
  DragEndEvent,
  DragOverlay,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { SortableContextProps } from "@dnd-kit/sortable";
import type { CompositionProps, EmptyProps } from "@/types";

export interface SortableProps<TData> extends DndContextProps {
  /**
   * An array of items for sorting.
   *
   * Can be an array of primitives (string, number) or objects.
   *
   * ```ts
   * // Array of primitives
   * value={["Item 1", "Item 2"]}
   * // Array of objects
   * value={[{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]}
   * ```
   */
  value: TData[];

  /** The callback function that is called when the order of the items changes. */
  onValueChange?: (items: TData[]) => void;

  /**
   * Callback that returns a unique identifier for each sortable item.
   *
   * Required when using an array of objects.
   *
   * ```ts
   * getItemValue={(item) => item.id}
   * ```
   */
  getItemValue?: (item: TData) => UniqueIdentifier;

  /**
   * Callback called when an item is moved. Receives the DragEndEvent with active and over indexes.
   *
   * Overrides default reordering behavior.
   *
   * ```ts
   * onMove={(event) => onCustomMove({activeIndex: event.activeIndex, overIndex: event.overIndex})}
   * ```
   */
  onMove?: (
    event: DragEndEvent & { activeIndex: number; overIndex: number },
  ) => void;

  /**
   * The array of modifiers that will be used to modify the behavior of the sortable component.
   *
   * @default
   * Automatically selected based on orientation:
   * - vertical: [restrictToVerticalAxis, restrictToParentElement]
   * - horizontal: [restrictToHorizontalAxis, restrictToParentElement]
   * - mixed: [restrictToParentElement]
   */
  modifiers?: DndContextProps["modifiers"];

  /**
   * The strategy to use for sorting the items.
   *
   * @default
   * Automatically selected based on orientation:
   * - vertical: verticalListSortingStrategy
   * - horizontal: horizontalListSortingStrategy
   * - mixed: undefined
   */
  strategy?: SortableContextProps["strategy"];

  /**
   * An array of sensors that will be used to detect the position of the sortable items.
   *
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
   *
   * @default React.useId()
   */
  id?: string;

  /** Accessibility options for the sortable component. */
  accessibility?: DndContextProps["accessibility"];

  /**
   * Specifies whether the sortable component should automatically scroll to the active item.
   *
   * @default false
   */
  autoScroll?: DndContextProps["autoScroll"];

  /** Specifies whether the sortable component should cancel the drop event. */
  cancelDrop?: DndContextProps["cancelDrop"];

  /** The children of the sortable component. */
  children?: DndContextProps["children"];

  /**
   * Collision detection algorithm to determine drop targets during drag operations.
   *
   * @default
   * Based on orientation:
   * - vertical: closestCenter
   * - horizontal: closestCenter
   * - mixed: closestCorners
   */
  collisionDetection?: DndContextProps["collisionDetection"];

  /** Specifies the measuring configuration for the sortable component. */
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

export interface SortableContentProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The strategy to use for sorting the items.
   *
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
   * Whether to render the children without a slot.
   *
   * When `true`, the `asChild` prop will be ignored.
   *
   * @default false
   */
  withoutSlot?: boolean;
}

export interface SortableItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique identifier of the item.
   *
   * Cannot be an empty string.
   */
  value: UniqueIdentifier;

  /**
   * Whether the item is disabled.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the item should act as a handle for dragging.
   *
   * @default false
   */
  asHandle?: boolean;
}

export interface SortableItemHandleProps
  extends EmptyProps<"button">,
    CompositionProps {}

export interface SortableOverlayProps
  extends Omit<
    React.ComponentProps<typeof DragOverlay>,
    keyof React.ComponentProps<"div">
  > {
  /**
   * The container to render the overlay in.
   *
   * @default document.body
   */
  container?: Element | DocumentFragment | null;

  /**
   * The drop animation to use for the sortable component.
   *
   * @default
   * { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }), }
   */
  dropAnimation?: DropAnimation;

  /**
   * The children of the sortable component.
   *
   * Can be a React node or a function that receives the value of the active item as an argument.
   *
   * ```ts
   * children={<Skeleton className="size-full" />}
   * children={(params) => <div className="size-full">{params.value}</div>}
   * ```
   */
  children?:
    | React.ReactNode
    | ((params: { value: UniqueIdentifier }) => React.ReactNode);
}
