import { composeEventHandlers, createContext, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";

const ITEM_NAME = "TagsInputItem";

interface TagsInputItemContextValue {
  id: string;
  value: InputValue;
  isFocused: boolean;
  isEditing: boolean;
  disabled?: boolean;
  textId: string;
  displayValue: string;
}

const [TagsInputItemProvider, useTagsInputItem] =
  createContext<TagsInputItemContextValue>(ITEM_NAME);

interface TagsInputItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: InputValue;
  disabled?: boolean;
}

const TagsInputItem = React.forwardRef<HTMLDivElement, TagsInputItemProps>(
  (props, ref) => {
    const { value, disabled, ...tagsInputItemProps } = props;
    const context = useTagsInput(ITEM_NAME);
    const id = useId();
    const textId = `${id}text`;
    const index = context.values.indexOf(value);
    const isFocused = index === context.focusedIndex;
    const isEditing = index === context.editingIndex;
    const itemDisabled = disabled || context.disabled;
    const displayValue = context.displayValue(value);

    return (
      <TagsInputItemProvider
        id={id}
        value={value}
        isFocused={isFocused}
        isEditing={isEditing}
        disabled={itemDisabled}
        textId={textId}
        displayValue={displayValue}
      >
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
      </TagsInputItemProvider>
    );
  },
);

TagsInputItem.displayName = ITEM_NAME;

const Item = TagsInputItem;

export { Item, TagsInputItem, useTagsInputItem, type TagsInputItemProps };
