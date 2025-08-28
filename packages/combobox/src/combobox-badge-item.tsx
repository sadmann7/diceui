import {
  composeEventHandlers,
  createContext,
  Primitive,
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
  disabled: boolean;
}

const [ComboboxBadgeItemProvider, useComboboxBadgeItemContext] =
  createContext<ComboboxBadgeItemContextValue>(BADGE_ITEM_NAME);

interface ComboboxBadgeItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** The value of the badge item. */
  value: string;

  /**
   * Whether the badge item is disabled.
   * @default false
   */
  disabled?: boolean;
}

const ComboboxBadgeItem = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  ComboboxBadgeItemProps
>((props, forwardedRef) => {
  const { value, disabled, ...badgeItemProps } = props;
  const id = useId();
  const context = useComboboxContext(BADGE_ITEM_NAME);
  const badgeListContext = useComboboxBadgeListContext(BADGE_ITEM_NAME);

  const index = Array.isArray(context.value)
    ? context.value.indexOf(value)
    : -1;
  const isHighlighted = index === context.highlightedBadgeIndex;
  const position = index + 1;

  const isDisabled = disabled || context.disabled;

  return (
    <ComboboxBadgeItemProvider
      value={value}
      id={id}
      isHighlighted={isHighlighted}
      position={position}
      disabled={isDisabled}
    >
      <Primitive.div
        role="option"
        id={id}
        aria-selected={isHighlighted}
        aria-disabled={isDisabled}
        aria-orientation={badgeListContext.orientation}
        aria-posinset={position}
        aria-setsize={badgeListContext.badgeCount}
        data-disabled={isDisabled ? "" : undefined}
        data-highlighted={isHighlighted ? "" : undefined}
        data-orientation={badgeListContext.orientation}
        {...badgeItemProps}
        ref={forwardedRef}
        onFocus={composeEventHandlers(props.onFocus, () => {
          if (!isDisabled) {
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
