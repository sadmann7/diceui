"use client";

import { ReactStore, useStore } from "@base-ui/utils/store";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";

type Direction = "ltr" | "rtl";
type Orientation = "vertical" | "horizontal";
type Variant = "default" | "alternate";
type Status = "completed" | "active" | "pending";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type ItemElement = HTMLDivElement;

const ROOT_NAME = "Timeline";
const ITEM_NAME = "TimelineItem";
const DOT_NAME = "TimelineDot";
const CONNECTOR_NAME = "TimelineConnector";
const CONTENT_NAME = "TimelineContent";

function getItemStatus(itemIndex: number, activeIndex?: number): Status {
  if (activeIndex === undefined) return "pending";
  if (itemIndex < activeIndex) return "completed";
  if (itemIndex === activeIndex) return "active";
  return "pending";
}

function getSortedEntries(
  entries: [string, React.RefObject<ItemElement | null>][],
) {
  return entries.sort((a, b) => {
    const elementA = a[1].current;
    const elementB = b[1].current;
    if (!elementA || !elementB) return 0;
    const position = elementA.compareDocumentPosition(elementB);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

interface StoreState {
  items: Map<string, React.RefObject<ItemElement | null>>;
}

function getItemIndex(state: StoreState, id: string) {
  const sortedEntries = getSortedEntries(Array.from(state.items.entries()));
  return sortedEntries.findIndex(([key]) => key === id);
}

const selectors = {
  itemIndex: getItemIndex,
  nextItemStatus: (
    state: StoreState,
    id: string,
    activeIndex: number | undefined,
  ): Status | undefined => {
    const currentIndex = getItemIndex(state, id);
    if (currentIndex === -1 || currentIndex === state.items.size - 1) {
      return undefined;
    }

    return getItemStatus(currentIndex + 1, activeIndex);
  },
};

type Store = ReactStore<StoreState, Record<string, never>, typeof selectors>;

function registerItem(
  store: Store,
  id: string,
  ref: React.RefObject<ItemElement | null>,
) {
  const items = new Map(store.state.items);
  items.set(id, ref);
  store.set("items", items);
}

function unregisterItem(store: Store, id: string) {
  const items = new Map(store.state.items);
  items.delete(id);
  store.set("items", items);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface TimelineContextValue {
  dir: Direction;
  orientation: Orientation;
  variant: Variant;
  activeIndex?: number;
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null);

function useTimelineContext(consumerName: string) {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const timelineVariants = cva("cn-timeline", {
  variants: {
    orientation: {
      vertical: "cn-timeline-orientation-vertical",
      horizontal: "cn-timeline-orientation-horizontal",
    },
    variant: {
      default: "",
      alternate: "",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      variant: "default",
      class: "gap-6",
    },
    {
      orientation: "horizontal",
      variant: "default",
      class: "gap-8",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      class: "relative w-full gap-3",
    },
    {
      orientation: "horizontal",
      variant: "alternate",
      class: "items-center gap-4",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
  },
});

interface TimelineProps extends DivProps {
  dir?: Direction;
  orientation?: Orientation;
  variant?: Variant;
  activeIndex?: number;
}

function Timeline(props: TimelineProps) {
  const {
    orientation = "vertical",
    variant = "default",
    dir: dirProp,
    activeIndex,
    asChild,
    className,
    ...rootProps
  } = props;

  const dir = DirectionPrimitive.useDirection(dirProp);

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, Record<string, never>, typeof selectors>(
        { items: new Map() },
        {},
        selectors,
      ),
  );

  const contextValue = React.useMemo<TimelineContextValue>(
    () => ({
      dir,
      orientation,
      variant,
      activeIndex,
    }),
    [dir, orientation, variant, activeIndex],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <TimelineContext.Provider value={contextValue}>
        <RootPrimitive
          role="list"
          aria-orientation={orientation}
          data-slot="timeline"
          data-orientation={orientation}
          data-variant={variant}
          dir={dir}
          {...rootProps}
          className={cn(timelineVariants({ orientation, variant, className }))}
        />
      </TimelineContext.Provider>
    </StoreContext.Provider>
  );
}

interface TimelineItemContextValue {
  id: string;
  status: Status;
  isAlternateRight: boolean;
}

const TimelineItemContext =
  React.createContext<TimelineItemContextValue | null>(null);

function useTimelineItemContext(consumerName: string) {
  const context = React.useContext(TimelineItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

const timelineItemVariants = cva("cn-timeline-item", {
  variants: {
    orientation: {
      vertical: "",
      horizontal: "",
    },
    variant: {
      default: "",
      alternate: "",
    },
    isAlternateRight: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      variant: "default",
      class: "gap-3 pb-8 last:pb-0",
    },
    {
      orientation: "horizontal",
      variant: "default",
      class: "flex-col gap-3",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: false,
      class: "w-1/2 gap-3 pr-6 pb-12 last:pb-0",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: true,
      class: "ml-auto w-1/2 flex-row-reverse gap-3 pb-12 pl-6 last:pb-0",
    },
    {
      orientation: "horizontal",
      variant: "alternate",
      class: "grid min-w-0 grid-rows-[1fr_auto_1fr] gap-3",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});

interface TimelineItemProps extends DivProps {}

function TimelineItem(props: TimelineItemProps) {
  const { asChild, className, id, ref, ...itemProps } = props;

  const { dir, orientation, variant, activeIndex } =
    useTimelineContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);

  const instanceId = React.useId();
  const itemId = id ?? instanceId;
  const itemRef = React.useRef<ItemElement | null>(null);
  const composedRef = useMergedRefs(ref, itemRef);

  const itemIndex = useStore(store, selectors.itemIndex, itemId);

  const status = React.useMemo<Status>(() => {
    return getItemStatus(itemIndex, activeIndex);
  }, [activeIndex, itemIndex]);

  useIsoLayoutEffect(() => {
    registerItem(store, itemId, itemRef);
    return () => {
      unregisterItem(store, itemId);
    };
  }, [itemId, store]);

  const isAlternateRight = variant === "alternate" && itemIndex % 2 === 1;

  const itemContextValue = React.useMemo<TimelineItemContextValue>(
    () => ({ id: itemId, status, isAlternateRight }),
    [itemId, status, isAlternateRight],
  );

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <TimelineItemContext.Provider value={itemContextValue}>
      <ItemPrimitive
        role="listitem"
        aria-current={status === "active" ? "step" : undefined}
        data-slot="timeline-item"
        data-status={status}
        data-orientation={orientation}
        data-alternate-right={isAlternateRight ? "" : undefined}
        id={itemId}
        dir={dir}
        {...itemProps}
        ref={composedRef}
        className={cn(
          timelineItemVariants({
            orientation,
            variant,
            isAlternateRight,
            className,
          }),
        )}
      />
    </TimelineItemContext.Provider>
  );
}

const timelineContentVariants = cva("cn-timeline-content", {
  variants: {
    orientation: {
      vertical: "",
      horizontal: "",
    },
    variant: {
      default: "",
      alternate: "",
    },
    isAlternateRight: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "alternate",
      orientation: "vertical",
      isAlternateRight: false,
      class: "text-right",
    },
    {
      variant: "alternate",
      orientation: "horizontal",
      isAlternateRight: false,
      class: "row-start-3 pt-2",
    },
    {
      variant: "alternate",
      orientation: "horizontal",
      isAlternateRight: true,
      class: "row-start-1 pb-2",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});

interface TimelineContentProps extends DivProps {}

function TimelineContent(props: TimelineContentProps) {
  const { asChild, className, ...contentProps } = props;

  const { variant, orientation } = useTimelineContext(CONTENT_NAME);
  const { status, isAlternateRight } = useTimelineItemContext(CONTENT_NAME);

  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ContentPrimitive
      data-slot="timeline-content"
      data-status={status}
      {...contentProps}
      className={cn(
        timelineContentVariants({
          orientation,
          variant,
          isAlternateRight,
          className,
        }),
      )}
    />
  );
}

const timelineDotVariants = cva("cn-timeline-dot", {
  variants: {
    status: {
      completed: "cn-timeline-dot-status-completed",
      active: "cn-timeline-dot-status-active",
      pending: "cn-timeline-dot-status-pending",
    },
    orientation: {
      vertical: "",
      horizontal: "",
    },
    variant: {
      default: "",
      alternate: "",
    },
    isAlternateRight: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "alternate",
      orientation: "vertical",
      isAlternateRight: false,
      class:
        "absolute -right-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] bg-background",
    },
    {
      variant: "alternate",
      orientation: "vertical",
      isAlternateRight: true,
      class:
        "absolute -left-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] bg-background",
    },
    {
      variant: "alternate",
      orientation: "horizontal",
      class: "row-start-2 bg-background",
    },
    {
      variant: "alternate",
      status: "completed",
      class: "bg-background",
    },
    {
      variant: "alternate",
      status: "active",
      class: "bg-background",
    },
  ],
  defaultVariants: {
    status: "pending",
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});

interface TimelineDotProps extends DivProps {}

function TimelineDot(props: TimelineDotProps) {
  const { asChild, className, ...dotProps } = props;

  const { orientation, variant } = useTimelineContext(DOT_NAME);
  const { status, isAlternateRight } = useTimelineItemContext(DOT_NAME);

  const DotPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <DotPrimitive
      data-slot="timeline-dot"
      data-status={status}
      data-orientation={orientation}
      {...dotProps}
      className={cn(
        timelineDotVariants({
          status,
          orientation,
          variant,
          isAlternateRight,
          className,
        }),
      )}
    />
  );
}

const timelineConnectorVariants = cva("cn-timeline-connector", {
  variants: {
    isCompleted: {
      true: "cn-timeline-connector-is-completed-true",
      false: "cn-timeline-connector-is-completed-false",
    },
    orientation: {
      vertical: "",
      horizontal: "",
    },
    variant: {
      default: "",
      alternate: "",
    },
    isAlternateRight: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      variant: "default",
      class:
        "start-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] top-3 h-[calc(100%+0.5rem)] w-[var(--timeline-connector-thickness)]",
    },
    {
      orientation: "horizontal",
      variant: "default",
      class:
        "start-3 top-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] h-[var(--timeline-connector-thickness)] w-[calc(100%+0.5rem)]",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: false,
      class:
        "top-2 -right-[calc(var(--timeline-connector-thickness)/2)] h-full w-[var(--timeline-connector-thickness)]",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: true,
      class:
        "top-2 -left-[calc(var(--timeline-connector-thickness)/2)] h-full w-[var(--timeline-connector-thickness)]",
    },
    {
      orientation: "horizontal",
      variant: "alternate",
      class:
        "top-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] left-3 row-start-2 h-[var(--timeline-connector-thickness)] w-[calc(100%+0.5rem)]",
    },
  ],
  defaultVariants: {
    isCompleted: false,
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});

interface TimelineConnectorProps extends DivProps {
  forceMount?: boolean;
}

function TimelineConnector(props: TimelineConnectorProps) {
  const { asChild, forceMount, className, ...connectorProps } = props;

  const { orientation, variant, activeIndex } =
    useTimelineContext(CONNECTOR_NAME);
  const { id, status, isAlternateRight } =
    useTimelineItemContext(CONNECTOR_NAME);

  const store = useStoreContext(CONNECTOR_NAME);
  const nextItemStatus = useStore(
    store,
    selectors.nextItemStatus,
    id,
    activeIndex,
  );

  const isLastItem = nextItemStatus === undefined;

  if (!forceMount && isLastItem) return null;

  const isConnectorCompleted =
    nextItemStatus === "completed" || nextItemStatus === "active";

  const ConnectorPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ConnectorPrimitive
      aria-hidden="true"
      data-slot="timeline-connector"
      data-completed={isConnectorCompleted ? "" : undefined}
      data-status={status}
      data-orientation={orientation}
      {...connectorProps}
      className={cn(
        timelineConnectorVariants({
          isCompleted: isConnectorCompleted,
          orientation,
          variant,
          isAlternateRight,
          className,
        }),
      )}
    />
  );
}

interface TimelineHeaderProps extends DivProps {}

function TimelineHeader(props: TimelineHeaderProps) {
  const { asChild, className, ...headerProps } = props;

  const HeaderPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <HeaderPrimitive
      data-slot="timeline-header"
      {...headerProps}
      className={cn("cn-timeline-header", className)}
    />
  );
}

interface TimelineTitleProps extends DivProps {}

function TimelineTitle(props: TimelineTitleProps) {
  const { asChild, className, ...titleProps } = props;

  const TitlePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <TitlePrimitive
      data-slot="timeline-title"
      {...titleProps}
      className={cn("cn-timeline-title cn-font-heading", className)}
    />
  );
}

interface TimelineDescriptionProps extends DivProps {}

function TimelineDescription(props: TimelineDescriptionProps) {
  const { asChild, className, ...descriptionProps } = props;

  const DescriptionPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <DescriptionPrimitive
      data-slot="timeline-description"
      {...descriptionProps}
      className={cn("cn-timeline-description", className)}
    />
  );
}

interface TimelineTimeProps extends React.ComponentProps<"time"> {
  asChild?: boolean;
}

function TimelineTime(props: TimelineTimeProps) {
  const { asChild, className, ...timeProps } = props;

  const TimePrimitive = asChild ? SlotPrimitive.Slot : "time";

  return (
    <TimePrimitive
      data-slot="timeline-time"
      {...timeProps}
      className={cn("cn-timeline-time", className)}
    />
  );
}

export {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  type TimelineProps,
  TimelineTime,
  TimelineTitle,
};
