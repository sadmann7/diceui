"use client";

import type {
  DndContextProps,
  DraggableSyntheticListeners,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
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
  },
  horizontal: {
    modifiers: [restrictToHorizontalAxis, restrictToParentElement],
    strategy: horizontalListSortingStrategy,
  },
  both: {
    modifiers: [restrictToParentElement],
    strategy: undefined,
  },
};

interface SortableProps<TData extends { id: UniqueIdentifier }>
  extends DndContextProps {
  value: TData[];
  onValueChange?: (items: TData[]) => void;
  onMove?: (event: { activeIndex: number; overIndex: number }) => void;
  collisionDetection?: DndContextProps["collisionDetection"];
  modifiers?: DndContextProps["modifiers"];
  strategy?: SortableContextProps["strategy"];
  orientation?: "vertical" | "horizontal" | "both";
}

interface SortableProviderContext<TData extends { id: UniqueIdentifier }> {
  id: string;
  items: TData[];
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
}

const SortableRoot = React.createContext<
  SortableProviderContext<{ id: UniqueIdentifier }> | undefined
>(undefined);

function useSortableRoot() {
  const context = React.useContext(SortableRoot);
  if (!context) {
    throw new Error(
      "useSortableContext must be used within a SortableProvider",
    );
  }
  return context;
}

function Sortable<TData extends { id: UniqueIdentifier }>(
  props: SortableProps<TData>,
) {
  const id = React.useId();
  const {
    value,
    onValueChange,
    collisionDetection = closestCenter,
    modifiers,
    strategy,
    onMove,
    orientation = "vertical",
    ...sortableProps
  } = props;

  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const config = orientationConfig[orientation];

  const contextValue = React.useMemo(
    () => ({
      id,
      items: value,
      modifiers: modifiers ?? config.modifiers,
      strategy: strategy ?? config.strategy,
      activeId,
      setActiveId,
    }),
    [
      id,
      value,
      modifiers,
      strategy,
      config.modifiers,
      config.strategy,
      activeId,
    ],
  );

  return (
    <SortableRoot.Provider value={contextValue}>
      <DndContext
        id={id}
        modifiers={modifiers ?? config.modifiers}
        sensors={sensors}
        onDragStart={composeEventHandlers(
          sortableProps.onDragStart,
          ({ active }) => setActiveId(active.id),
        )}
        onDragEnd={composeEventHandlers(
          sortableProps.onDragEnd,
          ({ active, over }) => {
            if (over && active.id !== over?.id) {
              const activeIndex = value.findIndex(
                (item) => item.id === active.id,
              );
              const overIndex = value.findIndex((item) => item.id === over.id);

              if (onMove) {
                onMove({ activeIndex, overIndex });
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
        collisionDetection={collisionDetection}
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
  const { id, items, strategy } = useSortableRoot();

  return (
    <SortableContext
      id={`${id}content`}
      items={items}
      strategy={strategyProp ?? strategy}
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
  autoScale?: boolean;
}

const SortableOverlay = React.forwardRef<HTMLDivElement, SortableOverlayProps>(
  (props, ref) => {
    const {
      dropAnimation: dropAnimationProp,
      autoScale,
      ...overlayProps
    } = props;
    const { activeId, modifiers } = useSortableRoot();

    return (
      <DragOverlay
        modifiers={modifiers}
        dropAnimation={dropAnimationProp ?? dropAnimation}
        {...overlayProps}
      >
        {activeId ? (
          <SortableItem
            ref={ref}
            value={activeId}
            className="cursor-grabbing"
            asChild
          />
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
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: value });
    const id = React.useId();

    const style: React.CSSProperties = {
      opacity: isDragging ? 0.5 : 1,
      transform: CSS.Translate.toString(transform),
      transition,
      ...styleProp,
    };

    const Comp = asChild ? Slot : "div";

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
        <Comp
          id={id}
          data-sortable-item=""
          data-dragging={isDragging ? "" : undefined}
          className={cn(
            "data-[dragging]:cursor-grabbing",
            { "cursor-grab": !isDragging && asDragHandle },
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
  const { id, attributes, listeners, isDragging } = useSortableItem();

  return (
    <Button
      ref={ref}
      aria-controls={id}
      data-dragging={isDragging ? "" : undefined}
      className={cn("cursor-grab data-[dragging]:cursor-grabbing", className)}
      {...attributes}
      {...listeners}
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