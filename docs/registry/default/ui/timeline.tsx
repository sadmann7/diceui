"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

type Direction = "ltr" | "rtl";
type Orientation = "vertical" | "horizontal";
type Variant = "default" | "alternate";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type ItemElement = React.ComponentRef<typeof TimelineItem>;

const ROOT_NAME = "Timeline";
const ITEM_NAME = "TimelineItem";
const DOT_NAME = "TimelineDot";
const CONNECTOR_NAME = "TimelineConnector";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

interface ItemState {
  completed: boolean;
  ref: React.RefObject<HTMLLIElement | null>;
}

interface StoreState {
  items: Map<string, ItemState>;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  notify: () => void;
  onItemRegister: (
    id: string,
    completed: boolean,
    ref: React.RefObject<ItemElement | null>,
  ) => void;
  onItemUnregister: (id: string) => void;
  getNextItemCompleted: (id: string) => boolean | undefined;
  getItemIndex: (id: string) => number;
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
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null);

function useTimelineContext(consumerName: string) {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const timelineVariants = cva("relative flex list-none", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-start",
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
      class: "items-center gap-6",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
  },
});

interface TimelineRootProps extends React.ComponentProps<"ol"> {
  dir?: Direction;
  orientation?: Orientation;
  variant?: Variant;
  asChild?: boolean;
}

