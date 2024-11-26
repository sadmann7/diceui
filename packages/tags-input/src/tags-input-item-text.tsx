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

  return (
    <Primitive.span ref={ref} id={itemContext.textId} {...tagsInputTextProps}>
      {context.editable && itemContext.isEditing ? (
        <Primitive.input
          defaultValue={itemContext.displayValue}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const newValue = event.currentTarget.value.trim();
              event.preventDefault();
              context.onItemUpdate(itemContext.value, newValue);
              context.setEditingValue(null);
              context.inputRef.current?.focus();
              if (itemContext.isEditing) {
                context.setFocusedValue(newValue);
              }
            } else if (event.key === "Escape") {
              context.setEditingValue(null);
              event.currentTarget.focus();
            }
          }}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={(event) => {
            context.onItemUpdate(itemContext.value, event.currentTarget.value);
            context.setEditingValue(null);
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          autoFocus
          style={{
            outline: "none",
            background: "inherit",
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
