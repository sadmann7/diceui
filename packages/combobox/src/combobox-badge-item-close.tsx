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

  console.log({ value: context.value });

  return (
    <Primitive.button
      type="button"
      aria-controls={badgeItemContext.id}
      data-disabled={false}
      data-value={badgeItemContext.value}
      tabIndex={context.disabled ? undefined : -1}
      {...props}
      ref={forwardedRef}
      onClick={composeEventHandlers(props.onClick, () => {
        context.onItemRemove(badgeItemContext.value);
      })}
    />
  );
});

ComboboxBadgeItemClose.displayName = BADGE_ITEM_CLOSE_NAME;

const BadgeItemClose = ComboboxBadgeItemClose;

export { BadgeItemClose, ComboboxBadgeItemClose };

export type { ComboboxBadgeItemCloseProps };
