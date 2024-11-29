import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

interface TagsInputClearProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const TagsInputClear = React.forwardRef<HTMLButtonElement, TagsInputClearProps>(
  (props, ref) => {
    const context = useTagsInput();

    return (
      <Primitive.button
        ref={ref}
        type="button"
        data-state={context.values.length > 0 ? "visible" : "hidden"}
        data-disabled={context.disabled ? "" : undefined}
        onClick={composeEventHandlers(props.onClick, () => {
          if (context.disabled) return;
          context.onValuesChange([]);
          context.inputRef.current?.focus();
        })}
        {...props}
      />
    );
  },
);

TagsInputClear.displayName = "TagsInputClear";

const Clear = TagsInputClear;

export { Clear, TagsInputClear, type TagsInputClearProps };
