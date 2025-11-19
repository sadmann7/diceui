"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

type Direction = "ltr" | "rtl";
type Orientation = "vertical" | "horizontal";
type Status = "default" | "primary" | "success" | "warning" | "destructive";

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
  orientation: Orientation;
  dir: Direction;
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null);

function useTimelineContext(consumerName: string) {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface TimelineRootProps extends React.ComponentProps<"ol"> {
  orientation?: Orientation;
  dir?: Direction;
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
    () => ({ orientation, dir }),
    [orientation, dir],
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
        className={cn(
          "relative flex list-none",
          orientation === "vertical" && "flex-col gap-6",
          orientation === "horizontal" && "flex-row items-start gap-8",
          className,
        )}
      />
    </TimelineContext.Provider>
  );
}

interface TimelineItemContextValue {
  status: Status;
  active: boolean;
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
  active?: boolean;
  status?: Status;
  asChild?: boolean;
}

function TimelineItem(props: TimelineItemProps) {
  const {
    active = false,
    status = "default",
    asChild,
    className,
    ...itemProps
  } = props;

  const { orientation, dir } = useTimelineContext(ITEM_NAME);

  const itemContextValue = React.useMemo<TimelineItemContextValue>(
    () => ({ status, active }),
    [status, active],
  );

  const ItemPrimitive = asChild ? Slot : "li";

  return (
    <TimelineItemContext.Provider value={itemContextValue}>
      <ItemPrimitive
        data-slot="timeline-item"
        data-status={status}
        data-active={active}
        {...itemProps}
        dir={dir}
        className={cn(
          "relative",
          orientation === "vertical" && "flex gap-3 pb-6 last:pb-0",
          orientation === "horizontal" && "flex flex-col gap-3",
          className,
        )}
      />
    </TimelineItemContext.Provider>
  );
}

const dotVariants = cva(
  "absolute z-10 flex size-3 items-center justify-center rounded-full border-2 bg-background",
  {
    variants: {
      status: {
        default: "border-border",
        primary: "border-primary bg-primary/10",
        success: "border-green-500 bg-green-500/10",
        warning: "border-yellow-500 bg-yellow-500/10",
        destructive: "border-destructive bg-destructive/10",
      },
      active: {
        true: "ring-2 ring-ring ring-offset-2 ring-offset-background",
        false: "",
      },
    },
    defaultVariants: {
      status: "default",
      active: false,
    },
  },
);

interface TimelineDotProps extends DivProps {
  asChild?: boolean;
}

function TimelineDot(props: TimelineDotProps) {
  const { asChild, className, ...dotProps } = props;

  const { status, active } = useTimelineItemContext(DOT_NAME);

  const DotPrimitive = asChild ? Slot : "div";

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <DotPrimitive
        data-slot="timeline-dot"
        data-status={status}
        data-active={active}
        {...dotProps}
        className={cn(dotVariants({ status, active, className }))}
      />
    </div>
  );
}

interface TimelineConnectorProps extends DivProps {
  asChild?: boolean;
}

const connectorVariants = cva("absolute bg-border", {
  variants: {
    orientation: {
      vertical: "start-[5px] top-3 h-[calc(100%+1.5rem)] w-[2px]",
      horizontal: "start-3 top-[5px] h-[2px] w-[calc(100%+2rem)]",
    },
    status: {
      default: "bg-border",
      primary: "bg-primary/30",
      success: "bg-green-500/30",
      warning: "bg-yellow-500/30",
      destructive: "bg-destructive/30",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    status: "default",
  },
});

function TimelineConnector(props: TimelineConnectorProps) {
  const { asChild, className, ...connectorProps } = props;

  const { status } = useTimelineItemContext(CONNECTOR_NAME);
  const { orientation } = useTimelineContext(CONNECTOR_NAME);

  const ConnectorPrimitive = asChild ? Slot : "div";

  return (
    <ConnectorPrimitive
      aria-hidden="true"
      data-slot="timeline-connector"
      data-status={status}
      data-orientation={orientation}
      {...connectorProps}
      className={cn(
        connectorVariants({ orientation, status, className }),
        "last:hidden",
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
