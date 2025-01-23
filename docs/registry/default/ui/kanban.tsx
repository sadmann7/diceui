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
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  type SortableContextProps,
  arrayMove,
  horizontalListSortingStrategy,
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

const coordinateGetter: KeyboardCoordinateGetter = (event, { context }) => {
  const { active, droppableRects, droppableContainers, collisionRect } =
    context;

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
  orientation: "horizontal" | "vertical";
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
    orientation?: "horizontal" | "vertical";
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
    orientation = "horizontal",
    onMove,
    getItemValue: getItemValueProp,
    flatCursor = false,
    ...kanbanProps
  } = props;

  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const lastOverIdRef = React.useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainerRef = React.useRef(false);
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
        if (recentlyMovedToNewContainerRef.current) {
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
      if (!over) return;

      const activeContainer = getContainer(active.id);
      const overContainer = getContainer(over.id);

      if (!activeContainer || !overContainer) return;

      if (activeContainer === overContainer) {
        const items = value[activeContainer];
        if (!items) return;

        const activeIndex = items.findIndex(
          (item) => getItemValue(item) === active.id,
        );
        const overIndex = items.findIndex(
          (item) => getItemValue(item) === over.id,
        );

        if (activeIndex !== overIndex) {
          const newColumns = { ...value };
          newColumns[activeContainer] = arrayMove(
            items,
            activeIndex,
            overIndex,
          );
          onValueChange?.(newColumns);
        }
      } else {
        const activeItems = value[activeContainer];
        const overItems = value[overContainer];

        if (!activeItems || !overItems) return;

        const activeIndex = activeItems.findIndex(
          (item) => getItemValue(item) === active.id,
        );

        if (activeIndex === -1) return;

        const activeItem = activeItems[activeIndex];
        if (!activeItem) return;

        const updatedItems = {
          ...value,
          [activeContainer]: activeItems.filter(
            (item) => getItemValue(item) !== active.id,
          ),
          [overContainer]: [...overItems, activeItem],
        };

        onValueChange?.(updatedItems);
        recentlyMovedToNewContainerRef.current = true;
      }
    },
    [value, getContainer, getItemValue, onValueChange],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        return;
      }

      if (active.id in value && over.id in value) {
        const activeIndex = Object.keys(value).indexOf(active.id as string);
        const overIndex = Object.keys(value).indexOf(over.id as string);

        if (activeIndex !== overIndex) {
          const orderedColumns = Object.keys(value);
          const newOrder = arrayMove(orderedColumns, activeIndex, overIndex);

          const newColumns: Record<UniqueIdentifier, T[]> = {};
          for (const key of newOrder) {
            const items = value[key];
            if (items) {
              newColumns[key] = items;
            }
          }

          onValueChange?.(newColumns);
        }
      } else {
        const activeContainer = getContainer(active.id);
        const overContainer = getContainer(over.id);

        if (!activeContainer || !overContainer) {
          setActiveId(null);
          return;
        }

        if (activeContainer === overContainer) {
          const items = value[activeContainer];
          if (!items) {
            setActiveId(null);
            return;
          }

          const activeIndex = items.findIndex(
            (item) => getItemValue(item) === active.id,
          );
          const overIndex = items.findIndex(
            (item) => getItemValue(item) === over.id,
          );

          if (activeIndex !== overIndex) {
            const newColumns = { ...value };
            newColumns[activeContainer] = arrayMove(
              items,
              activeIndex,
              overIndex,
            );
            onValueChange?.(newColumns);
          }
        }
      }

      setActiveId(null);
      recentlyMovedToNewContainerRef.current = false;
      onMove?.(event);
    },
    [value, getContainer, getItemValue, onValueChange, onMove],
  );

  const contextValue = React.useMemo<KanbanContextValue<T>>(
    () => ({
      id,
      items: value,
      modifiers,
      strategy,
      orientation,
      activeId,
      setActiveId,
      getItemValue,
      flatCursor,
    }),
    [
      id,
      value,
      activeId,
      modifiers,
      strategy,
      orientation,
      getItemValue,
      flatCursor,
    ],
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
          },
        )}
        onDragOver={composeEventHandlers(kanbanProps.onDragOver, onDragOver)}
        onDragEnd={composeEventHandlers(kanbanProps.onDragEnd, onDragEnd)}
        onDragCancel={composeEventHandlers(kanbanProps.onDragCancel, () => {
          setActiveId(null);
          recentlyMovedToNewContainerRef.current = false;
        })}
        {...kanbanProps}
      />
    </KanbanContext.Provider>
  );
}

