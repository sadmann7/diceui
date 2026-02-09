"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  type HoverCard as HoverCardPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type HoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root>;
type HoverCardContentProps = React.ComponentProps<
  typeof HoverCardPrimitive.Content
>;

import { cn } from "@/lib/utils";

function pluralize(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const isInFuture = diff < 0;
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 5) return "just now";

  if (isInFuture) {
    if (seconds < 60) return `in ${pluralize(seconds, "second")}`;
    if (minutes < 60) return `in ${pluralize(minutes, "minute")}`;
    if (hours < 24) return `in ${pluralize(hours, "hour")}`;
    if (days < 7) return `in ${pluralize(days, "day")}`;
    return date.toLocaleDateString();
  }

  if (seconds < 60) return `${pluralize(seconds, "second")} ago`;
  if (minutes < 60)
    return `${pluralize(minutes, "minute")} ${pluralize(seconds % 60, "second")} ago`;
  if (hours < 24) return `${pluralize(hours, "hour")} ago`;
  if (days < 7) return `${pluralize(days, "day")} ago`;
  return date.toLocaleDateString();
}

interface TimezoneCardProps extends React.ComponentProps<"div"> {
  date: Date;
  timezone?: string;
}

function TimezoneCard(props: TimezoneCardProps) {
  const { date, timezone, ...cardProps } = props;

  const locale = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().locale,
    [],
  );

  const timezoneName = React.useMemo(
    () =>
      timezone ??
      new Intl.DateTimeFormat(locale, { timeZoneName: "shortOffset" })
        .formatToParts(date)
        .find((part) => part.type === "timeZoneName")?.value,
    [date, timezone, locale],
  );

  const { formattedDate, formattedTime } = React.useMemo(
    () => ({
      formattedDate: new Intl.DateTimeFormat(locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: timezone,
      }).format(date),
      formattedTime: new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: timezone,
      }).format(date),
    }),
    [date, timezone, locale],
  );

  return (
    <div
      role="region"
      aria-label={`Time in ${timezoneName}: ${formattedDate} ${formattedTime}`}
      {...cardProps}
      className="flex items-center justify-between gap-2 text-muted-foreground text-sm"
    >
      <span className="w-fit rounded bg-accent px-1 font-medium text-xs">
        {timezoneName}
      </span>
      <div className="flex items-center gap-2">
        <time dateTime={date.toISOString()}>{formattedDate}</time>
        <time className="tabular-nums" dateTime={date.toISOString()}>
          {formattedTime}
        </time>
      </div>
    </div>
  );
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
  extends React.ComponentProps<"button">,
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

function RelativeTimeCard(props: RelativeTimeCardProps) {
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

  const locale = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().locale,
    [],
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

  const TriggerPrimitive = asChild ? SlotPrimitive.Slot : "button";

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
          className={cn(triggerVariants({ variant, className }))}
        >
          {children ?? (
            <time dateTime={date.toISOString()} suppressHydrationWarning>
              {new Intl.DateTimeFormat(locale, {
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
}

export { RelativeTimeCard };
