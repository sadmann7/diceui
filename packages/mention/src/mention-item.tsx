import {
  Primitive,
  composeEventHandlers,
  composeRefs,
  createContext,
} from "@diceui/shared";
import * as React from "react";
import { CollectionItem, useMentionContext } from "./mention-root";

const ITEM_NAME = "MentionItem";

interface MentionItemContext {
  textValue: string;
  value: string;
  disabled: boolean;
}

const [MentionItemProvider, useMentionItemContext] =
  createContext<MentionItemContext>(ITEM_NAME);

interface MentionItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
  disabled?: boolean;
}

const MentionItem = React.forwardRef<HTMLDivElement, MentionItemProps>(
  (props, forwardedRef) => {
    const { value, disabled = false, ...itemProps } = props;
    const context = useMentionContext(ITEM_NAME);
    const [textNode, setTextNode] = React.useState<HTMLDivElement | null>(null);
    const composedRef = composeRefs(forwardedRef, (node) => setTextNode(node));

    const textValue = textNode?.textContent ?? "";
    const isDisabled = disabled || context.disabled;
    const isSelected = context.selectedValue === value;

    return (
      <MentionItemProvider
        textValue={textValue}
        value={value}
        disabled={isDisabled}
      >
        <CollectionItem
          textValue={textValue}
          value={value}
          disabled={isDisabled}
        >
          <Primitive.div
            role="option"
            aria-selected={isSelected}
            data-selected={isSelected ? "" : undefined}
            onClick={composeEventHandlers(itemProps.onClick, () =>
              context.onItemSelect(value),
            )}
            {...itemProps}
            ref={composedRef}
          />
        </CollectionItem>
      </MentionItemProvider>
    );
  },
);

MentionItem.displayName = ITEM_NAME;

const Item = MentionItem;

export { Item, MentionItem, useMentionItemContext };

export type { MentionItemProps };
