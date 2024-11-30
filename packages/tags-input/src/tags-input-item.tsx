import { composeEventHandlers, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { createContext, useContext } from "react";
import {
  type InputValue,
  type TagValue,
  useTagsInput,
} from "./tags-input-root";

interface TagsInputItemContextValue {
  id: string;
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
    const displayValue = context.displayValue(value);
    const id = useId();
    const textId = `${id}text`;

    const itemContext: TagsInputItemContextValue = {
      id,
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
          id={id}
          data-dice-collection-item=""
          data-focused={isFocused ? "" : undefined}
          data-editing={isEditing ? "" : undefined}
          data-editable={context.editable ? "" : undefined}
          data-state={isFocused ? "active" : "inactive"}
          data-disabled={itemDisabled ? "" : undefined}
          onClick={composeEventHandlers(
            tagsInputItemProps.onClick,
            (event) => {
              event.stopPropagation();
              if (!isEditing) {
                context.setFocusedIndex(index);
                requestAnimationFrame(() => context.inputRef.current?.focus());
              }
            },
            { checkForDefaultPrevented: false },
          )}
          onDoubleClick={composeEventHandlers(
            tagsInputItemProps.onDoubleClick,
            () => {
              if (context.editable && !itemDisabled) {
                context.setEditingIndex(index);
              }
            },
          )}
          {...tagsInputItemProps}
        />
      </TagsInputItemContext.Provider>
    );
  },
);

TagsInputItem.displayName = "TagsInputItem";

const Item = TagsInputItem;

export { Item, TagsInputItem, type TagsInputItemProps };
