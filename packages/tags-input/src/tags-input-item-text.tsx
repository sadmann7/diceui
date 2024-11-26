import { Primitive } from "@radix-ui/react-primitive";
import { useTagsInputItem } from "./tags-input-item";

import * as React from "react";
import { useTagsInput } from "./tags-input-root";

interface TagsInputItemTextProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const TagsInputItemText = React.forwardRef<
  HTMLSpanElement,
  TagsInputItemTextProps
>((props, ref) => {
  const { children, ...tagsInputTextProps } = props;
  const context = useTagsInput();
  const itemContext = useTagsInputItem();
  const isEditing = itemContext.value === context.editingValue;

  return (
    <Primitive.span ref={ref} id={itemContext.textId} {...tagsInputTextProps}>
      {isEditing && context.editable ? (
        <Primitive.input
          defaultValue={itemContext.displayValue}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const newValue = event.currentTarget.value.trim();
              event.preventDefault();
              context.onItemUpdate(itemContext.value, newValue);
              context.setEditingValue(null);
              context.inputRef.current?.focus();
              // if (isEditing) {
              //   context.setFocusedValue(newValue);
              // }
            } else if (event.key === "Escape") {
              context.setEditingValue(null);
            }
          }}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={(event) => {
            context.onItemUpdate(itemContext.value, event.currentTarget.value);
            context.setEditingValue(null);
          }}
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          style={{
            outline: "none",
            background: "inherit",
            border: "none",
            padding: 0,
            margin: 0,
          }}
        />
      ) : (
        (children ?? itemContext.displayValue)
      )}
    </Primitive.span>
  );
});

TagsInputItemText.displayName = "TagsInputItemText";

const Text = TagsInputItemText;

export { TagsInputItemText, Text };

export type { TagsInputItemTextProps };
