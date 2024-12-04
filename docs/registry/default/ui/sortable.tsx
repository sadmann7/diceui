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
  closestCenter,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  type SortableContextProps,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot, type SlotProps } from "@radix-ui/react-slot";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { composeRefs } from "@/lib/compose-refs";
import { cn, composeEventHandlers } from "@/lib/utils";

const orientationConfig = {
  vertical: {
    modifiers: [restrictToVerticalAxis, restrictToParentElement],
    strategy: verticalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  horizontal: {
    modifiers: [restrictToHorizontalAxis, restrictToParentElement],
    strategy: horizontalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  both: {
    modifiers: [restrictToParentElement],
    strategy: undefined,
    collisionDetection: closestCorners,
  },
};

const SORTABLE_NAME = "Sortable";
const SORTABLE_CONTENT_NAME = "SortableContent";
const SORTABLE_ITEM_NAME = "SortableItem";
const SORTABLE_ITEM_GRIP_NAME = "SortableItemGrip";
const SORTABLE_OVERLAY_NAME = "SortableOverlay";

const SORTABLE_ERROR = {
  root: `${SORTABLE_NAME} components must be within ${SORTABLE_NAME}`,
  content: `${SORTABLE_CONTENT_NAME} must be within ${SORTABLE_NAME}`,
  item: `${SORTABLE_ITEM_NAME} must be within ${SORTABLE_CONTENT_NAME}`,
  grip: `${SORTABLE_ITEM_GRIP_NAME} must be within ${SORTABLE_ITEM_NAME}`,
  overlay: `${SORTABLE_OVERLAY_NAME} must be within ${SORTABLE_NAME}`,
} as const;

type UniqueItem = { id: UniqueIdentifier };

interface SortableProviderContext<T extends UniqueItem> {
  id: string;
  items: T[];
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  flatCursor: boolean;
}

const SortableRoot = React.createContext<SortableProviderContext<{
  id: UniqueIdentifier;
}> | null>(null);
SortableRoot.displayName = SORTABLE_NAME;

function useSortableRoot() {
  const context = React.useContext(SortableRoot);
  if (!context) {
    throw new Error(SORTABLE_ERROR.root);
  }
  return context;
}

interface SortableProps<T extends UniqueItem> extends DndContextProps {
  value: T[];
  onValueChange?: (items: T[]) => void;
  onMove?: (event: DragEndEvent) => void;
  collisionDetection?: DndContextProps["collisionDetection"];
  modifiers?: DndContextProps["modifiers"];
  sensors?: DndContextProps["sensors"];
  orientation?: "vertical" | "horizontal" | "both";
  flatCursor?: boolean;
}

function Sortable<T extends UniqueItem>(props: SortableProps<T>) {
  const id = React.useId();
  const {
    value,
    onValueChange,
    collisionDetection,
    modifiers,
    sensors: sensorsProp,
    onMove,
    orientation = "vertical",
    flatCursor = false,
    ...sortableProps
  } = props;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const config = React.useMemo(
    () => orientationConfig[orientation],
    [orientation],
  );
  const contextValue = React.useMemo(
    () => ({
      id,
      items: value,
      modifiers: modifiers ?? config.modifiers,
      strategy: config.strategy,
      activeId,
      setActiveId,
      flatCursor,
    }),
    [
      id,
      value,
      modifiers,
      config.modifiers,
      config.strategy,
      activeId,
      flatCursor,
    ],
  );

  return (
    <SortableRoot.Provider value={contextValue}>
      <DndContext
        id={id}
        modifiers={modifiers ?? config.modifiers}
        sensors={sensorsProp ?? sensors}
        onDragStart={composeEventHandlers(
          sortableProps.onDragStart,
          ({ active }) => setActiveId(active.id),
        )}
        onDragEnd={composeEventHandlers(
          sortableProps.onDragEnd,
          ({ active, over, activatorEvent, collisions, delta }) => {
            if (over && active.id !== over?.id) {
              const activeIndex = value.findIndex(
                (item) => item.id === active.id,
              );
              const overIndex = value.findIndex((item) => item.id === over.id);

              if (onMove) {
                onMove({ active, over, activatorEvent, collisions, delta });
              } else {
                onValueChange?.(arrayMove(value, activeIndex, overIndex));
              }
            }
            setActiveId(null);
          },
        )}
        onDragCancel={composeEventHandlers(sortableProps.onDragCancel, () =>
          setActiveId(null),
        )}
        collisionDetection={collisionDetection ?? config.collisionDetection}
        accessibility={{
          announcements: {
            onDragStart({ active }) {
              return `Picked up sortable item ${active.id}. Use arrow keys to move, space to drop.`;
            },
            onDragOver({ active, over }) {
              if (over) {
                return `Sortable item ${active.id} was moved over position ${over.id}`;
              }
              return `Sortable item ${active.id} is no longer over a droppable area`;
            },
            onDragEnd({ active, over }) {
              if (over) {
                return `Sortable item ${active.id} was dropped over position ${over.id}`;
              }
              return `Sortable item ${active.id} was dropped`;
            },
            onDragCancel({ active }) {
              return `Sorting was cancelled. Sortable item ${active.id} was dropped.`;
            },
            onDragMove({ active, over }) {
              if (over) {
                return `Sortable item ${active.id} was moved over position ${over.id}`;
              }
              return `Sortable item ${active.id} is no longer over a droppable area`;
            },
          },
          ...sortableProps.accessibility,
        }}
        {...sortableProps}
      />
    </SortableRoot.Provider>
  );
}

Sortable.displayName = SORTABLE_NAME;

interface SortableContentProps extends SlotProps {
  strategy?: SortableContextProps["strategy"];
  children: React.ReactNode;
  asChild?: boolean;
}

const SortableContent = React.forwardRef<HTMLDivElement, SortableContentProps>(
  ({ strategy: strategyProp, children, asChild, ...props }, ref) => {
    const context = React.useContext(SortableRoot);
    if (!context) {
      throw new Error(SORTABLE_ERROR.content);
    }

    React.Children.forEach(children, (child) => {
      if (
        !React.isValidElement(child) ||
        !child.type ||
        (typeof child.type === "function" && child.type.name !== "SortableItem")
      ) {
        throw new Error(SORTABLE_ERROR.item);
      }
    });

    const ContentSlot = asChild ? Slot : "div";

    return (
      <SortableContext
        items={context.items}
        strategy={strategyProp ?? context.strategy}
      >
        <ContentSlot ref={ref} {...props}>
          {children}
        </ContentSlot>
      </SortableContext>
    );
  },
);
SortableContent.displayName = SORTABLE_CONTENT_NAME;

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

interface SortableOverlayProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DragOverlay>, "children"> {
  children?:
    | ((params: { value: UniqueIdentifier }) => React.ReactNode)
    | React.ReactNode;
}

function SortableOverlay(props: SortableOverlayProps) {
  const { dropAnimation: dropAnimationProp, children, ...overlayProps } = props;
  const context = React.useContext(SortableRoot);
  if (!context) {
    throw new Error(SORTABLE_ERROR.overlay);
  }

  return (
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
          <SortableItem value={context.activeId} asChild>
            {children}
          </SortableItem>
        )
      ) : null}
    </DragOverlay>
  );
}

