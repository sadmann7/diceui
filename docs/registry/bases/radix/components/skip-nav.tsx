"use client";

import type * as React from "react";

import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import { composeEventHandlers } from "radix-ui/internal";

const MAIN_CONTENT_ID = "main-content";

interface SkipNavProps extends React.ComponentProps<"a"> {
  asChild?: boolean;
}

function SkipNav(props: SkipNavProps) {
  const {
    href = `#${MAIN_CONTENT_ID}`,
    children = "Skip to content",
    asChild,
    className,
    onClick,
    ...linkProps
  } = props;

  const LinkPrimitive = asChild ? SlotPrimitive.Slot : "a";

  return (
    <LinkPrimitive
      data-slot="skip-nav"
      {...linkProps}
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={composeEventHandlers(onClick, (event) =>
        skipToTarget(event, href),
      )}
    >
      {children}
    </LinkPrimitive>
  );
}

function skipToTarget(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  const target = getTarget(href);
  if (!target) return;

  event.preventDefault();
  if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) {
    makeTemporarilyFocusable(target);
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start" });
}

function makeTemporarilyFocusable(target: HTMLElement) {
  const outline = target.style.outline;

  target.tabIndex = -1;
  target.style.outline = "none";
  target.addEventListener(
    "blur",
    () => {
      target.removeAttribute("tabindex");
      target.style.outline = outline;
    },
    { once: true },
  );
}

function getTarget(href: string) {
  if (!href.startsWith("#") || href.length < 2) return null;
  return document.getElementById(decodeURIComponent(href.slice(1)));
}

export { MAIN_CONTENT_ID, SkipNav };
