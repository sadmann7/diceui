"use client";

import {
  DndContext,
  type DndContextProps,
  type DragEndEvent,
  DragOverlay,
  type DraggableSyntheticListeners,
  type DropAnimation,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  closestCorners,
  defaultDropAnimationSideEffects,
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

interface KanbanProviderContextValue<T, C> {
  id: string;
  columns: Record<UniqueIdentifier, T[]>;
  columnData: C[];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  getColumnValue: (column: C) => UniqueIdentifier;
  getItemValue: (item: T) => UniqueIdentifier;
}

const KanbanRoot = React.createContext<KanbanProviderContextValue<
  unknown,
  unknown
> | null>(null);
KanbanRoot.displayName = ROOT_NAME;

function useKanbanRoot() {
  const context = React.useContext(KanbanRoot);
  if (!context) {
    throw new Error(KANBAN_ERROR.root);
  }
  return context;
}

type KanbanProps<T, C> = DndContextProps & {
  columns: Record<UniqueIdentifier, T[]>;
  onColumnsChange?: (columns: Record<UniqueIdentifier, T[]>) => void;
  columnData: C[];
  onMove?: (event: DragEndEvent) => void;
  sensors?: DndContextProps["sensors"];
} & (T extends object
    ? { getItemValue: (item: T) => UniqueIdentifier }
    : { getItemValue?: (item: T) => UniqueIdentifier }) &
  (C extends object
    ? { getColumnValue: (column: C) => UniqueIdentifier }
    : { getColumnValue?: (column: C) => UniqueIdentifier });

function Kanban<T, C>(props: KanbanProps<T, C>) {
  const {
    columns,
    columnData,
    onColumnsChange,
    sensors: sensorsProp,
    onMove,
    getItemValue: getItemValueProp,
    getColumnValue: getColumnValueProp,
    ...kanbanProps
  } = props;
  const id = React.useId();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
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

  const getColumnValue = React.useCallback(
    (column: C): UniqueIdentifier => {
      if (typeof column === "object" && !getColumnValueProp) {
        throw new Error(
          "getColumnValue is required when using array of objects.",
        );
      }
      return getColumnValueProp
        ? getColumnValueProp(column)
        : (column as UniqueIdentifier);
    },
    [getColumnValueProp],
  );

  const contextValue = React.useMemo<KanbanProviderContextValue<T, C>>(
    () => ({
      id,
      columns,
      columnData,
      activeId,
      setActiveId,
      getItemValue,
      getColumnValue,
    }),
    [id, columns, columnData, activeId, getItemValue, getColumnValue],
  );

  const getContainer = React.useCallback(
    (id: UniqueIdentifier) => {
      if (id in columns) return id;

      for (const [columnId, items] of Object.entries(columns)) {
        if (items.some((item) => getItemValue(item) === id)) {
          return columnId;
        }
      }

      return null;
    },
    [columns, getItemValue],
  );

  return (
    <KanbanRoot.Provider
      value={contextValue as KanbanProviderContextValue<unknown, unknown>}
    >
      <DndContext
        id={id}
        sensors={sensorsProp ?? sensors}
        collisionDetection={closestCorners}
        onDragStart={composeEventHandlers(
          kanbanProps.onDragStart,
          ({ active }) => setActiveId(active.id),
        )}
        onDragEnd={composeEventHandlers(kanbanProps.onDragEnd, (event) => {
          const { active, over } = event;
          if (!over) {
            setActiveId(null);
            return;
          }

          const activeContainer = getContainer(active.id);
          const overContainer = getContainer(over.id);

          if (!activeContainer || !overContainer) {
            setActiveId(null);
            return;
          }

          const activeItems = columns[activeContainer];
          const overItems = columns[overContainer];

          if (!activeItems || !overItems) {
            setActiveId(null);
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
              const newColumns = { ...columns };
              const activeColumn = newColumns[activeContainer];
              const overColumn = newColumns[overContainer];

              if (!activeColumn || !overColumn) {
                setActiveId(null);
                return;
              }

              const [movedItem] = activeColumn.splice(activeIndex, 1);
              if (!movedItem) {
                setActiveId(null);
                return;
              }

              overColumn.splice(overIndex, 0, movedItem);
              onColumnsChange?.(newColumns);
            }
          } else {
            const items = columns[activeContainer];
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
              if (onMove) {
                onMove(event);
              } else {
                const newColumns = { ...columns };
                const columnItems = newColumns[activeContainer];
                if (!columnItems) {
                  setActiveId(null);
                  return;
                }
                newColumns[activeContainer] = arrayMove(
                  columnItems,
                  activeIndex,
                  overIndex,
                );
                onColumnsChange?.(newColumns);
              }
            }
          }
          setActiveId(null);
        })}
        onDragCancel={composeEventHandlers(kanbanProps.onDragCancel, () =>
          setActiveId(null),
        )}
        {...kanbanProps}
      />
    </KanbanRoot.Provider>
  );
}

const KanbanBoardContext = React.createContext<boolean>(false);
KanbanBoardContext.displayName = BOARD_NAME;

interface KanbanBoardProps extends SlotProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (props, ref) => {
    const { asChild, ...boardProps } = props;
    const context = useKanbanRoot();
    if (!context) {
      throw new Error(KANBAN_ERROR.board);
    }

    const BoardSlot = asChild ? Slot : "div";

    return (
      <KanbanBoardContext.Provider value={true}>
        <BoardSlot
          {...boardProps}
          ref={ref}
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
  (props, ref) => {
    const { value, asChild, ...columnProps } = props;
    const context = useKanbanRoot();
    const inBoard = React.useContext(KanbanBoardContext);

    if (!inBoard) {
      throw new Error(KANBAN_ERROR.column);
    }

    const ColumnSlot = asChild ? Slot : "div";
    const items = context.columns[value] ?? [];

    return (
      <SortableContext
        items={items.map((item) => context.getItemValue(item))}
        strategy={verticalListSortingStrategy}
      >
        <ColumnSlot
          {...columnProps}
          ref={ref}
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
  (props, ref) => {
    const { value, style, asGrip, asChild, className, ...itemProps } = props;
    const id = React.useId();
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
          ref={composeRefs(ref, (node) => setNodeRef(node))}
          style={composedStyle}
          className={cn(
            {
              "touch-none select-none": asGrip,
              "cursor-grab": !isDragging && asGrip,
              "data-[dragging]:cursor-grabbing": true,
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
  (props, ref) => {
    const itemContext = React.useContext(KanbanItemContext);
    if (!itemContext) {
      throw new Error(KANBAN_ERROR.grip);
    }

    const { asChild, className, ...dragHandleProps } = props;
    const GripSlot = asChild ? Slot : "button";

    return (
      <GripSlot
        aria-controls={itemContext.id}
        data-dragging={itemContext.isDragging ? "" : undefined}
        className={cn(
          "cursor-grab select-none data-[dragging]:cursor-grabbing",
          className,
        )}
        {...itemContext.attributes}
        {...itemContext.listeners}
        ref={ref}
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
  const context = React.useContext(KanbanRoot);
  if (!context) {
    throw new Error(KANBAN_ERROR.overlay);
  }

  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  return ReactDOM.createPortal(
    <DragOverlay
      dropAnimation={dropAnimationProp ?? dropAnimation}
      className="cursor-grabbing"
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
