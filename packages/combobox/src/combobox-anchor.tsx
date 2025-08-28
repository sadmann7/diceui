import {
  composeEventHandlers,
  Primitive,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const ANCHOR_NAME = "ComboboxAnchor";

type AnchorElement = React.ElementRef<typeof Primitive.div>;

interface ComboboxAnchorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the combobox input should be focused when the anchor is clicked.
   * @default false
   */
  preventInputFocus?: boolean;
}

const ComboboxAnchor = React.forwardRef<AnchorElement, ComboboxAnchorProps>(
  (props, forwardedRef) => {
    const { preventInputFocus, ...anchorProps } = props;
    const context = useComboboxContext(ANCHOR_NAME);
    const composedRef = useComposedRefs(
      forwardedRef,
      context.anchorRef,
      (node) => context.onHasAnchorChange(!!node),
    );
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <Primitive.div
        data-state={context.open ? "open" : "closed"}
        data-anchor=""
        data-disabled={context.disabled ? "" : undefined}
        data-focused={isFocused ? "" : undefined}
        dir={context.dir}
        {...anchorProps}
        ref={composedRef}
        onBlur={composeEventHandlers(anchorProps.onBlur, () =>
          setIsFocused(false),
        )}
        onClick={composeEventHandlers(anchorProps.onClick, (event) => {
          if (preventInputFocus) return;
          event.currentTarget.focus();
          context.inputRef.current?.focus();
        })}
        onFocus={composeEventHandlers(anchorProps.onFocus, () =>
          setIsFocused(true),
        )}
        onPointerDown={composeEventHandlers(
          anchorProps.onPointerDown,
          (event) => {
            if (context.disabled) return;

            // prevent implicit pointer capture
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (target.hasPointerCapture(event.pointerId)) {
              target.releasePointerCapture(event.pointerId);
            }

            // Only prevent default if we're not clicking on the input
            // This allows text selection in the input while still preventing focus stealing elsewhere
            if (
              event.button === 0 &&
              event.ctrlKey === false &&
              event.pointerType === "mouse" &&
              !(event.target instanceof HTMLInputElement)
            ) {
              event.preventDefault();
            }
          },
        )}
      />
    );
  },
);

ComboboxAnchor.displayName = ANCHOR_NAME;

const Anchor = ComboboxAnchor;

export { Anchor, ComboboxAnchor };

export type { ComboboxAnchorProps, AnchorElement };
