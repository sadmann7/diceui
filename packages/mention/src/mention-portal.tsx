import { Portal as PortalPrimitive, type PortalProps } from "@diceui/shared";
import * as React from "react";

const PORTAL_NAME = "MentionPortal";

interface MentionPortalProps
  extends Pick<PortalProps, "container" | "children"> {}

const MentionPortal = React.forwardRef<HTMLDivElement, MentionPortalProps>(
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

MentionPortal.displayName = PORTAL_NAME;

const Portal = MentionPortal;

export { MentionPortal, Portal };

export type { MentionPortalProps };
