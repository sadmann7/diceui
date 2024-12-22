import { useComposedRefs } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const ANCHOR_NAME = "ComboboxAnchor";

interface ComboboxAnchorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const ComboboxAnchor = React.forwardRef<HTMLDivElement, ComboboxAnchorProps>(
  (props, forwardedRef) => {
    const context = useComboboxContext(ANCHOR_NAME);
    const composedRefs = useComposedRefs(
      forwardedRef,
      context.anchorRef,
      (node) => {
        if (node) {
          context.onCustomAnchorAdd();
        } else {
          context.onCustomAnchorRemove();
        }
      },
    );

    return (
      <Primitive.div
        data-state={context.open ? "open" : "closed"}
        data-disabled={context.disabled ? "" : undefined}
        data-anchor=""
        {...props}
        ref={composedRefs}
      />
    );
  },
);

ComboboxAnchor.displayName = ANCHOR_NAME;

const Anchor = ComboboxAnchor;

export { ComboboxAnchor, Anchor };

export type { ComboboxAnchorProps };