const KanbanBoardContext = React.createContext<boolean>(false);
KanbanBoardContext.displayName = BOARD_NAME;

interface KanbanColumnContextValue {
  id: string;
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanColumnContext = React.createContext<KanbanColumnContextValue>({
  id: "",
  attributes: {},
  listeners: undefined,
  setActivatorNodeRef: () => {},
  isDragging: false,
  disabled: false,
});
KanbanColumnContext.displayName = COLUMN_NAME;

interface KanbanBoardProps extends SlotProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...boardProps } = props;
    const context = useKanbanContext("board");

    const BoardSlot = asChild ? Slot : "div";

    return (
      <KanbanBoardContext.Provider value={true}>
        <BoardSlot
          aria-orientation={context.orientation}
          data-orientation={context.orientation}
          {...boardProps}
          ref={forwardedRef}
          className={cn(
            "flex size-full gap-4",
            context.orientation === "horizontal" ? "flex-row" : "flex-col",
            className,
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
  asHandle?: boolean;
  disabled?: boolean;
}

const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  (props, forwardedRef) => {
    const {
      value,
      asChild,
      asHandle,
      disabled,
      className,
      style,
      ...columnProps
    } = props;

    const context = useKanbanContext("column");
    const inBoard = React.useContext(KanbanBoardContext);
    const inOverlay = React.useContext(KanbanOverlayContext);
    const id = React.useId();

    if (!inBoard && !inOverlay) {
      throw new Error(KANBAN_ERROR.column);
    }

    if (value === "") {
      throw new Error(`${ITEM_NAME} value cannot be an empty string.`);
    }

    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: value,
      disabled,
    });

    const composedRef = useComposedRefs(forwardedRef, (node) => {
      if (disabled) return;
      setNodeRef(node);
    });

    const composedStyle = React.useMemo<React.CSSProperties>(() => {
      return {
        transform: CSS.Transform.toString(transform),
        transition,
        ...style,
      };
    }, [transform, transition, style]);

    const items = React.useMemo(() => {
      const items = context.items[value] ?? [];
      return items.map((item) => context.getItemValue(item));
    }, [context.items, value, context.getItemValue]);

    const columnContext = React.useMemo<KanbanColumnContextValue>(
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

    const ColumnSlot = asChild ? Slot : "div";

    return (
      <KanbanColumnContext.Provider value={columnContext}>
        <SortableContext
          strategy={
            context.orientation === "horizontal"
              ? horizontalListSortingStrategy
              : verticalListSortingStrategy
          }
          items={items}
        >
          <ColumnSlot
            data-dragging={isDragging ? "" : undefined}
            {...columnProps}
            {...(asHandle ? attributes : {})}
            {...(asHandle ? listeners : {})}
            aria-disabled={disabled}
            ref={composedRef}
            style={composedStyle}
            className={cn(
              "flex size-full flex-col gap-2 rounded-lg border bg-zinc-100 p-4 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-zinc-900",
              {
                "touch-none select-none": asHandle,
                "cursor-default": context.flatCursor,
                "data-[dragging]:cursor-grabbing": !context.flatCursor,
                "cursor-grab": !isDragging && asHandle && !context.flatCursor,
                "opacity-50": isDragging,
                "pointer-events-none opacity-50": disabled,
              },
              className,
            )}
          />
        </SortableContext>
      </KanbanColumnContext.Provider>
    );
  },
);
KanbanColumn.displayName = COLUMN_NAME;
interface KanbanColumnHandleProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const KanbanColumnHandle = React.forwardRef<
  HTMLButtonElement,
  KanbanColumnHandleProps
