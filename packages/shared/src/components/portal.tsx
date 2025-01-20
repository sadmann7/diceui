import * as React from "react";
import * as ReactDOM from "react-dom";
import { useMounted } from "../hooks/use-mounted";
import { Primitive } from "./primitive";

interface PortalProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * The container to mount the portal into.
   * @default document.body
   */
  container?: HTMLElement | DocumentFragment | null;
}

const Portal = React.forwardRef<HTMLDivElement, PortalProps>(
  (props, forwardedRef) => {
    const { container: containerProp, ...portalProps } = props;
    const mounted = useMounted();

    const container =
      containerProp ?? (mounted ? globalThis.document?.body : null);

    if (!container) return null;

    return ReactDOM.createPortal(
      <Primitive.div {...portalProps} ref={forwardedRef} />,
      container,
    );
  },
);

Portal.displayName = "Portal";

export { Portal };

export type { PortalProps };
