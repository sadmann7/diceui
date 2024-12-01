import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInputItem } from "./tags-input-item";
import { useTagsInput } from "./tags-input-root";

const ITEM_TEXT_NAME = "TagsInputItemText";

interface TagsInputItemTextProps
  extends React.ComponentPropsWithoutRef<"span"> {}

const TagsInputItemText = React.forwardRef<
  HTMLSpanElement,
  TagsInputItemTextProps
>((props, ref) => {
  const { children, ...itemTextProps } = props;
  const context = useTagsInput(ITEM_TEXT_NAME);
  const itemContext = useTagsInputItem(ITEM_TEXT_NAME);
  const [editValue, setEditValue] = React.useState(itemContext.displayValue);

  if (itemContext.isEditing && context.editable && !itemContext.disabled) {
    return (
      <Primitive.input
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-describedby={itemContext.textId}
        type="text"
        value={editValue}
        onInput={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLInputElement)) return;
          target.style.width = "0";
          target.style.width = `${target.scrollWidth + 4}px`;
        }}
        onChange={(event) => setEditValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const index = context.values.findIndex(
              (v) => v === itemContext.value,
            );
            context.onItemUpdate(index, editValue);
          } else if (event.key === "Escape") {
            setEditValue(itemContext.displayValue);
            context.setEditingValue(null);
            context.inputRef.current?.focus();
          }
          event.stopPropagation();
        }}
        onFocus={(event) => {
          event.target.select();
          event.target.style.width = "0";
          event.target.style.width = `${event.target.scrollWidth + 4}px`;
        }}
        onBlur={() => {
          setEditValue(itemContext.displayValue);
          context.setEditingValue(null);
        }}
        style={{
          outline: "none",
          background: "inherit",
          border: "none",
          font: "inherit",
          color: "inherit",
          padding: 0,
          minWidth: "1ch",
        }}
      />
    );
  }

  return (
    <Primitive.span ref={ref} id={itemContext.textId} {...itemTextProps}>
      {children ?? itemContext.displayValue}
    </Primitive.span>
  );
});

const Text = TagsInputItemText;

export { TagsInputItemText, Text, type TagsInputItemTextProps };
