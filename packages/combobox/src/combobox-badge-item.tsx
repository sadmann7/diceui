import {
  Primitive,
  composeEventHandlers,
  createContext,
  useId,
} from "@diceui/shared";
import * as React from "react";
import { useComboboxBadgeListContext } from "./combobox-badge-list";
import { useComboboxContext } from "./combobox-root";

const BADGE_ITEM_NAME = "ComboboxBadgeItem";

interface ComboboxBadgeItemContextValue {
  id: string;
  value: string;
  isHighlighted: boolean;
  position: number;
}

const [ComboboxBadgeItemProvider, useComboboxBadgeItemContext] =
  createContext<ComboboxBadgeItemContextValue>(BADGE_ITEM_NAME);

interface ComboboxBadgeItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** The value of the badge item. */
  value: string;
}

const ComboboxBadgeItem = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  ComboboxBadgeItemProps
>((props, forwardedRef) => {
  const { value, ...badgeItemProps } = props;
  const id = useId();
  const context = useComboboxContext(BADGE_ITEM_NAME);
  const badgeListContext = useComboboxBadgeListContext(BADGE_ITEM_NAME);

  const index = Array.isArray(context.value)
    ? context.value.indexOf(value)
    : -1;
  const isHighlighted = index === context.highlightedBadgeIndex;
  const position = index + 1;

  return (
    <ComboboxBadgeItemProvider
      value={value}
      id={id}
      isHighlighted={isHighlighted}
      position={position}
    >
      <Primitive.div
        role="option"
        id={id}
        aria-selected={isHighlighted}
        aria-disabled={context.disabled}
        aria-orientation={badgeListContext.orientation}
        aria-posinset={position}
        aria-setsize={badgeListContext.badgeCount}
        data-highlighted={isHighlighted ? "" : undefined}
        data-disabled={context.disabled ? "" : undefined}
        data-orientation={badgeListContext.orientation}
        {...badgeItemProps}
        ref={forwardedRef}
        onFocus={composeEventHandlers(props.onFocus, () => {
          if (!context.disabled) {
            context.onHighlightedBadgeIndexChange(index);
          }
        })}
        onBlur={composeEventHandlers(props.onBlur, () => {
          if (context.highlightedBadgeIndex === index) {
            context.onHighlightedBadgeIndexChange(-1);
          }
        })}
      />
    </ComboboxBadgeItemProvider>
  );
});

ComboboxBadgeItem.displayName = BADGE_ITEM_NAME;

const BadgeItem = ComboboxBadgeItem;

export { BadgeItem, ComboboxBadgeItem, useComboboxBadgeItemContext };

export type { ComboboxBadgeItemProps, ComboboxBadgeItemContextValue };
