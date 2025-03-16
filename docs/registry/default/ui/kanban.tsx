"use client";

import {
  type Announcements,
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
  type AnimateLayoutChanges,
  SortableContext,
  type SortableContextProps,
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot } from "@radix-ui/react-slot";
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

    if (!active || !collisionRect) return;

    const filteredContainers: DroppableContainer[] = [];

    for (const entry of droppableContainers.getEnabled()) {
      if (!entry || entry?.disabled) return;

      const rect = droppableRects.get(entry.id);

      if (!rect) return;

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
const COLUMN_HANDLE_NAME = "KanbanColumnHandle";
const ITEM_NAME = "KanbanItem";
const ITEM_HANDLE_NAME = "KanbanItemHandle";
const OVERLAY_NAME = "KanbanOverlay";

const KANBAN_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [BOARD_NAME]: `\`${BOARD_NAME}\` must be within \`${ROOT_NAME}\``,
  [COLUMN_NAME]: `\`${COLUMN_NAME}\` must be within \`${BOARD_NAME}\``,
  [COLUMN_HANDLE_NAME]: `\`${COLUMN_HANDLE_NAME}\` must be within \`${COLUMN_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${COLUMN_NAME}\``,
  [ITEM_HANDLE_NAME]: `\`${ITEM_HANDLE_NAME}\` must be within \`${ITEM_NAME}\``,
  [OVERLAY_NAME]: `\`${OVERLAY_NAME}\` must be within \`${ROOT_NAME}\``,
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

function useKanbanContext(name: keyof typeof KANBAN_ERRORS) {
  const context = React.useContext(KanbanContext);
  if (!context) {
    throw new Error(KANBAN_ERRORS[name]);
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
    onMove?: (
      event: DragEndEvent & { activeIndex: number; overIndex: number },
    ) => void;
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
    orientation = "horizontal",
    onMove,
    getItemValue: getItemValueProp,
    accessibility,
    flatCursor = false,
    ...kanbanProps
  } = props;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const lastOverIdRef = React.useRef<UniqueIdentifier | null>(null);
  const hasMovedRef = React.useRef(false);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
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

  const getColumn = React.useCallback(
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
        if (hasMovedRef.current) {
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

      const activeColumn = getColumn(active.id);
      const overColumn = getColumn(over.id);

      if (!activeColumn || !overColumn) return;

      if (activeColumn === overColumn) {
        const items = value[activeColumn];
        if (!items) return;

        const activeIndex = items.findIndex(
          (item) => getItemValue(item) === active.id,
        );
        const overIndex = items.findIndex(
          (item) => getItemValue(item) === over.id,
        );

        if (activeIndex !== overIndex) {
          const newColumns = { ...value };
          newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex);
          onValueChange?.(newColumns);
        }
      } else {
        const activeItems = value[activeColumn];
        const overItems = value[overColumn];

        if (!activeItems || !overItems) return;

        const activeIndex = activeItems.findIndex(
          (item) => getItemValue(item) === active.id,
        );

        if (activeIndex === -1) return;

        const activeItem = activeItems[activeIndex];
        if (!activeItem) return;

        const updatedItems = {
          ...value,
          [activeColumn]: activeItems.filter(
            (item) => getItemValue(item) !== active.id,
          ),
          [overColumn]: [...overItems, activeItem],
        };

        onValueChange?.(updatedItems);
        hasMovedRef.current = true;
      }
    },
    [value, getColumn, getItemValue, onValueChange],
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

          if (onMove) {
            onMove({
              ...event,
              activeIndex,
              overIndex,
            });
          } else {
            onValueChange?.(newColumns);
          }
        }
      } else {
        const activeColumn = getColumn(active.id);
        const overColumn = getColumn(over.id);

        if (!activeColumn || !overColumn) {
          setActiveId(null);
          return;
        }

        if (activeColumn === overColumn) {
          const items = value[activeColumn];
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
            newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex);
            if (onMove) {
              onMove({
                ...event,
                activeIndex,
                overIndex,
              });
            } else {
              onValueChange?.(newColumns);
            }
          }
        }
      }

      setActiveId(null);
      hasMovedRef.current = false;
    },
    [value, getColumn, getItemValue, onValueChange, onMove],
  );

  const announcements: Announcements = React.useMemo(
    () => ({
      onDragStart({ active }) {
        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        const position = isColumn
          ? Object.keys(value).indexOf(active.id as string) + 1
          : (() => {
              const column = getColumn(active.id);
              if (!column || !value[column]) return 1;
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === active.id,
                ) + 1
              );
            })();
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(active.id);
              return column ? (value[column]?.length ?? 0) : 0;
            })();

        return `Picked up ${itemType} at position ${position} of ${total}`;
      },
      onDragOver({ active, over }) {
        if (!over) return;

        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        const position = isColumn
          ? Object.keys(value).indexOf(over.id as string) + 1
          : (() => {
              const column = getColumn(over.id);
              if (!column || !value[column]) return 1;
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === over.id,
                ) + 1
              );
            })();
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(over.id);
              return column ? (value[column]?.length ?? 0) : 0;
            })();

        const overColumn = getColumn(over.id);
        const activeColumn = getColumn(active.id);

        if (isColumn) {
          return `${itemType} is now at position ${position} of ${total}`;
        }

        if (activeColumn !== overColumn) {
          return `${itemType} is now at position ${position} of ${total} in ${overColumn}`;
        }

        return `${itemType} is now at position ${position} of ${total}`;
      },
      onDragEnd({ active, over }) {
        if (!over) return;

        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        const position = isColumn
          ? Object.keys(value).indexOf(over.id as string) + 1
          : (() => {
              const column = getColumn(over.id);
              if (!column || !value[column]) return 1;
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === over.id,
                ) + 1
              );
            })();
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(over.id);
              return column ? (value[column]?.length ?? 0) : 0;
            })();

        const overColumn = getColumn(over.id);
        const activeColumn = getColumn(active.id);

        if (isColumn) {
          return `${itemType} was dropped at position ${position} of ${total}`;
        }

        if (activeColumn !== overColumn) {
          return `${itemType} was dropped at position ${position} of ${total} in ${overColumn}`;
        }

        return `${itemType} was dropped at position ${position} of ${total}`;
      },
      onDragCancel({ active }) {
        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        return `Dragging was cancelled. ${itemType} was dropped.`;
      },
    }),
    [value, getColumn, getItemValue],
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
        sensors={sensors}
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
          hasMovedRef.current = false;
        })}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: `
            To pick up a kanban item or column, press space or enter.
            While dragging, use the arrow keys to move the item.
            Press space or enter again to drop the item in its new position, or press escape to cancel.
          `,
          },
          ...accessibility,
        }}
        {...kanbanProps}
      />
    </KanbanContext.Provider>
  );
}

