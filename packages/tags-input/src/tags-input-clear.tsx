import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

const CLEAR_NAME = "TagsInputClear";

interface TagsInputClearProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {
  /**
   * If `true`, the clear button will only be shown when there are values in the input.
   * @default false
   */
  forceVisible?: boolean;
}

const TagsInputClear = React.forwardRef<HTMLButtonElement, TagsInputClearProps>(
  (props, ref) => {
    const { forceVisible, ...clearProps } = props;
    const context = useTagsInput(CLEAR_NAME);

    if (!forceVisible && context.value.length === 0) return null;

    return (
      <Primitive.button
        ref={ref}
        type="button"
        aria-disabled={context.disabled}
        data-state={context.value.length > 0 ? "visible" : "hidden"}
        data-disabled={context.disabled ? "" : undefined}
        onClick={composeEventHandlers(props.onClick, () => {
          if (context.disabled) return;
          context.onValueChange([]);
          context.inputRef.current?.focus();
        })}
        {...clearProps}
      />
    );
  },
);

TagsInputClear.displayName = CLEAR_NAME;

const Clear = TagsInputClear;

export { Clear, TagsInputClear, type TagsInputClearProps };
