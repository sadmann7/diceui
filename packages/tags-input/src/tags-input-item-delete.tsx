import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInputItem } from "./tags-input-item";
import { useTagsInput } from "./tags-input-root";

const ITEM_DELETE_NAME = "TagsInputItemDelete";

interface TagsInputItemDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const TagsInputItemDelete = React.forwardRef<
  HTMLButtonElement,
  TagsInputItemDeleteProps
>((props, ref) => {
  const context = useTagsInput(ITEM_DELETE_NAME);
  const itemContext = useTagsInputItem(ITEM_DELETE_NAME);
  const disabled = itemContext.disabled || context.disabled;

  if (itemContext.isEditing) return null;

  return (
    <Primitive.button
      type="button"
      tabIndex={-1}
      aria-labelledby={itemContext.textId}
      aria-controls={itemContext.id}
      aria-current={itemContext.isHighlighted}
      data-state={itemContext.isHighlighted ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      {...props}
      ref={ref}
      onClick={composeEventHandlers(props.onClick, () => {
        if (disabled) return;
        const index = context.value.findIndex((i) => i === itemContext.value);
        context.onItemRemove(index);
      })}
    />
  );
});

TagsInputItemDelete.displayName = ITEM_DELETE_NAME;

const Delete = TagsInputItemDelete;

export { TagsInputItemDelete, Delete };

export type { TagsInputItemDeleteProps };
