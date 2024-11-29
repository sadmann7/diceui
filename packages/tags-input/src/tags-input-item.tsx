import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { createContext, useContext } from "react";
import {
  type InputValue,
  type TagValue,
  useTagsInput,
} from "./tags-input-root";

interface TagsInputItemContextValue {
  value: TagValue<InputValue>;
  isFocused: boolean;
  isEditing: boolean;
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
  value: TagValue<InputValue>;
  disabled?: boolean;
}

const TagsInputItem = React.forwardRef<HTMLDivElement, TagsInputItemProps>(
  (props, ref) => {
    const { value, disabled, ...tagsInputItemProps } = props;
    const context = useTagsInput();
    const index = context.values.indexOf(value);
    const isFocused = index === context.focusedIndex;
    const isEditing = index === context.editingIndex;
    const itemDisabled = disabled || context.disabled;
    const id =
      typeof value === "object" && "id" in value ? value.id : value.toString();
    const textId = `tags-input-item-${id}`;
    const displayValue = context.displayValue(value);

    const itemContext: TagsInputItemContextValue = {
      value,
      isFocused,
      isEditing,
      disabled: itemDisabled,
      textId,
      displayValue,
    };

    return (
      <TagsInputItemContext.Provider value={itemContext}>
        <Primitive.div
          ref={ref}
          data-dice-collection-item=""
          data-focused={isFocused ? "" : undefined}
          data-editing={isEditing ? "" : undefined}
          data-state={isFocused ? "active" : "inactive"}
          data-disabled={itemDisabled ? "" : undefined}
          onClick={(event) => {
            event.stopPropagation();
            if (!isEditing) {
              context.setFocusedIndex(index);
              context.inputRef.current?.focus();
            }
          }}
          onDoubleClick={() => {
            if (context.editable && !itemDisabled) {
              context.setEditingIndex(index);
            }
          }}
          {...tagsInputItemProps}
        />
      </TagsInputItemContext.Provider>
    );
  },
);

TagsInputItem.displayName = "TagsInputItem";

const Item = TagsInputItem;

export { Item, TagsInputItem, type TagsInputItemProps };
