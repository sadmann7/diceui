import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { createContext, useContext } from "react";
import { type AcceptableInputValue, useTagsInput } from "./tags-input-root";

interface TagsInputItemContextValue {
  value: AcceptableInputValue;
  focused: boolean;
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
}

const TagsInputItem = React.forwardRef<HTMLDivElement, TagsInputItemProps>(
  (props, ref) => {
    const { value, disabled, ...tagsInputItemProps } = props;

    const context = useTagsInput();
    const focused = value === context.selectedValue;
    const itemDisabled = disabled || context.disabled;
    const textId = `tags-input-item-${value}`;
    const displayValue = context.displayValue(value);

    const itemContext: TagsInputItemContextValue = {
      value,
      focused,
      disabled: itemDisabled,
      textId,
      displayValue,
    };

    return (
      <TagsInputItemContext.Provider value={itemContext}>
        <Primitive.div
          ref={ref}
          data-tag-item=""
          aria-current={focused ? "true" : "false"}
          data-state={focused ? "active" : "inactive"}
          data-focused={focused ? "" : undefined}
          data-disabled={itemDisabled ? "" : undefined}
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
