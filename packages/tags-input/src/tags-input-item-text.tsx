import { Primitive } from "@diceui/shared";
import * as React from "react";
import { useTagsInputItem } from "./tags-input-item";
import { useTagsInput } from "./tags-input-root";

const ITEM_TEXT_NAME = "TagsInputItemText";

interface TagsInputItemTextProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const TagsInputItemText = React.forwardRef<
  HTMLSpanElement,
  TagsInputItemTextProps
>((props, ref) => {
  const { children, ...itemTextProps } = props;
  const context = useTagsInput(ITEM_TEXT_NAME);
  const itemContext = useTagsInputItem(ITEM_TEXT_NAME);

  if (itemContext.isEditing && context.editable && !itemContext.disabled) {
    return <TagsInputEditableItemText />;
  }

  return (
    <Primitive.span id={itemContext.textId} {...itemTextProps} ref={ref}>
      {children ?? itemContext.displayValue}
    </Primitive.span>
  );
});

const ItemText = TagsInputItemText;

function TagsInputEditableItemText() {
  const context = useTagsInput(ITEM_TEXT_NAME);
  const itemContext = useTagsInputItem(ITEM_TEXT_NAME);
  const [editValue, setEditValue] = React.useState(itemContext.displayValue);

  const onBlur = React.useCallback(() => {
    setEditValue(itemContext.displayValue);
    context.setEditingIndex(null);
  }, [context.setEditingIndex, itemContext.displayValue]);

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const target = event.target;
      target.style.width = "0";
      target.style.width = `${target.scrollWidth + 4}px`;
      setEditValue(event.target.value);
    },
    [],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      event.target.select();
      event.target.style.width = "0";
      event.target.style.width = `${event.target.scrollWidth + 4}px`;
    },
    [],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        const index = context.value.indexOf(itemContext.value);
        context.onItemUpdate(index, editValue);
      } else if (event.key === "Escape") {
        setEditValue(itemContext.displayValue);
        context.setEditingIndex(null);
        context.setHighlightedIndex(itemContext.index);
        context.inputRef.current?.focus();
      }
      event.stopPropagation();
    },
    [
      context.value,
      context.onItemUpdate,
      context.setEditingIndex,
      itemContext.displayValue,
      context.inputRef.current?.focus,
      editValue,
      itemContext.value,
      context.setHighlightedIndex,
      itemContext.index,
    ],
  );

  return (
    <Primitive.input
      type="text"
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      autoFocus
      aria-describedby={itemContext.textId}
      value={editValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
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

export { TagsInputItemText, ItemText };

export type { TagsInputItemTextProps };
