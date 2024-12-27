import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxBadgeItemContext } from "./combobox-badge-item";
import { useComboboxContext } from "./combobox-root";

const BADGE_ITEM_CLOSE_NAME = "ComboboxBadgeItemClose";

interface ComboboxBadgeItemCloseProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const ComboboxBadgeItemClose = React.forwardRef<
  React.ElementRef<typeof Primitive.button>,
  ComboboxBadgeItemCloseProps
>((props, forwardedRef) => {
  const context = useComboboxContext(BADGE_ITEM_CLOSE_NAME);
  const badgeItemContext = useComboboxBadgeItemContext(BADGE_ITEM_CLOSE_NAME);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const composedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  return (
    <Primitive.button
      type="button"
      aria-controls={badgeItemContext.id}
      data-highlighted={badgeItemContext.isHighlighted ? "" : undefined}
      tabIndex={context.disabled ? undefined : -1}
      {...props}
      ref={composedRef}
      onClick={composeEventHandlers(props.onClick, (event) => {
        event.stopPropagation();
        if (!context.disabled) {
          context.onItemRemove(badgeItemContext.value);
        }
      })}
      onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
        if (context.disabled) return;

        // prevent implicit pointer capture
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
        }

        if (
          event.button === 0 &&
          event.ctrlKey === false &&
          event.pointerType === "mouse"
        ) {
          // prevent item from stealing focus from the input
          event.preventDefault();
        }
      })}
    />
  );
});

ComboboxBadgeItemClose.displayName = BADGE_ITEM_CLOSE_NAME;

const BadgeItemClose = ComboboxBadgeItemClose;

export { BadgeItemClose, ComboboxBadgeItemClose };

export type { ComboboxBadgeItemCloseProps };
