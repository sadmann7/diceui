"use client";

import { useRender } from "@base-ui/react/use-render";
import { useIsHydrated } from "@base-ui/utils/hydration";
import * as React from "react";
import * as ReactDOM from "react-dom";

interface PortalProps extends useRender.ComponentProps<"div"> {
  container?: Element | DocumentFragment | null;
}

function Portal(props: PortalProps) {
  const { container: containerProp, render, ...portalProps } = props;

  const mounted = useIsHydrated();

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  const element = useRender({
    props: portalProps,
    render,
    state: {
      slot: "portal",
    },
  });

  if (!container) return null;

  return ReactDOM.createPortal(element, container);
}

export type { PortalProps };
export { Portal };
