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

  if (!context.multiple) return null;

  const badgeItemContext = useComboboxBadgeItemContext(BADGE_ITEM_CLOSE_NAME);

  return (
    <Primitive.button
      type="button"
      aria-controls={badgeItemContext.id}
      {...props}
      ref={forwardedRef}
      onClick={composeEventHandlers(props.onClick, () => {
        if (Array.isArray(context.value)) {
          context.onValueChange(
            context.value.filter((v) => v !== badgeItemContext.value),
          );
        }
      })}
    />
  );
});

ComboboxBadgeItemClose.displayName = BADGE_ITEM_CLOSE_NAME;

const BadgeItemClose = ComboboxBadgeItemClose;

export { BadgeItemClose, ComboboxBadgeItemClose };

export type { ComboboxBadgeItemCloseProps };
