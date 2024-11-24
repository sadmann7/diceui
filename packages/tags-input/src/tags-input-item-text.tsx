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
    <Primitive.span
      ref={ref}
      id={itemContext.textId}
      contentEditable={isEditing && context.editable}
      suppressContentEditableWarning
      onKeyDown={(event) => {
        if (!context.editable) return;

        if (event.key === "Enter") {
          event.preventDefault();
          context.onValueEdit(
            itemContext.value,
            event.currentTarget.textContent || "",
          );
          context.setEditingValue(null);
        } else if (event.key === "Escape") {
          context.setEditingValue(null);
        }
      }}
      onBlur={(event) => {
        if (context.editable) {
          context.onValueEdit(
            itemContext.value,
            event.currentTarget.textContent || "",
          );
        }
      }}
      {...tagsInputTextProps}
    >
      {children ?? itemContext.displayValue}
    </Primitive.span>
  );
});

TagsInputItemText.displayName = "TagsInputItemText";

const Text = TagsInputItemText;

export { TagsInputItemText, Text };

export type { TagsInputItemTextProps };
