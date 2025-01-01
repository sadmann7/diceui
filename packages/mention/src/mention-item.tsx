import { Primitive, composeEventHandlers } from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const ITEM_NAME = "MentionItem";

interface MentionItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
}

const MentionItem = React.forwardRef<HTMLDivElement, MentionItemProps>(
  ({ value, ...props }, ref) => {
    const context = useMentionContext(ITEM_NAME);
    const isSelected = context.selectedValue === value;

    return (
      <Primitive.div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        data-selected={isSelected ? "" : undefined}
        onClick={composeEventHandlers(props.onClick, () =>
          context.onItemSelect(value),
        )}
        {...props}
      />
    );
  },
);

MentionItem.displayName = ITEM_NAME;

const Item = MentionItem;

export { MentionItem, Item };

export type { MentionItemProps };
