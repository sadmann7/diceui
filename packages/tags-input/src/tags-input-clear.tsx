import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

interface TagsInputClearProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const TagsInputClear = React.forwardRef<HTMLButtonElement, TagsInputClearProps>(
  (props, ref) => {
    const context = useTagsInput();

    function onClear() {
      if (context.disabled) return;
      context.onValueChange([]);
      requestAnimationFrame(() => {
        context.inputRef.current?.focus();
      });
    }

    return (
      <Primitive.button
        ref={ref}
        type="button"
        data-disabled={context.disabled ? "" : undefined}
        onClick={onClear}
        {...props}
      />
    );
  },
);

TagsInputClear.displayName = "TagsInputClear";

const Clear = TagsInputClear;

export { TagsInputClear, Clear };

export type { TagsInputClearProps };
