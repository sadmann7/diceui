import { createContext, Primitive, useComposedRefs } from "@diceui/shared";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const BADGE_LIST_NAME = "ComboboxBadgeList";

interface ComboboxBadgeListContextValue {
  orientation: "horizontal" | "vertical";
  badgeCount: number;
}

const [ComboboxBadgeListProvider, useComboboxBadgeListContext] =
  createContext<ComboboxBadgeListContextValue>(BADGE_LIST_NAME);

type BadgeListElement = React.ElementRef<typeof Primitive.div>;

interface ComboboxBadgeListProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether to force mount the badge list even if there is no selected item.
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
  BadgeListElement,
  ComboboxBadgeListProps
>((props, forwardedRef) => {
  const {
    forceMount = false,
    orientation = "horizontal",
    ...badgeListProps
  } = props;
  const context = useComboboxContext(BADGE_LIST_NAME);
  const values = Array.isArray(context.value) ? context.value : [];
  const composedRef = useComposedRefs(forwardedRef, (node) => {
    // If the list is not rendered, don't need to consider badge list keyboard navigation
    context.onHasBadgeListChange(!!node);
  });

  if (!forceMount && (!context.multiple || values.length === 0)) {
    return null;
  }

  return (
    <ComboboxBadgeListProvider
      orientation={orientation}
      badgeCount={values.length}
    >
      <Primitive.div
        role="listbox"
        aria-multiselectable={context.multiple}
        aria-orientation={orientation}
        data-orientation={orientation}
        {...badgeListProps}
        ref={composedRef}
      />
    </ComboboxBadgeListProvider>
  );
});

ComboboxBadgeList.displayName = BADGE_LIST_NAME;

const BadgeList = ComboboxBadgeList;

export { BadgeList, ComboboxBadgeList, useComboboxBadgeListContext };

export type { ComboboxBadgeListProps, ComboboxBadgeListContextValue };