interface SortableItemContextProps {
  id: string;
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: DraggableSyntheticListeners | undefined;
  isDragging?: boolean;
}

const SortableItemContext = React.createContext<SortableItemContextProps>({
  id: "",
  attributes: {},
  listeners: undefined,
  isDragging: false,
});

interface SortableItemProps extends SlotProps {
  value: UniqueIdentifier;
  asGrip?: boolean;
  asChild?: boolean;
}

const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(
  (props, ref) => {
    const inSortableContent = React.useContext(SortableRoot);
    if (!inSortableContent) {
      throw new Error(SORTABLE_ERROR.item);
    }

    const {
      value,
      style: styleProp,
      asGrip,
      asChild,
      className,
      ...itemProps
    } = props;
    const context = useSortableRoot();
    const id = React.useId();
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: value });

    const style: React.CSSProperties = {
      opacity: isDragging ? 0.5 : 1,
      transform: CSS.Translate.toString(transform),
      transition,
      ...styleProp,
    };

    const ItemSlot = asChild ? Slot : "div";

    const itemContext = React.useMemo<SortableItemContextProps>(
      () => ({
        id,
        attributes,
        listeners,
        isDragging,
      }),
      [id, attributes, listeners, isDragging],
    );

    return (
      <SortableItemContext.Provider value={itemContext}>
        <ItemSlot
          id={id}
          ref={composeRefs(ref, (node) => setNodeRef(node))}
          data-sortable-item=""
          data-dragging={isDragging ? "" : undefined}
          className={cn(
            {
              "touch-none select-none": asGrip,
              "cursor-default": context.flatCursor,
              "data-[dragging]:cursor-grabbing": !context.flatCursor,
              "cursor-grab": !isDragging && asGrip && !context.flatCursor,
            },
            className,
          )}
          style={style}
          {...(asGrip ? attributes : {})}
          {...(asGrip ? listeners : {})}
          {...itemProps}
        />
      </SortableItemContext.Provider>
    );
  },
);
SortableItem.displayName = SORTABLE_ITEM_NAME;

interface SortableItemGripProps extends ButtonProps {}

const SortableItemGrip = React.forwardRef<
  HTMLButtonElement,
  SortableItemGripProps
>((props, ref) => {
  const itemContext = React.useContext(SortableItemContext);
  if (!itemContext) {
    throw new Error(SORTABLE_ERROR.grip);
  }

  const { className, ...dragHandleProps } = props;
  const context = useSortableRoot();

  return (
    <Button
      ref={ref}
      aria-controls={itemContext.id}
      data-dragging={itemContext.isDragging ? "" : undefined}
      className={cn(
        "touch-none select-none",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-[dragging]:cursor-grabbing",
        className,
      )}
      {...itemContext.attributes}
      {...itemContext.listeners}
      {...dragHandleProps}
    />
  );
});
SortableItemGrip.displayName = "SortableItemGrip";

export {
  Sortable,
  SortableContent,
  SortableItemGrip,
  SortableItem,
  SortableOverlay,
};
