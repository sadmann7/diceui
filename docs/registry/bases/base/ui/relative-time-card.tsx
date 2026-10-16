"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import * as React from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/bases/base/ui/hover-card";

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
      className="cn-relative-time-card-timezone-card"
    >
      <span className="cn-relative-time-card-timezone-card-2">
        {timezoneName}
      </span>
      <div className="cn-relative-time-card-timezone-card-3">
        <time dateTime={date.toISOString()}>{formattedDate}</time>
        <time
          className="cn-relative-time-card-timezone-card-4"
          dateTime={date.toISOString()}
        >
          {formattedTime}
        </time>
      </div>
    </div>
  );
}

const triggerVariants = cva("cn-relative-time-card-trigger", {
  variants: {
    variant: {
      default: "",
      muted: "cn-relative-time-card-trigger-variant-muted",
      ghost: "cn-relative-time-card-trigger-variant-ghost",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface RelativeTimeCardProps
  extends
    React.ComponentProps<typeof HoverCard>,
    React.ComponentProps<typeof HoverCardTrigger>,
    Pick<
      React.ComponentProps<typeof HoverCardContent>,
      "align" | "side" | "alignOffset" | "sideOffset"
    >,
    VariantProps<typeof triggerVariants> {
  date: Date | string | number;
  timezones?: string[];
  updateInterval?: number;
  className?: string;
  children?: React.ReactNode;
}

function RelativeTimeCard(props: RelativeTimeCardProps) {
  const {
    date: dateProp,
    variant,
    timezones = ["UTC"],
    open,
    defaultOpen,
    onOpenChange,
    delay = 500,
    closeDelay = 300,
    align,
    side,
    alignOffset,
    sideOffset,
    updateInterval = 1000,
    render,
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

  return (
    <HoverCard
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <HoverCardTrigger
        {...triggerProps}
        delay={delay}
        closeDelay={closeDelay}
        render={render ?? <button type="button" />}
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
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="cn-relative-time-card"
      >
        <time dateTime={date.toISOString()} className="cn-relative-time-card-2">
          {formattedTime}
        </time>
        <div role="list" className="cn-relative-time-card-3">
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
