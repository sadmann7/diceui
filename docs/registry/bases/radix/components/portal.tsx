"use client";

import { useIsHydrated } from "@base-ui/utils/hydration";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import * as ReactDOM from "react-dom";

type SlotProps = React.ComponentProps<typeof SlotPrimitive.Slot>;

interface PortalProps extends SlotProps {
  container?: Element | DocumentFragment | null;
}

function Portal(props: PortalProps) {
  const { container: containerProp, ...portalProps } = props;

  const mounted = useIsHydrated();

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  return ReactDOM.createPortal(
    <SlotPrimitive.Slot {...portalProps} />,
    container,
  );
}

export type { PortalProps };
export { Portal };
