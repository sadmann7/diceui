import {
  DATA_ITEM_ATTR,
  Primitive,
  composeEventHandlers,
  createContext,
  useId,
} from "@diceui/shared";
import * as React from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";

const ITEM_NAME = "TagsInputItem";

interface TagsInputItemContextValue {
  id: string;
  value: InputValue;
  index: number;
  isHighlighted: boolean;
  isEditing: boolean;
  disabled?: boolean;
  textId: string;
  displayValue: string;
}

const [TagsInputItemProvider, useTagsInputItem] =
  createContext<TagsInputItemContextValue>(ITEM_NAME);

interface TagsInputItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** The value of the item. */
  value: InputValue;

  /** Whether the item is disabled. */
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
    const index = context.value.indexOf(value);
    const isHighlighted = index === context.highlightedIndex;
    const isEditing = index === context.editingIndex;
    const itemDisabled = disabled || context.disabled;
    const displayValue = context.displayValue(value);

    const onItemSelect = React.useCallback(() => {
      context.setHighlightedIndex(index);
      context.inputRef.current?.focus();
    }, [context.setHighlightedIndex, context.inputRef, index]);

    return (
      <TagsInputItemProvider
        id={id}
        value={value}
        index={index}
        isHighlighted={isHighlighted}
        isEditing={isEditing}
        disabled={itemDisabled}
        textId={textId}
        displayValue={displayValue}
      >
        <Primitive.div
          id={id}
          aria-labelledby={textId}
          aria-current={isHighlighted}
          aria-disabled={itemDisabled}
          {...{ [DATA_ITEM_ATTR]: "" }}
          data-state={isHighlighted ? "active" : "inactive"}
          data-highlighted={isHighlighted ? "" : undefined}
          data-editing={isEditing ? "" : undefined}
          data-editable={context.editable ? "" : undefined}
          data-disabled={itemDisabled ? "" : undefined}
          {...itemProps}
          ref={ref}
          onClick={composeEventHandlers(itemProps.onClick, (event) => {
            event.stopPropagation();
            if (!isEditing && pointerTypeRef.current !== "mouse") {
              onItemSelect();
            }
          })}
          onDoubleClick={composeEventHandlers(itemProps.onDoubleClick, () => {
            if (context.editable && !itemDisabled) {
              requestAnimationFrame(() => context.setEditingIndex(index));
            }
          })}
          onPointerUp={composeEventHandlers(itemProps.onPointerUp, () => {
            // Using a mouse you should be able to do pointer down, move through
            // the list, and release the pointer over the item to select it.
            if (pointerTypeRef.current === "mouse") onItemSelect();
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
                context.onItemLeave();
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
                context.onItemLeave();
              }
            },
          )}
        />
      </TagsInputItemProvider>
    );
  },
);

TagsInputItem.displayName = ITEM_NAME;

const Item = TagsInputItem;

export { Item, TagsInputItem, useTagsInputItem };

export type { TagsInputItemProps };
