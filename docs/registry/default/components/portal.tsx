"use client";

import { Slot, type SlotProps } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";

interface PortalProps extends SlotProps {
  container?: Element | DocumentFragment | null;
}

function Portal(props: PortalProps) {
  const { container: containerProp, ...portalProps } = props;

  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  return ReactDOM.createPortal(<Slot {...portalProps} />, container);
}

export { Portal };

export type { PortalProps };
