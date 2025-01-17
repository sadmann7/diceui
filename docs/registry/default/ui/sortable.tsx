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

import { composeEventHandlers, composeRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import * as ReactDOM from "react-dom";

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
  mixed: {
    modifiers: [restrictToParentElement],
    strategy: undefined,
    collisionDetection: closestCorners,
  },
};

const ROOT_NAME = "Sortable";
const CONTENT_NAME = "SortableContent";
const ITEM_NAME = "SortableItem";
const ITEM_GRIP_NAME = "SortableItemGrip";
const OVERLAY_NAME = "SortableOverlay";

const SORTABLE_ERROR = {
  root: `${ROOT_NAME} components must be within ${ROOT_NAME}`,
  content: `${CONTENT_NAME} must be within ${ROOT_NAME}`,
  item: `${ITEM_NAME} must be within ${CONTENT_NAME}`,
  grip: `${ITEM_GRIP_NAME} must be within ${ITEM_NAME}`,
  overlay: `${OVERLAY_NAME} must be within ${ROOT_NAME}`,
} as const;

interface SortableProviderContextValue<T> {
  id: string;
  items: T[];
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  flatCursor: boolean;
  getItemValue: (item: T) => UniqueIdentifier;
}

type SortableRootContextValue = SortableProviderContextValue<unknown>;

const SortableRoot = React.createContext<SortableRootContextValue | null>(null);
SortableRoot.displayName = ROOT_NAME;

function useSortableRoot() {
  const context = React.useContext(SortableRoot);
  if (!context) {
    throw new Error(SORTABLE_ERROR.root);
  }
  return context;
}

type SortableProps<T> = DndContextProps & {
  value: T[];
  onValueChange?: (items: T[]) => void;
  onMove?: (event: DragEndEvent) => void;
  collisionDetection?: DndContextProps["collisionDetection"];
  modifiers?: DndContextProps["modifiers"];
  sensors?: DndContextProps["sensors"];
  orientation?: "vertical" | "horizontal" | "mixed";
  flatCursor?: boolean;
} & (T extends object
    ? { getItemValue: (item: T) => UniqueIdentifier }
    : { getItemValue?: (item: T) => UniqueIdentifier });

function Sortable<T>(props: SortableProps<T>) {
  const {
    value,
    onValueChange,
    collisionDetection,
    modifiers,
    sensors: sensorsProp,
    onMove,
    orientation = "vertical",
    flatCursor = false,
    getItemValue: getItemValueProp,
    ...sortableProps
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
  const config = React.useMemo(
    () => orientationConfig[orientation],
    [orientation],
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

  const contextValue = React.useMemo(
    () => ({
      id,
      items: value,
      modifiers: modifiers ?? config.modifiers,
      strategy: config.strategy,
      activeId,
      setActiveId,
      flatCursor,
      getItemValue,
    }),
    [
      id,
      value,
      modifiers,
      config.modifiers,
      config.strategy,
      activeId,
      flatCursor,
      getItemValue,
    ],
  );

  return (
    <SortableRoot.Provider value={contextValue as SortableRootContextValue}>
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
                (item) => getItemValue(item) === active.id,
              );
              const overIndex = value.findIndex(
                (item) => getItemValue(item) === over.id,
              );

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
          ...props.accessibility,
          announcements: {
            onDragStart({ active }) {
              return `Picked up sortable item ${active.id}. Use arrow keys to move, space to drop.`;
            },
            onDragOver({ active, over }) {
              if (over) {
                return `Sortable item ${active.id} was moved over position ${over.id}.`;
              }
              return `Sortable item ${active.id} is no longer over a droppable area.`;
            },
            onDragEnd({ active, over }) {
              if (over) {
                return `Sortable item ${active.id} was dropped over position ${over.id}.`;
              }
              return `Sortable item ${active.id} was dropped.`;
            },
            onDragCancel({ active }) {
              return `Sorting was cancelled. Sortable item ${active.id} was dropped.`;
            },
            onDragMove({ active, over }) {
              if (over) {
                return `Sortable item ${active.id} was moved over position ${over.id}.`;
              }
              return `Sortable item ${active.id} is no longer over a droppable area.`;
            },
            ...props.accessibility?.announcements,
          },
        }}
        {...sortableProps}
      />
    </SortableRoot.Provider>
  );
}

