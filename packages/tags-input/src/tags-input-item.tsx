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
    const pointerTypeRef =
      React.useRef<React.PointerEvent["pointerType"]>("touch");
    const context = useTagsInput(ITEM_NAME);
    const id = useId();
    const textId = `${id}text`;
    const isFocused = value === context.focusedValue;
    const isEditing = value === context.editingValue;
    const itemDisabled = disabled || context.disabled;
    const displayValue = context.displayValue(value);

    function onSelect() {
      context.setFocusedValue(value);
      context.inputRef.current?.focus();
    }

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
          aria-labelledby={textId}
          aria-current={isFocused}
          aria-disabled={itemDisabled}
          data-focused={isFocused ? "" : undefined}
          data-editing={isEditing ? "" : undefined}
          data-editable={context.editable ? "" : undefined}
          data-state={isFocused ? "active" : "inactive"}
          data-disabled={itemDisabled ? "" : undefined}
          onClick={composeEventHandlers(itemProps.onClick, (event) => {
            event.stopPropagation();
            if (!isEditing && pointerTypeRef.current !== "mouse") {
              onSelect();
            }
          })}
          onDoubleClick={composeEventHandlers(itemProps.onDoubleClick, () => {
            if (context.editable && !itemDisabled) {
              requestAnimationFrame(() => context.setEditingValue(value));
            }
          })}
          onPointerUp={composeEventHandlers(itemProps.onPointerUp, () => {
            // Using a mouse you should be able to do pointer down, move through
            // the list, and release the pointer over the item to select it.
            if (pointerTypeRef.current === "mouse") onSelect();
          })}
          onPointerDown={composeEventHandlers(
            itemProps.onPointerDown,
            (event) => (pointerTypeRef.current = event.pointerType),
          )}
          onPointerMove={composeEventHandlers(
            itemProps.onPointerMove,
            (event) => {
              // Remember pointer type when sliding over to this item from another one
              pointerTypeRef.current = event.pointerType;
              if (disabled) {
                context.onItemLeave?.();
              } else if (pointerTypeRef.current === "mouse") {
                // even though safari doesn't support this option, it's acceptable
                // as it only means it might scroll a few pixels when using the pointer.
                event.currentTarget.focus({ preventScroll: true });
              }
            },
          )}
          onPointerLeave={composeEventHandlers(
            itemProps.onPointerLeave,
            (event) => {
              if (event.currentTarget === document.activeElement) {
                context.onItemLeave?.();
              }
            },
          )}
          {...itemProps}
        />
      </TagsInputItemProvider>
    );
  },
);

TagsInputItem.displayName = ITEM_NAME;

const Item = TagsInputItem;

export { Item, TagsInputItem, useTagsInputItem, type TagsInputItemProps };
