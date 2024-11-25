import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInputItem } from "./tags-input-item";
import { useTagsInput } from "./tags-input-root";

interface TagsInputItemDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const TagsInputItemDelete = React.forwardRef<
  HTMLButtonElement,
  TagsInputItemDeleteProps
>((props, ref) => {
  const context = useTagsInput();
  const itemContext = useTagsInputItem();
  const disabled = itemContext.disabled || context.disabled;

  function onItemDelete() {
    if (disabled) return;
    const index = context.value.findIndex((i) => i === itemContext.value);
    context.onValueRemove(index);
    requestAnimationFrame(() => {
      context.inputRef.current?.focus();
    });
  }

  return (
    <Primitive.button
      ref={ref}
      type="button"
      tabIndex={-1}
      aria-labelledby={itemContext.textId}
      aria-current={itemContext.isFocused}
      data-state={itemContext.isFocused ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      onClick={onItemDelete}
      {...props}
    />
  );
});

TagsInputItemDelete.displayName = "TagsInputItemDelete";

const Delete = TagsInputItemDelete;

export { TagsInputItemDelete, Delete };

export type { TagsInputItemDeleteProps };
