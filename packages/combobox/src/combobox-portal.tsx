import * as React from "react";

import { Portal as PortalPrimitive, type PortalProps } from "@diceui/shared";
import { useComboboxContext } from "./combobox-root";

const PORTAL_NAME = "ComboboxPortal";

interface ComboboxPortalProps
  extends Pick<PortalProps, "container" | "children"> {}

const ComboboxPortal = React.forwardRef<HTMLDivElement, ComboboxPortalProps>(
  (props, forwardedRef) => {
    const { container, ...portalProps } = props;
    const context = useComboboxContext(PORTAL_NAME);

    return (
      <PortalPrimitive
        // TODO: fix portal event bubbling
        container={container ?? context.collectionRef.current}
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
