import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { createContext, useContext } from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";
import { VisuallyHidden } from "./visually-hidden";

interface TagsInputItemContextValue {
  value: InputValue;
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
  value: InputValue;
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

    function onDoubleClick(event: React.MouseEvent) {
      if (event.target === event.currentTarget || itemDisabled) {
        return;
      }

      context.setEditingValue(value);
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
      isEditing,
      disabled: itemDisabled,
      textId,
      displayValue,
    };

    const Comp = context.editable && isEditing ? VisuallyHidden : Primitive.div;

    return (
      <TagsInputItemContext.Provider value={itemContext}>
        <Comp
          ref={ref}
          data-tag-item={itemContext.value}
          aria-current={isFocused}
          data-state={isFocused ? "active" : "inactive"}
          data-focused={isFocused ? "" : undefined}
          data-disabled={itemDisabled ? "" : undefined}
          data-editing={isEditing ? "" : undefined}
          onClick={() => {
            context.inputRef.current?.focus();
            context.setFocusedValue(value);
          }}
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyDown}
          {...tagsInputItemProps}
        />
        {context.editable && isEditing && (
          <Primitive.input
            defaultValue={itemContext.displayValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const newValue = event.currentTarget.value.trim();
                event.preventDefault();
                context.onItemUpdate(itemContext.value, newValue);
                context.setEditingValue(null);
                context.inputRef.current?.focus();
                // if (itemContext.isEditing) {
                //   context.setFocusedValue(newValue);
                // }
              } else if (event.key === "Escape") {
                context.setEditingValue(null);
                event.currentTarget.focus();
              }
            }}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={(event) => {
              context.onItemUpdate(
                itemContext.value,
                event.currentTarget.value,
              );
              context.setEditingValue(null);
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            autoFocus
            style={{
              outline: "none",
              background: "inherit",
              width: document.getElementById(textId)?.clientWidth,
            }}
          />
        )}
      </TagsInputItemContext.Provider>
    );
  },
);

TagsInputItem.displayName = "TagsInputItem";

const Item = TagsInputItem;

export { Item, TagsInputItem };

export type { TagsInputItemProps };
