import * as React from "react";

import { Portal as PortalPrimitive, type PortalProps } from "@diceui/shared";

const PORTAL_NAME = "ComboboxPortal";

interface ComboboxPortalProps
  extends Pick<PortalProps, "container" | "children"> {}

const ComboboxPortal = React.forwardRef<HTMLDivElement, ComboboxPortalProps>(
  (props, forwardedRef) => {
    const { container, ...portalProps } = props;

    return (
      <PortalPrimitive
        container={container}
        {...portalProps}
        ref={forwardedRef}
        asChild
      />
    );
  },
);

ComboboxPortal.displayName = PORTAL_NAME;

const Portal = ComboboxPortal;

export { ComboboxPortal, Portal };

export type { ComboboxPortalProps };
