"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

type Direction = "ltr" | "rtl";
type Orientation = "vertical" | "horizontal";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const ROOT_NAME = "Timeline";
const ITEM_NAME = "TimelineItem";
const DOT_NAME = "TimelineDot";
const CONNECTOR_NAME = "TimelineConnector";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface TimelineContextValue {
  dir: Direction;
  orientation: Orientation;
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
      vertical: "flex-col gap-6",
      horizontal: "flex-row items-start gap-8",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

interface TimelineRootProps extends React.ComponentProps<"ol"> {
  dir?: Direction;
  orientation?: Orientation;
  asChild?: boolean;
}

function TimelineRoot(props: TimelineRootProps) {
  const {
    orientation = "vertical",
    dir: dirProp,
    asChild,
    className,
    ...rootProps
  } = props;

  const dir = useDirection(dirProp);

  const contextValue = React.useMemo<TimelineContextValue>(
    () => ({
      dir,
      orientation,
    }),
    [dir, orientation],
  );

  const RootPrimitive = asChild ? Slot : "ol";

  return (
    <TimelineContext.Provider value={contextValue}>
      <RootPrimitive
        aria-orientation={orientation}
        data-orientation={orientation}
        data-slot="timeline"
        {...rootProps}
        dir={dir}
        className={cn(timelineVariants({ orientation }), className)}
      />
    </TimelineContext.Provider>
  );
}

interface TimelineItemContextValue {
  completed: boolean;
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

interface TimelineItemProps extends React.ComponentProps<"li"> {
  completed?: boolean;
  asChild?: boolean;
}

function TimelineItem(props: TimelineItemProps) {
  const { completed = false, asChild, className, ...itemProps } = props;

  const { dir, orientation } = useTimelineContext(ITEM_NAME);

  const itemContextValue = React.useMemo<TimelineItemContextValue>(
    () => ({ completed }),
    [completed],
  );

  const ItemPrimitive = asChild ? Slot : "li";

  return (
    <TimelineItemContext.Provider value={itemContextValue}>
      <ItemPrimitive
        data-slot="timeline-item"
        data-completed={completed ? "" : undefined}
        data-orientation={orientation}
        dir={dir}
        {...itemProps}
        className={cn(
          "relative flex",
          orientation === "vertical" && "gap-3 pb-8 last:pb-0",
          orientation === "horizontal" && "flex-col gap-3",
          className,
        )}
      />
    </TimelineItemContext.Provider>
  );
}

interface TimelineDotProps extends DivProps {
  asChild?: boolean;
}

function TimelineDot(props: TimelineDotProps) {
  const { asChild, className, ...dotProps } = props;

  const { orientation } = useTimelineContext(DOT_NAME);
  const { completed } = useTimelineItemContext(DOT_NAME);

  const DotPrimitive = asChild ? Slot : "div";

  return (
    <div className="relative flex size-4 shrink-0 items-center justify-center">
      <DotPrimitive
        data-slot="timeline-dot"
        data-completed={completed ? "" : undefined}
        data-orientation={orientation}
        {...dotProps}
        className={cn(
          "z-10 flex size-3 items-center justify-center rounded-full border-2 bg-background",
          completed && "border-primary bg-primary/10",
          !completed && "border-border",
          className,
        )}
      />
    </div>
  );
}

interface TimelineConnectorProps extends DivProps {
  asChild?: boolean;
}

function TimelineConnector(props: TimelineConnectorProps) {
  const { asChild, className, ...connectorProps } = props;

  const { orientation } = useTimelineContext(CONNECTOR_NAME);
  const { completed } = useTimelineItemContext(CONNECTOR_NAME);

  const ConnectorPrimitive = asChild ? Slot : "div";

  return (
    <ConnectorPrimitive
      aria-hidden="true"
      data-slot="timeline-connector"
      data-completed={completed ? "" : undefined}
      data-orientation={orientation}
      {...connectorProps}
      className={cn(
        "absolute",
        completed ? "bg-primary/30" : "bg-border",
        orientation === "vertical" &&
          "start-[7px] top-4 h-[calc(100%+0.5rem)] w-[2px]",
        orientation === "horizontal" &&
          "start-4 top-[7px] h-[2px] w-[calc(100%+0.5rem)]",
        className,
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

interface TimelineContentProps extends DivProps {
  asChild?: boolean;
}

function TimelineContent(props: TimelineContentProps) {
  const { asChild, className, ...contentProps } = props;

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      data-slot="timeline-content"
      {...contentProps}
      className={cn("flex-1 pt-0.5", className)}
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
