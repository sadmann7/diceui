"use client";

import {
  type Active,
  type Announcements,
  closestCenter,
  closestCorners,
  type CollisionDetection,
  defaultDropAnimationSideEffects,
  DndContext,
  type DndContextProps,
  type DragCancelEvent,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  type DroppableContainer,
  getFirstCollision,
  KeyboardCode,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  type Over,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  type AnimateLayoutChanges,
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  SortableContext,
  type SortableContextProps,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS, isKeyboardEvent } from "@dnd-kit/utilities";
import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import { useComposedRefs } from "radix-ui/internal";
import * as React from "react";
import * as ReactDOM from "react-dom";

const directions = new Set<string>([
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
]);

function getIsDirectionCode(code: string): code is KeyboardCode {
  return directions.has(code);
}

const coordinateGetter: KeyboardCoordinateGetter = (event, { context }) => {
  const { active, droppableRects, droppableContainers, collisionRect } =
    context;

  if (getIsDirectionCode(event.code)) {
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

interface KanbanPosition {
  column: UniqueIdentifier;
  index: number;
  total: number;
}

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

function useKanbanContext(consumerName: string) {
  const context = React.useContext(KanbanContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
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
  (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>) & {
    value: Record<UniqueIdentifier, T[]>;
    onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void;
    onMove?: (
      event: DragEndEvent & { activeIndex: number; overIndex: number },
    ) => void;
    strategy?: SortableContextProps["strategy"];
    orientation?: "horizontal" | "vertical";
    flatCursor?: boolean;
    getItemLabel?: (item: T) => string;
    getColumnLabel?: (column: UniqueIdentifier) => string;
  };

function Kanban<T>(props: KanbanProps<T>) {
  const {
    value,
    onValueChange,
    modifiers,
    strategy = verticalListSortingStrategy,
    orientation = "horizontal",
    onMove,
    getItemValue: getItemValueProp,
    getItemLabel: getItemLabelProp,
    getColumnLabel: getColumnLabelProp,
    accessibility,
    flatCursor = false,
    onDragStart: onDragStartProp,
    onDragOver: onDragOverProp,
    onDragEnd: onDragEndProp,
    onDragCancel: onDragCancelProp,
    ...kanbanProps
  } = props;

  const id = React.useId();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const lastOverIdRef = React.useRef<UniqueIdentifier | null>(null);
  const hasMovedRef = React.useRef(false);
  const isKeyboardDragRef = React.useRef(false);
  const startPositionRef = React.useRef<KanbanPosition | null>(null);
  const announcedPositionRef = React.useRef<KanbanPosition | null>(null);
  const valueBeforeDragRef = React.useRef<Record<UniqueIdentifier, T[]> | null>(
    null,
  );
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  const getItemValue = React.useCallback(
    (item: T): UniqueIdentifier => {
      if (typeof item === "object" && !getItemValueProp) {
        throw new Error(
          "`getItemValue` is required when using array of objects",
        );
      }
      return getItemValueProp
        ? getItemValueProp(item)
        : (item as UniqueIdentifier);
    },
    [getItemValueProp],
  );

  const itemColumns = React.useMemo(() => {
    const columns = new Map<UniqueIdentifier, UniqueIdentifier>();
    for (const [columnId, columnItems] of Object.entries(value)) {
      for (const item of columnItems) {
        columns.set(getItemValue(item), columnId);
      }
    }
    return columns;
  }, [value, getItemValue]);

  const getColumn = React.useCallback(
    (targetId: UniqueIdentifier) => {
      if (targetId in value) return targetId;
      return itemColumns.get(targetId) ?? null;
    },
    [value, itemColumns],
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
                String(itemColumns.get(container.id)) === String(overId),
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
    [activeId, value, itemColumns],
  );

  const onDragStart = React.useCallback(
    (event: DragStartEvent) => {
      onDragStartProp?.(event);
      isKeyboardDragRef.current = isKeyboardEvent(event.activatorEvent);
      valueBeforeDragRef.current = value;
      setActiveId(event.active.id);
    },
    [value, onDragStartProp],
  );

  const onDragOver = React.useCallback(
    (event: DragOverEvent) => {
      onDragOverProp?.(event);

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

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
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

        const overIndex = overItems.findIndex(
          (item) => getItemValue(item) === over.id,
        );
        const activeRect = active.rect.current.translated;
        const isBelowOverItem =
          !!activeRect && activeRect.top > over.rect.top + over.rect.height;
        const insertIndex =
          overIndex === -1
            ? overItems.length
            : overIndex + (isBelowOverItem ? 1 : 0);

        const updatedItems = {
          ...value,
          [activeColumn]: activeItems.filter(
            (item) => getItemValue(item) !== active.id,
          ),
          [overColumn]: [
            ...overItems.slice(0, insertIndex),
            activeItem,
            ...overItems.slice(insertIndex),
          ],
        };

        onValueChange?.(updatedItems);
        hasMovedRef.current = true;
      }
    },
    [value, getColumn, getItemValue, onValueChange, onDragOverProp],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      onDragEndProp?.(event);
      setActiveId(null);
      hasMovedRef.current = false;
      valueBeforeDragRef.current = null;

      const { active, over } = event;
      if (!over) return;

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
            onMove({ ...event, activeIndex, overIndex });
          } else {
            onValueChange?.(newColumns);
          }
        }
      } else {
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

          if (
            activeIndex !== -1 &&
            overIndex !== -1 &&
            activeIndex !== overIndex
          ) {
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
    },
    [value, getColumn, getItemValue, onValueChange, onMove, onDragEndProp],
  );

  const onDragCancel = React.useCallback(
    (event: DragCancelEvent) => {
      onDragCancelProp?.(event);
      setActiveId(null);
      hasMovedRef.current = false;

      const valueBeforeDrag = valueBeforeDragRef.current;
      valueBeforeDragRef.current = null;
      if (valueBeforeDrag && valueBeforeDrag !== value) {
        onValueChange?.(valueBeforeDrag);
      }
    },
    [value, onValueChange, onDragCancelProp],
  );

  const announcements: Announcements = React.useMemo(() => {
    const columns = Object.keys(value);

    function getColumnLabel(column: UniqueIdentifier) {
      return getColumnLabelProp
        ? getColumnLabelProp(String(column))
        : String(column);
    }

    function getLabel(id: UniqueIdentifier) {
      if (id in value) return getColumnLabel(id);
      const column = getColumn(id);
      const item = column
        ? value[column]?.find((item) => getItemValue(item) === id)
        : undefined;
      if (item === undefined || !getItemLabelProp) return String(id);
      return getItemLabelProp(item);
    }

    function getPosition(active: Active, over: Over | null) {
      if (active.id in value) {
        const column = over && over.id in value ? over.id : active.id;
        return {
          column,
          index: columns.indexOf(String(column)),
          total: columns.length,
        };
      }

      const activeColumn = getColumn(active.id);
      if (!activeColumn) return null;
      const activeItems = value[activeColumn] ?? [];
      const overColumn = over ? getColumn(over.id) : null;

      if (!over || !overColumn || overColumn === activeColumn) {
        const overIndex = over
          ? activeItems.findIndex((item) => getItemValue(item) === over.id)
          : -1;
        return {
          column: activeColumn,
          index:
            overIndex === -1
              ? activeItems.findIndex(
                  (item) => getItemValue(item) === active.id,
                )
              : overIndex,
          total: activeItems.length,
        };
      }

      const overItems = value[overColumn] ?? [];
      const overIndex = overItems.findIndex(
        (item) => getItemValue(item) === over.id,
      );
      const activeRect = active.rect.current.translated;
      const isBelowOverItem =
        !!activeRect && activeRect.top > over.rect.top + over.rect.height;
      return {
        column: overColumn,
        index:
          overIndex === -1
            ? overItems.length
            : overIndex + (isBelowOverItem ? 1 : 0),
        total: overItems.length + 1,
      };
    }

    function getPlace(id: UniqueIdentifier, position: KanbanPosition) {
      const place = `position ${position.index + 1} of ${position.total}`;
      if (id in value) return place;
      return `${getColumnLabel(position.column)}, ${place}`;
    }

    return {
      onDragStart({ active }) {
        const position = getPosition(active, null);
        startPositionRef.current = position;
        announcedPositionRef.current = position;
        const label = getLabel(active.id);
        const message = position
          ? `Grabbed ${label}, ${getPlace(active.id, position)}.`
          : `Grabbed ${label}.`;
        if (!isKeyboardDragRef.current) return message;
        return `${message} Use the arrow keys to move it, Space or Enter to drop it, or Escape to cancel.`;
      },
      onDragOver({ active, over }) {
        const position = getPosition(active, over);
        const announced = announcedPositionRef.current;
        if (
          !position ||
          (announced?.column === position.column &&
            announced.index === position.index)
        ) {
          return undefined;
        }
        announcedPositionRef.current = position;
        const place =
          active.id in value || announced?.column === position.column
            ? `position ${position.index + 1} of ${position.total}`
            : getPlace(active.id, position);
        return `${getLabel(active.id)}, ${place}.`;
      },
      onDragEnd({ active, over }) {
        const position = getPosition(active, over);
        const label = getLabel(active.id);
        if (!position) return `Dropped ${label}.`;
        const place = `position ${position.index + 1} of ${position.total}`;
        if (active.id in value) return `Dropped ${label} at ${place}.`;
        return `Dropped ${label} in ${getColumnLabel(position.column)} at ${place}.`;
      },
      onDragCancel({ active }) {
        const position = startPositionRef.current;
        const label = getLabel(active.id);
        if (!position) return `Cancelled. ${label} is back in place.`;
        const place = `position ${position.index + 1} of ${position.total}`;
        if (active.id in value)
          return `Cancelled. ${label} is back at ${place}.`;
        return `Cancelled. ${label} is back in ${getColumnLabel(position.column)} at ${place}.`;
      },
    };
  }, [value, getColumn, getItemValue, getItemLabelProp, getColumnLabelProp]);

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
        collisionDetection={collisionDetection}
        modifiers={modifiers}
        sensors={sensors}
        {...kanbanProps}
        id={id}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              "To pick up an item or column, press Space or Enter. Use the arrow keys to move it, Space or Enter to drop it, or Escape to cancel.",
          },
          ...accessibility,
        }}
      />
    </KanbanContext.Provider>
  );
}

