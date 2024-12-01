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

type UniqueItem = { id: UniqueIdentifier };
interface SortableProviderContext<T extends UniqueItem> {
  id: string;
  items: T[];
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  disableGrabCursor: boolean;
}

const SortableRoot = React.createContext<
  SortableProviderContext<{ id: UniqueIdentifier }> | undefined
>(undefined);

function useSortableRoot() {
  const context = React.useContext(SortableRoot);
  if (!context) {
    throw new Error("useSortableRoot must be used within a SortableProvider");
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
  disableGrabCursor?: boolean;
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
    disableGrabCursor = false,
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
      disableGrabCursor,
    }),
    [
      id,
      value,
      modifiers,
      config.modifiers,
      config.strategy,
      activeId,
      disableGrabCursor,
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
        collisionDetection={closestCorners}
        {...sortableProps}
      />
    </SortableRoot.Provider>
  );
}

interface SortableContentProps {
  strategy?: SortableContextProps["strategy"];
  children: React.ReactNode;
}

function SortableContent({
  strategy: strategyProp,
  children,
}: SortableContentProps) {
  const context = useSortableRoot();

  return (
    <SortableContext
      id={`${context.id}context`}
      items={context.items}
      strategy={strategyProp ?? context.strategy}
    >
      {children}
    </SortableContext>
  );
}

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
  extends React.ComponentPropsWithRef<typeof DragOverlay> {
  children?: React.ReactNode;
}

const SortableOverlay = React.forwardRef<HTMLDivElement, SortableOverlayProps>(
  (props, ref) => {
    const {
      dropAnimation: dropAnimationProp,
      children,
      ...overlayProps
    } = props;
    const context = useSortableRoot();

    return (
      <DragOverlay
        modifiers={context.modifiers}
        dropAnimation={dropAnimationProp ?? dropAnimation}
        className={cn(!context.disableGrabCursor && "cursor-grabbing")}
        {...overlayProps}
      >
        {context.activeId ? (
          <SortableItem ref={ref} value={context.activeId} asChild>
            {children}
          </SortableItem>
        ) : null}
      </DragOverlay>
    );
  },
);
SortableOverlay.displayName = "SortableOverlay";

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

function useSortableItem() {
  const context = React.useContext(SortableItemContext);
  if (!context) {
    throw new Error("useSortableItem must be used within a SortableItem");
  }
  return context;
}

interface SortableItemProps extends SlotProps {
  value: UniqueIdentifier;
  asDragHandle?: boolean;
  asChild?: boolean;
}

const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(
  (props, ref) => {
    const {
      value,
      style: styleProp,
      asDragHandle,
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
          data-dragging={isDragging ? "" : undefined}
          className={cn(
            {
              "cursor-default": context.disableGrabCursor,
              "data-[dragging]:cursor-grabbing": !context.disableGrabCursor,
              "cursor-grab":
                !isDragging && asDragHandle && !context.disableGrabCursor,
            },
            className,
          )}
          ref={composeRefs(ref, (node) => setNodeRef(node))}
          style={style}
          {...(asDragHandle ? attributes : {})}
          {...(asDragHandle ? listeners : {})}
          {...itemProps}
        />
      </SortableItemContext.Provider>
    );
  },
);
SortableItem.displayName = "SortableItem";

interface SortableDragHandleProps extends ButtonProps {
  withHandle?: boolean;
}

const SortableDragHandle = React.forwardRef<
  HTMLButtonElement,
  SortableDragHandleProps
>((props, ref) => {
  const { className, ...dragHandleProps } = props;
  const context = useSortableRoot();
  const itemContext = useSortableItem();

  return (
    <Button
      ref={ref}
      aria-controls={itemContext.id}
      data-dragging={itemContext.isDragging ? "" : undefined}
      className={cn(
        context.disableGrabCursor
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
SortableDragHandle.displayName = "SortableDragHandle";

export {
  Sortable,
  SortableContent,
  SortableDragHandle,
  SortableItem,
  SortableOverlay,
};
