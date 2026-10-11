"use client";

import type * as React from "react";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";

interface SkipLinkProps extends useRender.ComponentProps<"a"> {}

function SkipLink(props: SkipLinkProps) {
  const {
    href = "#main-content",
    children = "Skip to content",
    className,
    render,
    ...linkProps
  } = props;

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        href,
        children,
        className: cn(
          "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        ),
        onClick: (event) => {
          if (event.defaultPrevented) return;
          skipToTarget(event, href);
        },
      },
      linkProps,
    ),
    render,
    state: {
      slot: "skip-link",
    },
  });
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

export { SkipLink };