>((props, forwardedRef) => {
  const { asChild, disabled, className, ...handleProps } = props;
  const columnContext = React.useContext(KanbanColumnContext);
  if (!columnContext) {
    throw new Error("KanbanColumnHandle must be used within a KanbanColumn");
  }
  const context = useKanbanContext("column");

  const isDisabled = disabled ?? columnContext.disabled;

  const composedRef = useComposedRefs(forwardedRef, (node) => {
    if (isDisabled) return;
    columnContext.setActivatorNodeRef(node);
  });

  const HandleSlot = asChild ? Slot : "button";

  return (
    <HandleSlot
      aria-controls={columnContext.id}
      data-dragging={columnContext.isDragging ? "" : undefined}
      {...handleProps}
      {...columnContext.attributes}
      {...columnContext.listeners}
      ref={composedRef}
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
KanbanColumnHandle.displayName = "KanbanColumnHandle";

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
    const context = useKanbanContext("item");
    const inBoard = React.useContext(KanbanBoardContext);
    const inOverlay = React.useContext(KanbanOverlayContext);

    if (!inBoard && !inOverlay) {
      throw new Error(KANBAN_ERROR.item);
    }

    const id = React.useId();
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: value, disabled });

    if (value === "") {
      throw new Error(`${ITEM_NAME} value cannot be an empty string.`);
    }

    const composedRef = useComposedRefs(forwardedRef, (node) => {
      if (disabled) return;
      setNodeRef(node);
    });

    const composedStyle = React.useMemo<React.CSSProperties>(() => {
      return {
        transform: CSS.Transform.toString(transform),
        transition,
        ...style,
      };
    }, [transform, transition, style]);

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

    const ItemSlot = asChild ? Slot : "div";

    return (
      <KanbanItemContext.Provider value={itemContext}>
        <ItemSlot
          data-dragging={isDragging ? "" : undefined}
          {...itemProps}
          {...(asHandle ? attributes : {})}
          {...(asHandle ? listeners : {})}
          tabIndex={disabled ? undefined : 0}
          ref={composedRef}
          style={composedStyle}
          className={cn(
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
            {
              "touch-none select-none": asHandle,
              "cursor-default": context.flatCursor,
              "data-[dragging]:cursor-grabbing": !context.flatCursor,
              "cursor-grab": !isDragging && asHandle && !context.flatCursor,
              "opacity-50": isDragging,
              "pointer-events-none opacity-50": disabled,
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
      {...dragHandleProps}
      {...itemContext.attributes}
      {...itemContext.listeners}
      ref={composedRef}
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

const KanbanOverlayContext = React.createContext(false);
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
    | ((params: {
        value: UniqueIdentifier;
        type: "column" | "item";
      }) => React.ReactNode)
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
      <KanbanOverlayContext.Provider value={true}>
        {context.activeId && children
          ? typeof children === "function"
            ? children({
                value: context.activeId,
                type: context.activeId in context.items ? "column" : "item",
              })
            : children
          : null}
      </KanbanOverlayContext.Provider>
    </DragOverlay>,
    container,
  );
}

const Root = Kanban;
const Board = KanbanBoard;
const Column = KanbanColumn;
const ColumnHandle = KanbanColumnHandle;
const Item = KanbanItem;
const ItemHandle = KanbanItemHandle;
const Overlay = KanbanOverlay;

export {
  Root,
  Board,
  Column,
  ColumnHandle,
  Item,
  ItemHandle,
  Overlay,
  //
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
};