const KanbanBoardContext = React.createContext<boolean>(false);

interface KanbanBoardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  asChild?: boolean;
}

function KanbanBoard(props: KanbanBoardProps) {
  const { asChild, className, ref, ...boardProps } = props;

  const context = useKanbanContext(BOARD_NAME);

  const columns = React.useMemo(() => {
    return Object.keys(context.items);
  }, [context.items]);

  const BoardPrimitive = asChild ? SlotPrimitive.Slot : "div";

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
          data-slot="kanban-board"
          {...boardProps}
          ref={ref}
          className={cn(
            "cn-kanban-board",
            context.orientation === "horizontal" ? "flex-row" : "flex-col",
            className,
          )}
        />
      </SortableContext>
    </KanbanBoardContext.Provider>
  );
}

interface KanbanColumnContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanColumnContext =
  React.createContext<KanbanColumnContextValue | null>(null);

function useKanbanColumnContext(consumerName: string) {
  const context = React.useContext(KanbanColumnContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${COLUMN_NAME}\``,
    );
  }
  return context;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

interface KanbanColumnProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier;
  children: React.ReactNode;
  asChild?: boolean;
  asHandle?: boolean;
  disabled?: boolean;
}

function KanbanColumn(props: KanbanColumnProps) {
  const {
    value,
    asChild,
    asHandle,
    disabled,
    className,
    style,
    ref,
    id: idProp,
    ...columnProps
  } = props;

  const instanceId = React.useId();
  const id = idProp ?? instanceId;
  const context = useKanbanContext(COLUMN_NAME);
  const inBoard = React.useContext(KanbanBoardContext);
  const inOverlay = React.useContext(KanbanOverlayContext);

  if (!inBoard && !inOverlay) {
    throw new Error(
      `\`${COLUMN_NAME}\` must be used within \`${BOARD_NAME}\` or \`${OVERLAY_NAME}\``,
    );
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

  const onNodeRefChange = React.useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const composedRef = useComposedRefs(ref, onNodeRefChange);

  const composedStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      ...style,
    };
  }, [transform, transition, style]);

  const items = React.useMemo(() => {
    const columnItems = context.items[value] ?? [];
    return columnItems.map((item) => context.getItemValue(item));
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- whole context would recompute items whenever activeId changes
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

  const ColumnPrimitive = asChild ? SlotPrimitive.Slot : "div";

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
          data-disabled={disabled ? "" : undefined}
          data-dragging={isDragging ? "" : undefined}
          data-slot="kanban-column"
          {...columnProps}
          {...(asHandle && !disabled ? attributes : {})}
          {...(asHandle && !disabled ? listeners : {})}
          ref={composedRef}
          style={composedStyle}
          className={cn(
            "cn-kanban-column",
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
}

interface KanbanColumnHandleProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function KanbanColumnHandle(props: KanbanColumnHandleProps) {
  const { asChild, disabled, className, ref, ...columnHandleProps } = props;

  const context = useKanbanContext(COLUMN_NAME);
  const columnContext = useKanbanColumnContext(COLUMN_HANDLE_NAME);

  const isDisabled = disabled ?? columnContext.disabled;

  const { setActivatorNodeRef } = columnContext;

  const onActivatorNodeRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (isDisabled) return;
      setActivatorNodeRef(node);
    },
    [isDisabled, setActivatorNodeRef],
  );

  const composedRef = useComposedRefs(ref, onActivatorNodeRef);

  const HandlePrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={columnContext.id}
      data-disabled={isDisabled ? "" : undefined}
      data-dragging={columnContext.isDragging ? "" : undefined}
      data-slot="kanban-column-handle"
      {...columnHandleProps}
      {...(isDisabled ? {} : columnContext.attributes)}
      {...(isDisabled ? {} : columnContext.listeners)}
      ref={composedRef}
      className={cn(
        "cn-kanban-column-handle",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

interface KanbanItemContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanItemContext = React.createContext<KanbanItemContextValue | null>(
  null,
);

function useKanbanItemContext(consumerName: string) {
  const context = React.useContext(KanbanItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

interface KanbanItemProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier;
  asHandle?: boolean;
  asChild?: boolean;
  disabled?: boolean;
}

function KanbanItem(props: KanbanItemProps) {
  const {
    value,
    style,
    asHandle,
    asChild,
    disabled,
    className,
    ref,
    id: idProp,
    ...itemProps
  } = props;

  const instanceId = React.useId();
  const id = idProp ?? instanceId;
  const context = useKanbanContext(ITEM_NAME);
  const inBoard = React.useContext(KanbanBoardContext);
  const inOverlay = React.useContext(KanbanOverlayContext);

  if (!inBoard && !inOverlay) {
    throw new Error(`\`${ITEM_NAME}\` must be used within \`${BOARD_NAME}\``);
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

  // Kept stable so React doesn't detach and reattach dnd-kit's node ref on
  // every render, which retriggers droppable measuring during a drag.
  const onNodeRef = React.useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const composedRef = useComposedRefs(ref, onNodeRef);

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

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <KanbanItemContext.Provider value={itemContext}>
      <ItemPrimitive
        id={id}
        data-disabled={disabled ? "" : undefined}
        data-dragging={isDragging ? "" : undefined}
        data-slot="kanban-item"
        {...itemProps}
        {...(asHandle && !disabled ? attributes : {})}
        {...(asHandle && !disabled ? listeners : {})}
        ref={composedRef}
        style={composedStyle}
        className={cn(
          "cn-kanban-item",
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
}

interface KanbanItemHandleProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function KanbanItemHandle(props: KanbanItemHandleProps) {
  const { asChild, disabled, className, ref, ...itemHandleProps } = props;

  const context = useKanbanContext(ITEM_HANDLE_NAME);
  const itemContext = useKanbanItemContext(ITEM_HANDLE_NAME);

  const isDisabled = disabled ?? itemContext.disabled;

  const { setActivatorNodeRef } = itemContext;

  const onActivatorNodeRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (isDisabled) return;
      setActivatorNodeRef(node);
    },
    [isDisabled, setActivatorNodeRef],
  );

  const composedRef = useComposedRefs(ref, onActivatorNodeRef);

  const HandlePrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-disabled={isDisabled ? "" : undefined}
      data-dragging={itemContext.isDragging ? "" : undefined}
      data-slot="kanban-item-handle"
      {...itemHandleProps}
      {...(isDisabled ? {} : itemContext.attributes)}
      {...(isDisabled ? {} : itemContext.listeners)}
      ref={composedRef}
      className={cn(
        "cn-kanban-item-handle",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

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

function subscribe() {
  return () => {};
}

interface KanbanOverlayProps extends Omit<
  React.ComponentProps<typeof DragOverlay>,
  "children"
> {
  container?: Element | DocumentFragment | null;
  children?:
    | React.ReactNode
    | ((params: {
        value: UniqueIdentifier;
        variant: "column" | "item";
      }) => React.ReactNode);
}

function KanbanOverlay(props: KanbanOverlayProps) {
  const { container: containerProp, children, ...overlayProps } = props;

  const context = useKanbanContext(OVERLAY_NAME);

  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  const variant =
    context.activeId && context.activeId in context.items ? "column" : "item";

  return ReactDOM.createPortal(
    <DragOverlay
      dropAnimation={dropAnimation}
      modifiers={context.modifiers}
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

export {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  type KanbanProps,
};
