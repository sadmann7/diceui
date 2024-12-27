import { createContext, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const BADGE_ITEM_NAME = "ComboboxBadgeItem";

interface ComboboxBadgeItemContextValue {
  id: string;
  value: string;
}

const [ComboboxBadgeItemProvider, useComboboxBadgeItemContext] =
  createContext<ComboboxBadgeItemContextValue>(BADGE_ITEM_NAME);

interface ComboboxBadgeItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
}

const ComboboxBadgeItem = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  ComboboxBadgeItemProps
>((props, forwardedRef) => {
  const { value, ...badgeItemProps } = props;
  const context = useComboboxContext(BADGE_ITEM_NAME);
  const id = useId();

  if (!context.multiple) return null;

  return (
    <ComboboxBadgeItemProvider value={value} id={id}>
      <Primitive.div
        id={id}
        role="listitem"
        {...badgeItemProps}
        ref={forwardedRef}
      />
    </ComboboxBadgeItemProvider>
  );
});

ComboboxBadgeItem.displayName = BADGE_ITEM_NAME;

const BadgeItem = ComboboxBadgeItem;

export { BadgeItem, ComboboxBadgeItem, useComboboxBadgeItemContext };

export type { ComboboxBadgeItemProps };
