"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

type Orientation = "vertical" | "horizontal";
type Position = "left" | "right" | "alternate";
type Status = "default" | "primary" | "success" | "warning" | "destructive";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const ROOT_NAME = "Timeline";
const ITEM_NAME = "TimelineItem";
const DOT_NAME = "TimelineDot";
const CONNECTOR_NAME = "TimelineConnector";

interface TimelineContextValue {
  orientation: Orientation;
  position: Position;
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
  position?: Position;
  asChild?: boolean;
}

function TimelineRoot(props: TimelineRootProps) {
  const {
    orientation = "vertical",
    position = "left",
    asChild,
    className,
    ...rootProps
  } = props;

  const RootPrimitive = asChild ? Slot : "ol";

  return (
    <TimelineContext.Provider value={{ orientation, position }}>
      <RootPrimitive
        data-orientation={orientation}
        data-position={position}
        className={cn(
          "relative flex list-none",
          orientation === "vertical" && "flex-col gap-6",
          orientation === "horizontal" && "flex-row items-start gap-8",
          className,
        )}
        {...rootProps}
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

  const { orientation, position } = useTimelineContext(ITEM_NAME);

  const ItemPrimitive = asChild ? Slot : "li";

  return (
    <TimelineItemContext.Provider value={{ status, active }}>
      <ItemPrimitive
        data-status={status}
        data-active={active}
        className={cn(
          "relative",
          orientation === "vertical" && "flex gap-3 pb-6 last:pb-0",
          orientation === "horizontal" && "flex flex-col gap-3",
          orientation === "vertical" &&
            position === "right" &&
            "flex-row-reverse",
          className,
        )}
        {...itemProps}
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
        className={cn(dotVariants({ status, active, className }))}
        {...dotProps}
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
      vertical: "top-3 left-[5px] h-[calc(100%+1.5rem)] w-[2px]",
      horizontal: "top-[5px] left-3 h-[2px] w-[calc(100%+2rem)]",
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
      className={cn(
        connectorVariants({ orientation, status, className }),
        "last:hidden",
      )}
      {...connectorProps}
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
      className={cn("flex flex-col gap-1", className)}
      {...headerProps}
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
      className={cn("font-semibold leading-none", className)}
      {...titleProps}
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
      className={cn("text-muted-foreground text-sm", className)}
      {...descriptionProps}
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
      className={cn("flex-1 pt-0.5", className)}
      {...contentProps}
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
      className={cn("text-muted-foreground text-xs", className)}
      {...timeProps}
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
