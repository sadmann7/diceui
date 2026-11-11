import {
  composeEventHandlers,
  createContext,
  DATA_ITEM_ATTR,
  Primitive,
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

interface TagsInputItemProps extends React.ComponentPropsWithoutRef<
  typeof Primitive.div
> {
  /** The value of the item. */
  value: InputValue;

  /** Whether the item is disabled. */
  disabled?: boolean;
}

const TagsInputItem = React.forwardRef<HTMLDivElement, TagsInputItemProps>(
  (props, ref) => {
    const {
      value,
      disabled,
      onClick: onClickProp,
      onPointerUp: onPointerUpProp,
      onPointerDown: onPointerDownProp,
      onPointerMove: onPointerMoveProp,
      ...itemProps
    } = props;
    const pointerTypeRef =
      React.useRef<React.PointerEvent["pointerType"]>("touch");
    const context = useTagsInput(ITEM_NAME);
    const { inputRef, setHighlightedIndex } = context;
    const id = useId();
    const textId = `${id}text`;
    const index = context.value.indexOf(value);
    const isHighlighted = index === context.highlightedIndex;
    const isEditing = index === context.editingIndex;
    const itemDisabled = disabled || context.disabled;
    const displayValue = context.displayValue(value);

    const onItemSelect = React.useCallback(() => {
      setHighlightedIndex(index);
      inputRef.current?.focus();
    }, [setHighlightedIndex, inputRef, index]);

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        onClickProp?.(event);
        if (event.defaultPrevented) return;

        event.stopPropagation();
        if (!isEditing && pointerTypeRef.current !== "mouse") {
          onItemSelect();
        }
      },
      [onClickProp, isEditing, onItemSelect],
    );

    const onPointerUp = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerUpProp?.(event);
        if (event.defaultPrevented) return;

        // Using a mouse you should be able to do pointer down, move through
        // the list, and release the pointer over the item to select it.
        if (pointerTypeRef.current === "mouse") onItemSelect();
      },
      [onPointerUpProp, onItemSelect],
    );

    const onPointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDownProp?.(event);
        if (event.defaultPrevented) return;

        pointerTypeRef.current = event.pointerType;
      },
      [onPointerDownProp],
    );

    const onPointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerMoveProp?.(event);
        if (event.defaultPrevented) return;

        // Remember pointer type when sliding over to this item from another one.
        pointerTypeRef.current = event.pointerType;
        if (disabled) {
          context.onItemLeave();
        } else if (pointerTypeRef.current === "mouse") {
          // even though safari doesn't support this option, it's acceptable
          // as it only means it might scroll a few pixels when using the pointer.
          event.currentTarget.focus({ preventScroll: true });
        }
      },
      [onPointerMoveProp, disabled, context],
    );

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
          onClick={onClick}
          onDoubleClick={composeEventHandlers(itemProps.onDoubleClick, () => {
            if (context.editable && !itemDisabled) {
              requestAnimationFrame(() => context.setEditingIndex(index));
            }
          })}
          onPointerUp={onPointerUp}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
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

export type { TagsInputItemProps };
export { Item, TagsInputItem, useTagsInputItem };