function TimelineRoot(props: TimelineRootProps) {
  const {
    orientation = "vertical",
    variant = "default",
    dir: dirProp,
    asChild,
    className,
    ...rootProps
  } = props;

  const dir = useDirection(dirProp);

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    items: new Map(),
  }));

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
      onItemRegister: (
        id: string,
        completed: boolean,
        ref: React.RefObject<ItemElement | null>,
      ) => {
        stateRef.current.items.set(id, { completed, ref });
        store.notify();
      },
      onItemUnregister: (id: string) => {
        stateRef.current.items.delete(id);
        store.notify();
      },
      getNextItemCompleted: (id: string) => {
        const entries = Array.from(stateRef.current.items.entries());

        const sortedEntries = entries.sort((a, b) => {
          const elementA = a[1].ref.current;
          const elementB = b[1].ref.current;
          if (!elementA || !elementB) return 0;
          const position = elementA.compareDocumentPosition(elementB);
          if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return -1;
          }
          if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1;
          }
          return 0;
        });

        const currentIndex = sortedEntries.findIndex(([key]) => key === id);
        if (currentIndex === -1 || currentIndex === sortedEntries.length - 1) {
          return undefined;
        }
        const nextEntry = sortedEntries[currentIndex + 1];
        return nextEntry ? nextEntry[1].completed : undefined;
      },
      getItemIndex: (id: string) => {
        const entries = Array.from(stateRef.current.items.entries());

        const sortedEntries = entries.sort((a, b) => {
          const elementA = a[1].ref.current;
          const elementB = b[1].ref.current;
          if (!elementA || !elementB) return 0;
          const position = elementA.compareDocumentPosition(elementB);
          if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return -1;
          }
          if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1;
          }
          return 0;
        });

        return sortedEntries.findIndex(([key]) => key === id);
      },
    };
  }, [listenersRef, stateRef]);

  const contextValue = React.useMemo<TimelineContextValue>(
    () => ({
      dir,
      orientation,
      variant,
    }),
    [dir, orientation, variant],
  );

  const RootPrimitive = asChild ? Slot : "ol";

  return (
    <StoreContext.Provider value={store}>
      <TimelineContext.Provider value={contextValue}>
        <RootPrimitive
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
  completed: boolean;
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

const timelineItemVariants = cva("relative flex", {
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
      class: "w-1/2 gap-3 pr-8 pb-12 last:pb-0",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: true,
      class: "ml-auto w-1/2 flex-row-reverse gap-3 pb-12 pl-8 last:pb-0",
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

interface TimelineItemProps extends React.ComponentProps<"li"> {
  completed?: boolean;
  asChild?: boolean;
}

function TimelineItem(props: TimelineItemProps) {
  const { completed = false, asChild, className, ...itemProps } = props;

  const { dir, orientation, variant } = useTimelineContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const id = React.useId();
  const itemRef = React.useRef<HTMLLIElement>(null);

  useIsomorphicLayoutEffect(() => {
    store.onItemRegister(id, completed, itemRef);
    return () => {
      store.onItemUnregister(id);
    };
  }, [id, completed, store]);

  const getSnapshot = React.useCallback(() => {
    return store.getItemIndex(id);
  }, [id, store]);

  const itemIndex = React.useSyncExternalStore(
    store.subscribe,
    getSnapshot,
    getSnapshot,
  );

  const isAlternateRight = variant === "alternate" && itemIndex % 2 === 1;

  const itemContextValue = React.useMemo<TimelineItemContextValue>(
    () => ({ id, completed, isAlternateRight }),
    [id, completed, isAlternateRight],
  );

  const ItemPrimitive = asChild ? Slot : "li";

  return (
    <TimelineItemContext.Provider value={itemContextValue}>
      <ItemPrimitive
        ref={itemRef}
        data-slot="timeline-item"
        data-completed={completed ? "" : undefined}
        data-orientation={orientation}
        data-alternate-right={isAlternateRight ? "" : undefined}
        dir={dir}
        {...itemProps}
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

const timelineDotVariants = cva(
  "relative z-10 flex size-3 shrink-0 items-center justify-center rounded-full border-2",
  {
    variants: {
      completed: {
        true: "border-primary bg-primary/10",
        false: "border-border bg-background",
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
        class: "-right-[6px] absolute bg-background",
      },
      {
        variant: "alternate",
        orientation: "vertical",
        isAlternateRight: true,
        class: "-left-[6px] absolute bg-background",
      },
      {
        variant: "alternate",
        orientation: "horizontal",
        class: "row-start-2 bg-background",
      },
      {
        variant: "alternate",
        completed: true,
        class: "bg-background",
      },
    ],
    defaultVariants: {
      completed: false,
      orientation: "vertical",
      variant: "default",
      isAlternateRight: false,
    },
  },
);

interface TimelineDotProps extends DivProps {
  asChild?: boolean;
}

function TimelineDot(props: TimelineDotProps) {
  const { asChild, className, ...dotProps } = props;

  const { orientation, variant } = useTimelineContext(DOT_NAME);
  const { completed, isAlternateRight } = useTimelineItemContext(DOT_NAME);

  const DotPrimitive = asChild ? Slot : "div";

  return (
    <DotPrimitive
      data-slot="timeline-dot"
      data-completed={completed ? "" : undefined}
      data-orientation={orientation}
      {...dotProps}
      className={cn(
        timelineDotVariants({
          completed,
          orientation,
          variant,
          isAlternateRight,
          className,
        }),
      )}
    />
  );
}

const timelineConnectorVariants = cva("absolute z-0", {
  variants: {
    completed: {
      true: "bg-primary/30",
      false: "bg-border",
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
      class: "start-[5px] top-3 h-[calc(100%+0.5rem)] w-[2px]",
    },
    {
      orientation: "horizontal",
      variant: "default",
      class: "start-3 top-[5px] h-[2px] w-[calc(100%+0.5rem)]",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: false,
      class: "-right-px top-2 h-full w-[2px]",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: true,
      class: "-left-px top-2 h-full w-[2px]",
    },
    {
      orientation: "horizontal",
      variant: "alternate",
      class: "top-[5px] left-3 row-start-2 h-[2px] w-[calc(100%+0.5rem)]",
    },
  ],
  defaultVariants: {
    completed: false,
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});

interface TimelineConnectorProps extends DivProps {
  asChild?: boolean;
  forceMount?: boolean;
}

function TimelineConnector(props: TimelineConnectorProps) {
  const { asChild, forceMount, className, ...connectorProps } = props;

  const { orientation, variant } = useTimelineContext(CONNECTOR_NAME);
  const store = useStoreContext(CONNECTOR_NAME);
  const { id, completed, isAlternateRight } =
    useTimelineItemContext(CONNECTOR_NAME);

  const getSnapshot = React.useCallback(() => {
    return store.getNextItemCompleted(id);
  }, [id, store]);

  const nextCompleted = React.useSyncExternalStore(
    store.subscribe,
    getSnapshot,
    getSnapshot,
  );

  const isLastItem = nextCompleted === undefined;

  if (!forceMount && isLastItem) return null;

  const isConnectorCompleted = completed && nextCompleted;

  const ConnectorPrimitive = asChild ? Slot : "div";

  return (
    <ConnectorPrimitive
      aria-hidden="true"
      data-slot="timeline-connector"
      data-completed={isConnectorCompleted ? "" : undefined}
      data-orientation={orientation}
      {...connectorProps}
      className={cn(
        timelineConnectorVariants({
          completed: isConnectorCompleted,
          orientation,
          variant,
          isAlternateRight,
          className,
        }),
      )}
    />
  );
}

interface TimelineHeaderProps extends DivProps {
  asChild?: boolean;
}

function TimelineHeader(props: TimelineHeaderProps) {
  const { asChild, className, ...headerProps } = props;

  const HeaderPrimitive = asChild ? Slot : "div";

  return (
    <HeaderPrimitive
      data-slot="timeline-header"
      {...headerProps}
      className={cn("flex flex-col gap-1", className)}
    />
  );
}

interface TimelineTitleProps extends DivProps {
  asChild?: boolean;
}

function TimelineTitle(props: TimelineTitleProps) {
  const { asChild, className, ...titleProps } = props;

  const TitlePrimitive = asChild ? Slot : "div";

  return (
    <TitlePrimitive
      data-slot="timeline-title"
      {...titleProps}
      className={cn("font-semibold leading-none", className)}
    />
  );
}

interface TimelineDescriptionProps extends DivProps {
  asChild?: boolean;
}

function TimelineDescription(props: TimelineDescriptionProps) {
  const { asChild, className, ...descriptionProps } = props;

  const DescriptionPrimitive = asChild ? Slot : "div";

  return (
    <DescriptionPrimitive
      data-slot="timeline-description"
      {...descriptionProps}
      className={cn("text-muted-foreground text-sm", className)}
    />
  );
}

const timelineContentVariants = cva("flex-1 pt-0.5", {
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
      class: "row-start-3 pt-3",
    },
    {
      variant: "alternate",
      orientation: "horizontal",
      isAlternateRight: true,
      class: "row-start-1 pb-3",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});

interface TimelineContentProps extends DivProps {
  asChild?: boolean;
}

function TimelineContent(props: TimelineContentProps) {
  const { asChild, className, ...contentProps } = props;

  const { variant, orientation } = useTimelineContext("TimelineContent");
  const { isAlternateRight } = useTimelineItemContext("TimelineContent");

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      data-slot="timeline-content"
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

interface TimelineTimeProps extends React.ComponentProps<"time"> {
  asChild?: boolean;
}

function TimelineTime(props: TimelineTimeProps) {
  const { asChild, className, ...timeProps } = props;

  const TimePrimitive = asChild ? Slot : "time";

  return (
    <TimePrimitive
      data-slot="timeline-time"
      {...timeProps}
      className={cn("text-muted-foreground text-xs", className)}
    />
  );
}

export {
  TimelineRoot as Root,
  TimelineItem as Item,
  TimelineDot as Dot,
  TimelineConnector as Connector,
  TimelineHeader as Header,
  TimelineTitle as Title,
  TimelineDescription as Description,
  TimelineContent as Content,
  TimelineTime as Time,
  //
  TimelineRoot as Timeline,
  TimelineItem,
  TimelineDot,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineContent,
  TimelineTime,
};
