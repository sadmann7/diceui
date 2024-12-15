import { useComposedRefs } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const ANCHOR_NAME = "ComboboxAnchor";

interface ComboboxAnchorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const ComboboxAnchor = React.forwardRef<HTMLDivElement, ComboboxAnchorProps>(
  (props, forwardedRef) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);

    return <Primitive.div ref={composedRefs} {...props} />;
  },
);

ComboboxAnchor.displayName = ANCHOR_NAME;

export { ComboboxAnchor };

export type { ComboboxAnchorProps };
