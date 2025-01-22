"use client";

import {
  type CollisionDetection,
  DndContext,
  type DndContextProps,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DraggableSyntheticListeners,
  type DropAnimation,
  type DroppableContainer,
  KeyboardCode,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  closestCenter,
  closestCorners,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  type SortableContextProps,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot, type SlotProps } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { composeEventHandlers, useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const coordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context: { active, droppableRects, droppableContainers, collisionRect } },
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !collisionRect) {
      return;
    }

    const filteredContainers: DroppableContainer[] = [];

    for (const entry of droppableContainers.getEnabled()) {
      if (!entry || entry?.disabled) {
        return;
      }

      const rect = droppableRects.get(entry.id);

      if (!rect) {
        return;
      }

      const data = entry.data.current;

      if (data) {
        const { type, children } = data;

        if (type === "container" && children?.length > 0) {
          if (active.data.current?.type !== "container") {
            return;
          }
        }
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (collisionRect.left >= rect.left + rect.width) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          if (collisionRect.left + collisionRect.width <= rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    }

    const collisions = closestCorners({
      active,
      collisionRect: collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null,
    });
    const closestId = getFirstCollision(collisions, "id");

    if (closestId != null) {
      const newDroppable = droppableContainers.get(closestId);
      const newNode = newDroppable?.node.current;
      const newRect = newDroppable?.rect.current;

      if (newNode && newRect) {
        if (newDroppable.id === "placeholder") {
          return {
            x: newRect.left + (newRect.width - collisionRect.width) / 2,
            y: newRect.top + (newRect.height - collisionRect.height) / 2,
          };
        }

        if (newDroppable.data.current?.type === "container") {
          return {
            x: newRect.left + 20,
            y: newRect.top + 74,
          };
        }

        return {
          x: newRect.left,
          y: newRect.top,
        };
      }
    }
  }

  return undefined;
};

const ROOT_NAME = "Kanban";
const BOARD_NAME = "KanbanBoard";
const COLUMN_NAME = "KanbanColumn";
const ITEM_NAME = "KanbanItem";
const ITEM_HANDLE_NAME = "KanbanItemHandle";
const OVERLAY_NAME = "KanbanOverlay";

const KANBAN_ERROR = {
  root: `${ROOT_NAME} components must be within ${ROOT_NAME}`,
  board: `${BOARD_NAME} must be within ${ROOT_NAME}`,
  column: `${COLUMN_NAME} must be within ${BOARD_NAME}`,
  item: `${ITEM_NAME} must be within ${COLUMN_NAME}`,
  itemHandle: `${ITEM_HANDLE_NAME} must be within ${ITEM_NAME}`,
  overlay: `${OVERLAY_NAME} must be within ${ROOT_NAME}`,
} as const;

interface KanbanContextValue<T> {
  id: string;
  items: Record<UniqueIdentifier, T[]>;
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  getItemValue: (item: T) => UniqueIdentifier;
  flatCursor: boolean;
}

const KanbanContext = React.createContext<KanbanContextValue<unknown> | null>(
  null,
);
KanbanContext.displayName = ROOT_NAME;

function useKanbanContext(name: keyof typeof KANBAN_ERROR) {
  const context = React.useContext(KanbanContext);
  if (!context) {
    throw new Error(KANBAN_ERROR[name]);
  }
  return context;
}

const UPDATE_THROTTLE_MS = 50;

interface GetItemValue<T> {
  /**
   * Callback that returns a unique identifier for each kanban item. Required for array of objects.
   * @example getItemValue={(item) => item.id}
   */
  getItemValue: (item: T) => UniqueIdentifier;
}

type KanbanProps<T> = Omit<DndContextProps, "collisionDetection"> &
  GetItemValue<T> & {
    value: Record<UniqueIdentifier, T[]>;
    onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void;
    onMove?: (event: DragEndEvent) => void;
    strategy?: SortableContextProps["strategy"];
    flatCursor?: boolean;
  } & (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>);

