import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { createContext, useContext } from "react";
import { type AcceptableInputValue, useTagsInput } from "./tags-input-root";

interface TagsInputItemContextValue {
  value: AcceptableInputValue;
  isSelected: boolean;
  disabled?: boolean;
  textId: string;
  displayValue: string;
}

const TagsInputItemContext = createContext<
  TagsInputItemContextValue | undefined
>(undefined);

export function useTagsInputItem() {
  const context = useContext(TagsInputItemContext);
  if (!context) {
    throw new Error("useTagsInputItem must be used within a TagsInputItem");
  }
  return context;
}

interface TagsInputItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: AcceptableInputValue;
  disabled?: boolean;
  index?: number;
}

const TagsInputItem = React.forwardRef<HTMLDivElement, TagsInputItemProps>(
  (props, ref) => {
    const { value, disabled, index, ...tagsInputItemProps } = props;

    const context = useTagsInput();
    const isSelected = index === context.selectedIndex;
    const itemDisabled = disabled || context.disabled;
    const textId = `tags-input-item-${index}`;
    const displayValue = context.displayValue(value);

    const itemContext: TagsInputItemContextValue = {
      value,
      isSelected,
      disabled: itemDisabled,
      textId,
      displayValue,
    };

    return (
      <TagsInputItemContext.Provider value={itemContext}>
        <Primitive.div
          ref={ref}
          data-tag-item=""
          data-selected={isSelected ? "" : undefined}
          data-disabled={itemDisabled ? "" : undefined}
          data-state={isSelected ? "active" : "inactive"}
          onClick={() => {
            context.inputRef.current?.focus();
          }}
          {...tagsInputItemProps}
        />
      </TagsInputItemContext.Provider>
    );
  },
);

TagsInputItem.displayName = "TagsInputItem";

const Item = TagsInputItem;

export { Item, TagsInputItem };

export type { TagsInputItemProps };
