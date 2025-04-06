"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type {
  HoverCardContentProps,
  HoverCardProps,
} from "@radix-ui/react-hover-card";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${plural(seconds, "second")} ago`;
  if (minutes < 60)
    return `${plural(minutes, "minute")} ${plural(seconds % 60, "second")} ago`;
  if (hours < 24) return `${plural(hours, "hour")} ago`;
  if (days < 7) return `${plural(days, "day")} ago`;
  return date.toLocaleDateString();
}

const triggerVariants = cva(
  "inline-flex w-fit items-center justify-center text-foreground/70 text-sm transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "",
        muted: "text-foreground/50 hover:text-foreground/70",
        ghost: "hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface RelativeTimeCardProps
  extends React.ComponentPropsWithoutRef<"button">,
    HoverCardProps,
    Pick<
      HoverCardContentProps,
      | "align"
      | "side"
      | "alignOffset"
      | "sideOffset"
      | "avoidCollisions"
      | "collisionBoundary"
      | "collisionPadding"
      | "asChild"
    >,
    VariantProps<typeof triggerVariants> {
  date: Date | string | number;
  timezones?: string[];
  updateInterval?: number;
}

const RelativeTimeCard = React.forwardRef<
  HTMLButtonElement,
  RelativeTimeCardProps
>((props, forwardedRef) => {
  const {
    date: dateProp,
    variant,
    timezones = ["UTC"],
    open,
    defaultOpen,
    onOpenChange,
    openDelay = 500,
    closeDelay = 300,
    align,
    side,
    alignOffset,
    sideOffset,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    updateInterval = 1000,
    asChild,
    children,
    className,
    ...triggerProps
  } = props;

  const date = React.useMemo(
    () => (dateProp instanceof Date ? dateProp : new Date(dateProp)),
    [dateProp],
  );

  const [formattedTime, setFormattedTime] = React.useState<string>(() =>
    date.toLocaleDateString(),
  );

  React.useEffect(() => {
    setFormattedTime(formatRelativeTime(date));
    const timer = setInterval(() => {
      setFormattedTime(formatRelativeTime(date));
    }, updateInterval);

    return () => clearInterval(timer);
  }, [date, updateInterval]);

  const TriggerPrimitive = asChild ? Slot : "button";

  return (
    <HoverCard
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      openDelay={openDelay}
      closeDelay={closeDelay}
    >
      <HoverCardTrigger asChild>
        <TriggerPrimitive
          {...triggerProps}
          ref={forwardedRef}
          className={cn(triggerVariants({ variant, className }))}
        >
          {children ?? (
            <time dateTime={date.toISOString()} suppressHydrationWarning>
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(date)}
            </time>
          )}
        </TriggerPrimitive>
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        className="flex w-full max-w-[420px] flex-col gap-2 p-3"
      >
        <time
          dateTime={date.toISOString()}
          className="text-muted-foreground text-sm"
        >
          {formattedTime}
        </time>
        <div role="list" className="flex flex-col gap-1">
          {timezones.map((timezone) => (
            <TimezoneCard
              key={timezone}
              role="listitem"
              date={date}
              timezone={timezone}
            />
          ))}
          <TimezoneCard role="listitem" date={date} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});
RelativeTimeCard.displayName = "RelativeTimeCard";

interface TimezoneCardProps extends React.ComponentPropsWithoutRef<"div"> {
  date: Date;
  timezone?: string;
}

const TimezoneCard = React.forwardRef<HTMLDivElement, TimezoneCardProps>(
  (props, forwardedRef) => {
    const { date, timezone, ...cardProps } = props;

    const timezoneName = React.useMemo(
      () =>
        timezone ??
        new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset" })
          .formatToParts(date)
          .find((part) => part.type === "timeZoneName")?.value,
      [date, timezone],
    );

    const { formattedDate, formattedTime } = React.useMemo(
      () => ({
        formattedDate: new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: timezone,
        }).format(date),
        formattedTime: new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: timezone,
        }).format(date),
      }),
      [date, timezone],
    );

    return (
      <div
        aria-label={`Time in ${timezoneName}: ${formattedDate} ${formattedTime}`}
        {...cardProps}
        ref={forwardedRef}
        className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-muted-foreground text-sm"
      >
        <span className="w-fit rounded bg-accent px-1 font-medium text-xs">
          {timezoneName}
        </span>
        <time dateTime={date.toISOString()}>{formattedDate}</time>
        <time className="tabular-nums" dateTime={date.toISOString()}>
          {formattedTime}
        </time>
      </div>
    );
  },
);
TimezoneCard.displayName = "TimezoneCard";

export { RelativeTimeCard };