const KanbanBoardContext = React.createContext<boolean>(false);
KanbanBoardContext.displayName = BOARD_NAME;

interface KanbanBoardProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  asChild?: boolean;
}

const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...boardProps } = props;
    const context = useKanbanContext(BOARD_NAME);

    const columns = React.useMemo(() => {
      return Object.keys(context.items);
    }, [context.items]);

    const BoardPrimitive = asChild ? Slot : "div";

    return (
      <KanbanBoardContext.Provider value={true}>
        <SortableContext
          items={columns}
          strategy={
            context.orientation === "horizontal"
              ? horizontalListSortingStrategy
              : verticalListSortingStrategy
          }
        >
          <BoardPrimitive
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
        </SortableContext>
      </KanbanBoardContext.Provider>
    );
  },
);
KanbanBoard.displayName = BOARD_NAME;

interface KanbanColumnContextValue {
  id: string;
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanColumnContext =
  React.createContext<KanbanColumnContextValue | null>(null);
KanbanColumnContext.displayName = COLUMN_NAME;

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

interface KanbanColumnProps extends React.ComponentPropsWithoutRef<"div"> {
  value: UniqueIdentifier;
  children: React.ReactNode;
  asChild?: boolean;
  asHandle?: boolean;
  disabled?: boolean;
}

const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  (props, forwardedRef) => {
    const {
      id = React.useId(),
      value,
      asChild,
      asHandle,
      disabled,
      className,
      style,
      ...columnProps
    } = props;
    const context = useKanbanContext(COLUMN_NAME);
    const inBoard = React.useContext(KanbanBoardContext);
    const inOverlay = React.useContext(KanbanOverlayContext);

    if (!inBoard && !inOverlay) {
      throw new Error(KANBAN_ERRORS[COLUMN_NAME]);
    }

    if (value === "") {
      throw new Error(`\`${COLUMN_NAME}\` value cannot be an empty string`);
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
      animateLayoutChanges,
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

    const ColumnPrimitive = asChild ? Slot : "div";

    return (
      <KanbanColumnContext.Provider value={columnContext}>
        <SortableContext
          items={items}
          strategy={
            context.orientation === "horizontal"
              ? horizontalListSortingStrategy
              : verticalListSortingStrategy
          }
        >
          <ColumnPrimitive
            id={id}
            data-dragging={isDragging ? "" : undefined}
            {...columnProps}
            {...(asHandle ? attributes : {})}
            {...(asHandle ? listeners : {})}
            aria-disabled={disabled}
            ref={composedRef}
            style={composedStyle}
            className={cn(
              "flex size-full flex-col gap-2 rounded-lg border bg-zinc-100 p-2.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-zinc-900",
              {
                "touch-none select-none": asHandle,
                "cursor-default": context.flatCursor,
                "data-dragging:cursor-grabbing": !context.flatCursor,
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
  const { asChild, disabled, className, ...columnHandleProps } = props;
  const context = useKanbanContext(COLUMN_NAME);
  const columnContext = React.useContext(KanbanColumnContext);
  if (!columnContext) {
    throw new Error(KANBAN_ERRORS[COLUMN_HANDLE_NAME]);
  }

  const isDisabled = disabled ?? columnContext.disabled;

  const composedRef = useComposedRefs(forwardedRef, (node) => {
    if (isDisabled) return;
    columnContext.setActivatorNodeRef(node);
  });

  const HandlePrimitive = asChild ? Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={columnContext.id}
      data-dragging={columnContext.isDragging ? "" : undefined}
      {...columnHandleProps}
      {...columnContext.attributes}
      {...columnContext.listeners}
      ref={composedRef}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
});
KanbanColumnHandle.displayName = COLUMN_HANDLE_NAME;

interface KanbanItemContextValue {
  id: string;
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanItemContext = React.createContext<KanbanItemContextValue | null>(
  null,
);
KanbanItemContext.displayName = ITEM_NAME;

interface KanbanItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: UniqueIdentifier;
  asHandle?: boolean;
  asChild?: boolean;
  disabled?: boolean;
}

const KanbanItem = React.forwardRef<HTMLDivElement, KanbanItemProps>(
  (props, forwardedRef) => {
    const {
      id = React.useId(),
      value,
      style,
      asHandle,
      asChild,
      disabled,
      className,
      ...itemProps
    } = props;
    const context = useKanbanContext(ITEM_NAME);
    const inBoard = React.useContext(KanbanBoardContext);
    const inOverlay = React.useContext(KanbanOverlayContext);

    if (!inBoard && !inOverlay) {
      throw new Error(KANBAN_ERRORS[ITEM_NAME]);
    }

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
      throw new Error(`\`${ITEM_NAME}\` value cannot be an empty string`);
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

    const ItemPrimitive = asChild ? Slot : "div";

    return (
      <KanbanItemContext.Provider value={itemContext}>
        <ItemPrimitive
          id={id}
          data-dragging={isDragging ? "" : undefined}
          {...itemProps}
          {...(asHandle ? attributes : {})}
          {...(asHandle ? listeners : {})}
          tabIndex={disabled ? undefined : 0}
          ref={composedRef}
          style={composedStyle}
          className={cn(
            "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
            {
              "touch-none select-none": asHandle,
              "cursor-default": context.flatCursor,
              "data-dragging:cursor-grabbing": !context.flatCursor,
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
  const { asChild, disabled, className, ...itemHandleProps } = props;
  const itemContext = React.useContext(KanbanItemContext);
  if (!itemContext) {
    throw new Error(KANBAN_ERRORS[ITEM_HANDLE_NAME]);
  }
  const context = useKanbanContext(ITEM_HANDLE_NAME);

  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = useComposedRefs(forwardedRef, (node) => {
    if (isDisabled) return;
    itemContext.setActivatorNodeRef(node);
  });

  const HandlePrimitive = asChild ? Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-dragging={itemContext.isDragging ? "" : undefined}
      {...itemHandleProps}
      {...itemContext.attributes}
      {...itemContext.listeners}
      ref={composedRef}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
});
KanbanItemHandle.displayName = ITEM_HANDLE_NAME;

const KanbanOverlayContext = React.createContext(false);
KanbanOverlayContext.displayName = OVERLAY_NAME;

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
  container?: Element | DocumentFragment | null;
  children?:
    | ((params: {
        value: UniqueIdentifier;
        variant: "column" | "item";
      }) => React.ReactNode)
    | React.ReactNode;
}

function KanbanOverlay(props: KanbanOverlayProps) {
  const { container: containerProp, children, ...overlayProps } = props;
  const context = useKanbanContext(OVERLAY_NAME);

  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  const variant =
    context.activeId && context.activeId in context.items ? "column" : "item";

  return ReactDOM.createPortal(
    <DragOverlay
      modifiers={context.modifiers}
      dropAnimation={dropAnimation}
      className={cn(!context.flatCursor && "cursor-grabbing")}
      {...overlayProps}
    >
      <KanbanOverlayContext.Provider value={true}>
        {context.activeId && children
          ? typeof children === "function"
            ? children({
                value: context.activeId,
                variant,
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
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  //
  Root,
  Board,
  Column,
  ColumnHandle,
  Item,
  ItemHandle,
  Overlay,
};
