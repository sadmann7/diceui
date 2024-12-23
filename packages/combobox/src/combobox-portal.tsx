import * as React from "react";

import { useMounted } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as ReactDOM from "react-dom";

interface PortalProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  container?: HTMLElement | DocumentFragment | null;
}

const ComboboxPortalImpl = React.forwardRef<HTMLDivElement, PortalProps>(
  (props, forwardedRef) => {
    const { container, ...portalProps } = props;
    const mounted = useMounted();

    const dynamicContainer =
      container ?? (mounted ? globalThis.document?.body : null);

    if (!dynamicContainer) return null;

    return ReactDOM.createPortal(
      <Primitive.div {...portalProps} ref={forwardedRef} />,
      dynamicContainer,
    );
  },
);

ComboboxPortalImpl.displayName = "ComboboxPortalImpl";

const PORTAL_NAME = "ComboboxPortal";

interface ComboboxPortalProps
  extends Pick<PortalProps, "container" | "children"> {}

const ComboboxPortal = React.forwardRef<HTMLDivElement, ComboboxPortalProps>(
  (props, forwardedRef) => {
    const { container, ...portalProps } = props;

    return (
      <ComboboxPortalImpl
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
