import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const BADGE_LIST_NAME = "ComboboxBadgeList";

interface ComboboxBadgeListProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether to force mount the badge list even if the combobox is not multiple or no item is selected.
   * @default false
   */
  forceMount?: boolean;

  /**
   * The orientation of the badge list.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

const ComboboxBadgeList = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  ComboboxBadgeListProps
>((props, forwardedRef) => {
  const {
    forceMount = false,
    orientation = "horizontal",
    ...badgeListProps
  } = props;
  const context = useComboboxContext(BADGE_LIST_NAME);

  if (!forceMount && (!context.multiple || context.value.length === 0)) {
    return null;
  }

  return (
    <Primitive.div
      role="listbox"
      data-orientation={orientation}
      {...badgeListProps}
      ref={forwardedRef}
    />
  );
});

ComboboxBadgeList.displayName = BADGE_LIST_NAME;

const BadgeList = ComboboxBadgeList;

export { BadgeList, ComboboxBadgeList };

export type { ComboboxBadgeListProps };
