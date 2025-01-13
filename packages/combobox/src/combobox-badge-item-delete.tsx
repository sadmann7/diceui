import {
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useComboboxBadgeItemContext } from "./combobox-badge-item";
import { useComboboxContext } from "./combobox-root";

const BADGE_ITEM_DELETE_NAME = "ComboboxBadgeItemDelete";

type BadgeItemDeleteElement = React.ElementRef<typeof Primitive.button>;

interface ComboboxBadgeItemDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const ComboboxBadgeItemDelete = React.forwardRef<
  BadgeItemDeleteElement,
  ComboboxBadgeItemDeleteProps
>((props, forwardedRef) => {
  const context = useComboboxContext(BADGE_ITEM_DELETE_NAME);
  const badgeItemContext = useComboboxBadgeItemContext(BADGE_ITEM_DELETE_NAME);
  const buttonRef = React.useRef<BadgeItemDeleteElement | null>(null);
  const composedRef = useComposedRefs(forwardedRef, buttonRef);

  return (
    <Primitive.button
      type="button"
      aria-controls={badgeItemContext.id}
      data-highlighted={badgeItemContext.isHighlighted ? "" : undefined}
      tabIndex={context.disabled ? undefined : -1}
      {...props}
      ref={composedRef}
      onClick={composeEventHandlers(props.onClick, (event) => {
        if (context.disabled) return;

        event.stopPropagation();
        context.onItemRemove(badgeItemContext.value);
        requestAnimationFrame(() => {
          context.inputRef.current?.focus();
        });
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

ComboboxBadgeItemDelete.displayName = BADGE_ITEM_DELETE_NAME;

const BadgeItemDelete = ComboboxBadgeItemDelete;

export { BadgeItemDelete, ComboboxBadgeItemDelete };

export type { ComboboxBadgeItemDeleteProps };
