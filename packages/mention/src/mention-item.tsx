import { Primitive, composeEventHandlers } from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

export interface MentionItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.li> {
  value: string;
}

export const MentionItem = React.forwardRef<HTMLLIElement, MentionItemProps>(
  ({ value, onClick, ...props }, ref) => {
    const { onSelect, state } = useMentionContext("MentionItem");
    const isSelected = state.selectedValue === value;

    return (
      <Primitive.li
        ref={ref}
        data-selected={isSelected ? "" : undefined}
        onClick={composeEventHandlers(onClick, () => onSelect(value))}
        {...props}
      />
    );
  },
);

MentionItem.displayName = "MentionItem";