const SortableContentContext = React.createContext<boolean>(false);
SortableContentContext.displayName = CONTENT_NAME;

interface SortableContentProps extends SlotProps {
  strategy?: SortableContextProps["strategy"];
  children: React.ReactNode;
  asChild?: boolean;
}

const SortableContent = React.forwardRef<HTMLDivElement, SortableContentProps>(
  (props, ref) => {
    const { strategy: strategyProp, asChild, ...contentProps } = props;
    const context = useSortableRoot();
    if (!context) {
      throw new Error(SORTABLE_ERROR.content);
    }

    const ContentSlot = asChild ? Slot : "div";

    return (
      <SortableContentContext.Provider value={true}>
        <SortableContext
          items={context.items.map((item) => ({
            id: context.getItemValue(item),
          }))}
          strategy={strategyProp ?? context.strategy}
        >
          <ContentSlot {...contentProps} ref={ref} />
        </SortableContext>
      </SortableContentContext.Provider>
    );
  },
);
SortableContent.displayName = CONTENT_NAME;

const SortableOverlayContext = React.createContext(false);
SortableOverlayContext.displayName = OVERLAY_NAME;

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
  container?: HTMLElement | DocumentFragment | null;
  children?:
    | ((params: { value: UniqueIdentifier }) => React.ReactNode)
    | React.ReactNode;
}

function SortableOverlay(props: SortableOverlayProps) {
  const {
    container: containerProp,
    dropAnimation: dropAnimationProp,
    children,
    ...overlayProps
  } = props;
  const context = React.useContext(SortableRoot);
  if (!context) {
    throw new Error(SORTABLE_ERROR.overlay);
  }

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
      <SortableOverlayContext.Provider value={true}>
        {context.activeId ? (
          typeof children === "function" ? (
            children({ value: context.activeId })
          ) : (
            <SortableItem value={context.activeId} asChild>
              {children}
            </SortableItem>
          )
        ) : null}
      </SortableOverlayContext.Provider>
    </DragOverlay>,
    container,
  );
}

interface SortableItemContextValue {
  id: string;
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: DraggableSyntheticListeners | undefined;
  isDragging?: boolean;
}

const SortableItemContext = React.createContext<SortableItemContextValue>({
  id: "",
  attributes: {},
  listeners: undefined,
  isDragging: false,
});
SortableItemContext.displayName = ITEM_NAME;

interface SortableItemProps extends SlotProps {
  value: UniqueIdentifier;
  asGrip?: boolean;
  asChild?: boolean;
}

const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(
  (props, ref) => {
    const inSortableContent = React.useContext(SortableContentContext);
    const inSortableOverlay = React.useContext(SortableOverlayContext);

    if (!inSortableContent && !inSortableOverlay) {
      throw new Error(SORTABLE_ERROR.item);
    }

    const { value, style, asGrip, asChild, className, ...itemProps } = props;
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

    const composedStyle = React.useMemo<React.CSSProperties>(() => {
      return {
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Translate.toString(transform),
        transition,
        ...style,
      };
    }, [isDragging, transform, transition, style]);

    const ItemSlot = asChild ? Slot : "div";

    const itemContext = React.useMemo<SortableItemContextValue>(
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
      <SortableItemContext.Provider value={itemContext}>
        <ItemSlot
          id={id}
          data-dragging={isDragging ? "" : undefined}
          {...itemProps}
          ref={composeRefs(ref, (node) => setNodeRef(node))}
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
      </SortableItemContext.Provider>
    );
  },
);
SortableItem.displayName = ITEM_NAME;

interface SortableItemGripProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const SortableItemGrip = React.forwardRef<
  HTMLButtonElement,
  SortableItemGripProps
>((props, ref) => {
  const itemContext = React.useContext(SortableItemContext);
  if (!itemContext) {
    throw new Error(SORTABLE_ERROR.grip);
  }

  const { asChild, className, ...dragHandleProps } = props;
  const context = useSortableRoot();

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
      ref={ref}
      {...dragHandleProps}
    />
  );
});
SortableItemGrip.displayName = ITEM_GRIP_NAME;

const Root = Sortable;
const Content = SortableContent;
const Item = SortableItem;
const ItemGrip = SortableItemGrip;
const Overlay = SortableOverlay;

export {
  Content,
  Item,
  ItemGrip,
  Overlay,
  //
  Root,
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemGrip,
  SortableOverlay,
};
