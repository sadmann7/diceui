import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

const CLEAR_NAME = "TagsInputClear";

interface TagsInputClearProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {
  dynamic?: boolean;
}

const TagsInputClear = React.forwardRef<HTMLButtonElement, TagsInputClearProps>(
  (props, ref) => {
    const { dynamic, ...clearProps } = props;
    const context = useTagsInput(CLEAR_NAME);

    if (dynamic && context.values.length === 0) return null;

    return (
      <Primitive.button
        ref={ref}
        type="button"
        aria-disabled={context.disabled}
        data-state={context.values.length > 0 ? "visible" : "hidden"}
        data-disabled={context.disabled ? "" : undefined}
        onClick={composeEventHandlers(props.onClick, () => {
          if (context.disabled) return;
          context.onValuesChange([]);
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
