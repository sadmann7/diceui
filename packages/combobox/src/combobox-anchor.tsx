import { useComposedRefs } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const ANCHOR_NAME = "ComboboxAnchor";

interface ComboboxAnchorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * A virtual ref to be used instead of the actual anchor ref.
   * This is useful for cases where the anchor is not a DOM element,
   * such as when the anchor is a Popover.
   */
  virtualRef?: React.RefObject<HTMLDivElement | null>;
}

const ComboboxAnchor = React.forwardRef<HTMLDivElement, ComboboxAnchorProps>(
  (props, forwardedRef) => {
    const { virtualRef, ...anchorProps } = props;
    const context = useComboboxContext(ANCHOR_NAME);
    const composedRef = useComposedRefs(
      forwardedRef,
      virtualRef || context.anchorRef,
      (node) => context.onHasAnchorChange(!!node),
    );

    return (
      <Primitive.div
        data-state={context.open ? "open" : "closed"}
        data-disabled={context.disabled ? "" : undefined}
        data-anchor=""
        {...anchorProps}
        ref={composedRef}
      />
    );
  },
);

ComboboxAnchor.displayName = ANCHOR_NAME;

const Anchor = ComboboxAnchor;

export { Anchor, ComboboxAnchor };

export type { ComboboxAnchorProps };