function Kanban<T>(props: KanbanProps<T>) {
  const {
    id = React.useId(),
    value,
    onValueChange,
    modifiers,
    strategy = verticalListSortingStrategy,
    sensors: sensorsProp,
    onMove,
    getItemValue: getItemValueProp,
    flatCursor = false,
    ...kanbanProps
  } = props;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const lastOverIdRef = React.useRef<UniqueIdentifier | null>(null);
  const isShiftingRef = React.useRef(false);
  const [clonedItems, setClonedItems] = React.useState<Record<
    UniqueIdentifier,
    T[]
  > | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = React.useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    }),
  );

  const getItemValue = React.useCallback(
    (item: T): UniqueIdentifier => {
      if (typeof item === "object" && !getItemValueProp) {
        throw new Error(
          "getItemValue is required when using array of objects.",
        );
      }
      return getItemValueProp
        ? getItemValueProp(item)
        : (item as UniqueIdentifier);
    },
    [getItemValueProp],
  );

  const getContainer = React.useCallback(
    (id: UniqueIdentifier) => {
      if (id in value) return id;

      for (const [columnId, items] of Object.entries(value)) {
        if (items.some((item) => getItemValue(item) === id)) {
          return columnId;
        }
      }

      return null;
    },
    [value, getItemValue],
  );

  const collisionDetection: CollisionDetection = React.useCallback(
    (args) => {
      if (activeId && activeId in value) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in value,
          ),
        });
      }

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (!overId) {
        if (isShiftingRef.current) {
          lastOverIdRef.current = activeId;
        }
        return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : [];
      }

      if (overId in value) {
        const containerItems = value[overId];
        if (containerItems && containerItems.length > 0) {
          const closestItem = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                containerItems.some(
                  (item) => getItemValue(item) === container.id,
                ),
            ),
          });

          if (closestItem.length > 0) {
            overId = closestItem[0]?.id ?? overId;
          }
        }
      }

      lastOverIdRef.current = overId;
      return [{ id: overId }];
    },
    [activeId, value, getItemValue],
  );

  const onDragOver = React.useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      const overId = over?.id;
      const now = Date.now();

      if (!overId || active.id in value) return;
      // Throttle updates to prevent excessive re-renders
      if (now - lastUpdateTime < UPDATE_THROTTLE_MS) return;

      const overContainer = getContainer(overId);
      const activeContainer = getContainer(active.id);

      if (!overContainer || !activeContainer) return;

      if (activeContainer !== overContainer) {
        const activeItems = value[activeContainer];
        const overItems = value[overContainer];

        if (!activeItems || !overItems) return;

        const overIndex = overItems.findIndex(
          (item) => getItemValue(item) === overId,
        );
        const activeIndex = activeItems.findIndex(
          (item) => getItemValue(item) === active.id,
        );

        if (activeIndex === -1) return;

        const activeItem = activeItems[activeIndex];
        if (!activeItem) return;

        let newIndex: number;

        if (overId in value) {
          newIndex = overItems.length;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
        }

        isShiftingRef.current = true;

        const newOverItems = [
          ...overItems.slice(0, newIndex),
          activeItem,
          ...overItems.slice(newIndex),
        ];

        const updatedItems: Record<UniqueIdentifier, T[]> = {
          ...value,
          [activeContainer]: activeItems.filter(
            (item) => getItemValue(item) !== active.id,
          ),
          [overContainer]: newOverItems,
        };

        setLastUpdateTime(now);
        onValueChange?.(updatedItems);
      }
    },
    [value, getContainer, getItemValue, onValueChange, lastUpdateTime],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        setClonedItems(null);
        isShiftingRef.current = false;
        return;
      }

      const activeContainer = getContainer(active.id);
      const overContainer = getContainer(over.id);

      console.log({ activeId: active.id, overId: over.id });

      if (!activeContainer || !overContainer) {
        setActiveId(null);
        setClonedItems(null);
        isShiftingRef.current = false;
        return;
      }

      const activeItems = value[activeContainer];
      const overItems = value[overContainer];

      if (!activeItems || !overItems) {
        setActiveId(null);
        setClonedItems(null);
        isShiftingRef.current = false;
        return;
      }

      if (activeContainer !== overContainer) {
        const activeIndex = activeItems.findIndex(
          (item) => getItemValue(item) === active.id,
        );
        const overIndex = overItems.findIndex(
          (item) => getItemValue(item) === over.id,
        );

        if (onMove) {
          onMove(event);
        } else {
          const newColumns = { ...value };
          const activeColumn = newColumns[activeContainer];
          const overColumn = newColumns[overContainer];

          if (!activeColumn || !overColumn) {
            setActiveId(null);
            setClonedItems(null);
            isShiftingRef.current = false;
            return;
          }

          const [movedItem] = activeColumn.splice(activeIndex, 1);
          if (!movedItem) {
            setActiveId(null);
            setClonedItems(null);
            isShiftingRef.current = false;
            return;
          }

          overColumn.splice(overIndex, 0, movedItem);
          onValueChange?.(newColumns);
        }
      } else {
        const items = value[activeContainer];
        if (!items) {
          setActiveId(null);
          setClonedItems(null);
          isShiftingRef.current = false;
          return;
        }

        const activeIndex = items.findIndex(
          (item) => getItemValue(item) === active.id,
        );
        const overIndex = items.findIndex(
          (item) => getItemValue(item) === over.id,
        );

        if (activeIndex !== overIndex) {
          if (onMove) {
            onMove(event);
          } else {
            const newColumns = { ...value };
            const columnItems = newColumns[activeContainer];
            if (!columnItems) {
              setActiveId(null);
              setClonedItems(null);
              isShiftingRef.current = false;
              return;
            }
            newColumns[activeContainer] = arrayMove(
              columnItems,
              activeIndex,
              overIndex,
            );
            onValueChange?.(newColumns);
          }
        }
      }
      setActiveId(null);
      setClonedItems(null);
      isShiftingRef.current = false;
    },
    [value, getItemValue, onMove, onValueChange, getContainer],
  );

  const contextValue = React.useMemo<KanbanContextValue<T>>(
    () => ({
      id,
      items: value,
      modifiers,
      strategy,
      activeId,
      setActiveId,
      getItemValue,
      flatCursor,
    }),
    [id, value, activeId, modifiers, strategy, getItemValue, flatCursor],
  );

  return (
    <KanbanContext.Provider value={contextValue as KanbanContextValue<unknown>}>
      <DndContext
        id={id}
        modifiers={modifiers}
        sensors={sensorsProp ?? sensors}
        collisionDetection={collisionDetection}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={composeEventHandlers(
          kanbanProps.onDragStart,
          ({ active }) => {
            setActiveId(active.id);
            setClonedItems(value);
          },
        )}
        onDragOver={composeEventHandlers(kanbanProps.onDragOver, onDragOver)}
        onDragEnd={composeEventHandlers(kanbanProps.onDragEnd, onDragEnd)}
        onDragCancel={composeEventHandlers(kanbanProps.onDragCancel, () => {
          if (clonedItems) {
            onValueChange?.(clonedItems);
          }
          setActiveId(null);
          setClonedItems(null);
          isShiftingRef.current = false;
        })}
        {...kanbanProps}
      />
    </KanbanContext.Provider>
  );
}

