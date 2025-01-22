"use client";

import {
  type CollisionDetection,
  DndContext,
  type DndContextProps,
  type DragEndEvent,
  DragOverlay,
  type DraggableSyntheticListeners,
  type DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot, type SlotProps } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { composeEventHandlers, composeRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Kanban";
const BOARD_NAME = "KanbanBoard";
const COLUMN_NAME = "KanbanColumn";
const ITEM_NAME = "KanbanItem";
const ITEM_GRIP_NAME = "KanbanItemGrip";
const OVERLAY_NAME = "KanbanOverlay";

const KANBAN_ERROR = {
  root: `${ROOT_NAME} components must be within ${ROOT_NAME}`,
  board: `${BOARD_NAME} must be within ${ROOT_NAME}`,
  column: `${COLUMN_NAME} must be within ${BOARD_NAME}`,
  item: `${ITEM_NAME} must be within ${COLUMN_NAME}`,
  grip: `${ITEM_GRIP_NAME} must be within ${ITEM_NAME}`,
  overlay: `${OVERLAY_NAME} must be within ${ROOT_NAME}`,
} as const;

interface KanbanContextValue<T> {
  id: string;
  items: Record<UniqueIdentifier, T[]>;
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

type KanbanProps<T> = DndContextProps & {
  value: Record<UniqueIdentifier, T[]>;
  onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void;
  onMove?: (event: DragEndEvent) => void;
  sensors?: DndContextProps["sensors"];
  flatCursor?: boolean;
} & (T extends object
    ? { getItemValue: (item: T) => UniqueIdentifier }
    : { getItemValue?: (item: T) => UniqueIdentifier });

function Kanban<T>(props: KanbanProps<T>) {
  const {
    id = React.useId(),
    value,
    onValueChange,
    sensors: sensorsProp,
    onMove,
    getItemValue: getItemValueProp,
    flatCursor = false,
    ...kanbanProps
  } = props;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const lastOverId = React.useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = React.useRef(false);
  const [clonedItems, setClonedItems] = React.useState<Record<
    UniqueIdentifier,
    T[]
  > | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
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

  const contextValue = React.useMemo<KanbanContextValue<T>>(
    () => ({
      id,
      items: value,
      activeId,
      setActiveId,
      getItemValue,
      flatCursor,
    }),
    [id, value, activeId, getItemValue, flatCursor],
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
        if (recentlyMovedToNewContainer.current) {
          lastOverId.current = activeId;
        }
        return lastOverId.current ? [{ id: lastOverId.current }] : [];
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

      lastOverId.current = overId;
      return [{ id: overId }];
    },
    [activeId, value, getItemValue],
  );

  return (
    <KanbanContext.Provider value={contextValue as KanbanContextValue<unknown>}>
      <DndContext
        id={id}
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
        onDragOver={composeEventHandlers(
          kanbanProps.onDragOver,
          ({ active, over }) => {
            const overId = over?.id;

            if (!overId || active.id in value) return;

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
                newIndex =
                  overIndex >= 0 ? overIndex + modifier : overItems.length;
              }

              recentlyMovedToNewContainer.current = true;

              const newOverItems = [
                ...overItems.slice(0, newIndex),
                activeItem,
                ...overItems.slice(newIndex),
              ];

              const updatedColumns: Record<UniqueIdentifier, T[]> = {
                ...value,
                [activeContainer]: activeItems.filter(
                  (item) => getItemValue(item) !== active.id,
                ),
                [overContainer]: newOverItems,
              };

              onValueChange?.(updatedColumns);
            }
          },
        )}
        onDragEnd={composeEventHandlers(kanbanProps.onDragEnd, (event) => {
          const { active, over } = event;

          if (!over) {
            setActiveId(null);
            setClonedItems(null);
            recentlyMovedToNewContainer.current = false;
            return;
          }

          const activeContainer = getContainer(active.id);
          const overContainer = getContainer(over.id);

          if (!activeContainer || !overContainer) {
            setActiveId(null);
            setClonedItems(null);
            recentlyMovedToNewContainer.current = false;
            return;
          }

          const activeItems = value[activeContainer];
          const overItems = value[overContainer];

          if (!activeItems || !overItems) {
            setActiveId(null);
            setClonedItems(null);
            recentlyMovedToNewContainer.current = false;
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
                recentlyMovedToNewContainer.current = false;
                return;
              }

              const [movedItem] = activeColumn.splice(activeIndex, 1);
              if (!movedItem) {
                setActiveId(null);
                setClonedItems(null);
                recentlyMovedToNewContainer.current = false;
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
              recentlyMovedToNewContainer.current = false;
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
                  recentlyMovedToNewContainer.current = false;
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
          recentlyMovedToNewContainer.current = false;
        })}
        onDragCancel={composeEventHandlers(kanbanProps.onDragCancel, () => {
          if (clonedItems) {
            onValueChange?.(clonedItems);
          }
          setActiveId(null);
          setClonedItems(null);
          recentlyMovedToNewContainer.current = false;
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
    const { value, asChild, ...columnProps } = props;
    const context = useKanbanContext("board");
    const inBoard = React.useContext(KanbanBoardContext);

    if (!inBoard) {
      throw new Error(KANBAN_ERROR.column);
    }

    const ColumnSlot = asChild ? Slot : "div";
    const items = context.items[value] ?? [];

    return (
      <SortableContext
        items={items.map((item) => context.getItemValue(item))}
        strategy={verticalListSortingStrategy}
      >
        <ColumnSlot
          {...columnProps}
          ref={forwardedRef}
          className={cn(
            "flex h-full min-h-[200px] w-[300px] flex-none flex-col gap-2 rounded-lg bg-muted/50 p-4",
            props.className,
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
  isDragging?: boolean;
}

const KanbanItemContext = React.createContext<KanbanItemContextValue>({
  id: "",
  attributes: {},
  listeners: undefined,
  isDragging: false,
});
KanbanItemContext.displayName = ITEM_NAME;

interface KanbanItemProps extends SlotProps {
  value: UniqueIdentifier;
  asGrip?: boolean;
  asChild?: boolean;
}

const KanbanItem = React.forwardRef<HTMLDivElement, KanbanItemProps>(
  (props, forwardedRef) => {
    const { value, style, asGrip, asChild, className, ...itemProps } = props;
    const id = React.useId();
    const context = useKanbanContext("item");
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: value });

    const composedStyle = React.useMemo<React.CSSProperties>(() => {
      return {
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Translate.toString(transform),
        transition,
        ...style,
      };
    }, [isDragging, transform, transition, style]);

    const ItemSlot = asChild ? Slot : "div";

    const itemContext = React.useMemo<KanbanItemContextValue>(
      () => ({
        id,
        attributes,
        listeners,
        isDragging,
      }),
      [id, attributes, listeners, isDragging],
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
          ref={composeRefs(forwardedRef, (node) => setNodeRef(node))}
          style={composedStyle}
          className={cn(
            {
              "touch-none select-none": asGrip,
              "cursor-default": context.flatCursor,
              "data-[dragging]:cursor-grabbing": !context.flatCursor,
              "cursor-grab": !isDragging && asGrip && !context.flatCursor,
            },
            className,
          )}
          {...(asGrip ? attributes : {})}
          {...(asGrip ? listeners : {})}
        />
      </KanbanItemContext.Provider>
    );
  },
);
KanbanItem.displayName = ITEM_NAME;

interface KanbanItemGripProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const KanbanItemGrip = React.forwardRef<HTMLButtonElement, KanbanItemGripProps>(
  (props, forwardedRef) => {
    const itemContext = React.useContext(KanbanItemContext);
    const context = useKanbanContext("item");

    const { asChild, className, ...dragHandleProps } = props;
    const GripSlot = asChild ? Slot : "button";

    return (
      <GripSlot
        aria-controls={itemContext.id}
        data-dragging={itemContext.isDragging ? "" : undefined}
        className={cn(
          "select-none",
          context.flatCursor
            ? "cursor-default"
            : "cursor-grab data-[dragging]:cursor-grabbing",
          className,
        )}
        {...itemContext.attributes}
        {...itemContext.listeners}
        ref={forwardedRef}
        {...dragHandleProps}
      />
    );
  },
);
KanbanItemGrip.displayName = ITEM_GRIP_NAME;

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
const ItemGrip = KanbanItemGrip;
const Overlay = KanbanOverlay;

export {
  Root,
  Board,
  Column,
  Item,
  ItemGrip,
  Overlay,
  //
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanItemGrip,
  KanbanOverlay,
};
