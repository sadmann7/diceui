import { Presence, Primitive, composeEventHandlers } from "@diceui/shared";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

const CLEAR_NAME = "TagsInputClear";

interface TagsInputClearProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {
  /**
   * Whether the clear button should always be rendered.
   *
   * Can be used to animate the enter and exit of the clear button.
   * @default false
   */
  forceMount?: boolean;
}

const TagsInputClear = React.forwardRef<HTMLButtonElement, TagsInputClearProps>(
  (props, ref) => {
    const { forceMount, ...clearProps } = props;
    const context = useTagsInput(CLEAR_NAME);

    return (
      <Presence present={forceMount || context.value.length > 0}>
        <Primitive.button
          type="button"
          aria-disabled={context.disabled}
          data-state={context.value.length > 0 ? "visible" : "invisible"}
          data-disabled={context.disabled ? "" : undefined}
          {...clearProps}
          ref={ref}
          onClick={composeEventHandlers(props.onClick, () => {
            if (context.disabled) return;
            context.onValueChange([]);
            context.inputRef.current?.focus();
          })}
        />
      </Presence>
    );
  },
);

TagsInputClear.displayName = CLEAR_NAME;

const Clear = TagsInputClear;

export { Clear, TagsInputClear };

export type { TagsInputClearProps };