const KanbanBoardContext = React.createContext<boolean>(false);
KanbanBoardContext.displayName = BOARD_NAME;

interface KanbanBoardProps extends SlotProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (props, forwardedRef) => {
    const { asChild, ...boardProps } = props;
    useKanbanContext("board");

    const BoardSlot = asChild ? Slot : "div";

    return (
      <KanbanBoardContext.Provider value={true}>
        <BoardSlot
          {...boardProps}
          ref={forwardedRef}
          className={cn(
            "flex h-full w-full gap-4 overflow-x-auto p-4",
            props.className,
          )}
        />
      </KanbanBoardContext.Provider>
    );
  },
);
KanbanBoard.displayName = BOARD_NAME;

interface KanbanColumnProps extends SlotProps {
  value: UniqueIdentifier;
  children: React.ReactNode;
  asChild?: boolean;
}

const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  (props, forwardedRef) => {
    const { value, asChild, className, ...columnProps } = props;

    const context = useKanbanContext("board");
    const inBoard = React.useContext(KanbanBoardContext);
    if (!inBoard) {
      throw new Error(KANBAN_ERROR.column);
    }

    const ColumnSlot = asChild ? Slot : "div";

    const items = React.useMemo(() => {
      const items = context.items[value] ?? [];
      return items.map((item) => context.getItemValue(item));
    }, [context.items, value, context.getItemValue]);

    return (
      <SortableContext strategy={context.strategy} items={items}>
        <ColumnSlot
          {...columnProps}
          ref={forwardedRef}
          className={cn(
            "flex size-full flex-col gap-2 rounded-lg border bg-zinc-100 p-4 dark:bg-zinc-900",
            className,
          )}
        />
      </SortableContext>
    );
  },
);
KanbanColumn.displayName = COLUMN_NAME;

interface KanbanItemContextValue {
  id: string;
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanItemContext = React.createContext<KanbanItemContextValue>({
  id: "",
  attributes: {},
  listeners: undefined,
  setActivatorNodeRef: () => {},
  isDragging: false,
  disabled: false,
});
KanbanItemContext.displayName = ITEM_NAME;

interface KanbanItemProps extends SlotProps {
  value: UniqueIdentifier;
  asHandle?: boolean;
  asChild?: boolean;
  disabled?: boolean;
}

const KanbanItem = React.forwardRef<HTMLDivElement, KanbanItemProps>(
  (props, forwardedRef) => {
    const {
      value,
      style,
      asHandle,
      asChild,
      disabled,
      className,
      ...itemProps
    } = props;

    const id = React.useId();
    const context = useKanbanContext("item");
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: value, disabled });

