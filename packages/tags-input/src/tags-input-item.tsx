import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { createContext, useContext } from "react";
import { type AcceptableInputValue, useTagsInput } from "./tags-input-root";

interface TagsInputItemContextValue {
  value: AcceptableInputValue;
  isFocused: boolean;
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
    const isFocused = value === context.focusedValue;
    const isEditing = value === context.editingValue;
    const itemDisabled = disabled || context.disabled;
    const textId = `tags-input-item-${value}`;
    const displayValue = context.displayValue(value);

    function onDoubleClick() {
      if (!itemDisabled) {
        context.setEditingValue(value);
      }
    }

    function onKeyDown(event: React.KeyboardEvent) {
      if (event.key === "Enter" && isFocused && !isEditing) {
        context.setEditingValue(value);
        event.preventDefault();
      }
    }

    const itemContext: TagsInputItemContextValue = {
      value,
      isFocused,
      disabled: itemDisabled,
      textId,
      displayValue,
    };

    return (
      <TagsInputItemContext.Provider value={itemContext}>
        <Primitive.div
          ref={ref}
          data-tag-item={itemContext.value}
          aria-current={isFocused}
          data-state={isFocused ? "active" : "inactive"}
          data-focused={isFocused ? "" : undefined}
          data-disabled={itemDisabled ? "" : undefined}
          data-editing={isEditing ? "" : undefined}
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyDown}
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
