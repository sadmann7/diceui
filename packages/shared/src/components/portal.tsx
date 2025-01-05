import * as React from "react";
import * as ReactDOM from "react-dom";
import { useMounted } from "../hooks/use-mounted";
import { Primitive } from "./primitive";

interface PortalProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * The container to mount the portal into.
   * @default globalThis.document?.body
   */
  container?: HTMLElement | DocumentFragment | null;
}

const Portal = React.forwardRef<HTMLDivElement, PortalProps>(
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

Portal.displayName = "Portal";

export { Portal };

export type { PortalProps };