    const composedRef = useComposedRefs(forwardedRef, (node) => {
      if (disabled) return;
      setNodeRef(node);
      if (asHandle) setActivatorNodeRef(node);
    });

    const composedStyle = React.useMemo<React.CSSProperties>(() => {
      return {
        opacity: isDragging || disabled ? 0.5 : 1,
        transform: CSS.Translate.toString(transform),
        transition,
        ...style,
      };
    }, [transform, transition, style, isDragging, disabled]);

    const ItemSlot = asChild ? Slot : "div";

    const itemContext = React.useMemo<KanbanItemContextValue>(
      () => ({
        id,
        attributes,
        listeners,
        setActivatorNodeRef,
        isDragging,
        disabled,
      }),
      [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled],
    );

    if (value === "") {
      throw new Error(`${ITEM_NAME} value cannot be an empty string.`);
    }

    return (
      <KanbanItemContext.Provider value={itemContext}>
        <ItemSlot
          id={id}
          data-dragging={isDragging ? "" : undefined}
          {...itemProps}
          {...(asHandle ? attributes : {})}
          {...(asHandle ? listeners : {})}
          ref={composedRef}
          style={composedStyle}
          className={cn(
            "data-[dragging]:focus-visible:outline-none data-[dragging]:focus-visible:ring-1 data-[dragging]:focus-visible:ring-ring data-[dragging]:focus-visible:ring-offset-1",
            {
              "touch-none select-none": asHandle,
              "cursor-default": context.flatCursor,
              "data-[dragging]:cursor-grabbing": !context.flatCursor,
              "cursor-grab": !isDragging && asHandle && !context.flatCursor,
              "pointer-events-none": disabled,
            },
            className,
          )}
        />
      </KanbanItemContext.Provider>
    );
  },
);
KanbanItem.displayName = ITEM_NAME;

interface KanbanItemHandleProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const KanbanItemHandle = React.forwardRef<
  HTMLButtonElement,
  KanbanItemHandleProps
>((props, forwardedRef) => {
  const { asChild, disabled, className, ...dragHandleProps } = props;

  const itemContext = React.useContext(KanbanItemContext);
  if (!itemContext) {
    throw new Error(KANBAN_ERROR.itemHandle);
  }
  const context = useKanbanContext("itemHandle");

  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = useComposedRefs(forwardedRef, (node) => {
    if (isDisabled) return;
    itemContext.setActivatorNodeRef(node);
  });

  const HandleSlot = asChild ? Slot : "button";

  return (
    <HandleSlot
      aria-controls={itemContext.id}
      data-dragging={itemContext.isDragging ? "" : undefined}
      ref={composedRef}
      {...dragHandleProps}
      {...itemContext.attributes}
      {...itemContext.listeners}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-[dragging]:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
});
KanbanItemHandle.displayName = ITEM_HANDLE_NAME;

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

interface KanbanOverlayProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DragOverlay>, "children"> {
  container?: HTMLElement | DocumentFragment | null;
  children?:
    | ((params: { value: UniqueIdentifier }) => React.ReactNode)
    | React.ReactNode;
}

function KanbanOverlay(props: KanbanOverlayProps) {
  const {
    container: containerProp,
    dropAnimation: dropAnimationProp,
    children,
    ...overlayProps
  } = props;
  const context = useKanbanContext("overlay");

  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  return ReactDOM.createPortal(
    <DragOverlay
      modifiers={context.modifiers}
      dropAnimation={dropAnimationProp ?? dropAnimation}
      className={cn(!context.flatCursor && "cursor-grabbing")}
      {...overlayProps}
    >
      {context.activeId ? (
        typeof children === "function" ? (
          children({ value: context.activeId })
        ) : (
          <KanbanItem value={context.activeId} asChild>
            {children}
          </KanbanItem>
        )
      ) : null}
    </DragOverlay>,
    container,
  );
}

const Root = Kanban;
const Board = KanbanBoard;
const Column = KanbanColumn;
const Item = KanbanItem;
const ItemHandle = KanbanItemHandle;
const Overlay = KanbanOverlay;

export {
  Board,
  Column,
  Item,
  ItemHandle,
  //
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  Overlay,
  Root,
};
