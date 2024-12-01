import {
  ITEM_DATA_ATTR,
  composeEventHandlers,
  createContext,
  useId,
} from "@diceui/shared";
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
    const { value, disabled, ...itemProps } = props;
    const context = useTagsInput(ITEM_NAME);
    const id = useId();
    const textId = `${id}text`;
    const isFocused = value === context.focusedValue;
    const isEditing = value === context.editingValue;
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
          {...{ [ITEM_DATA_ATTR]: "" }}
          data-focused={isFocused ? "" : undefined}
          data-editing={isEditing ? "" : undefined}
          data-editable={context.editable ? "" : undefined}
          data-state={isFocused ? "active" : "inactive"}
          data-disabled={itemDisabled ? "" : undefined}
          onClick={composeEventHandlers(itemProps.onClick, (event) => {
            event.stopPropagation();
            if (!isEditing) {
              context.setFocusedValue(value);
              requestAnimationFrame(() => context.inputRef.current?.focus());
            }
          })}
          onDoubleClick={composeEventHandlers(itemProps.onDoubleClick, () => {
            if (context.editable && !itemDisabled) {
              context.setEditingValue(value);
            }
          })}
          {...itemProps}
        />
      </TagsInputItemProvider>
    );
  },
);

TagsInputItem.displayName = ITEM_NAME;

const Item = TagsInputItem;

export { Item, TagsInputItem, useTagsInputItem, type TagsInputItemProps };
