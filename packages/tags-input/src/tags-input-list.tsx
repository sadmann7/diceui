import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";

const LIST_NAME = "TagsInputList";

interface TagsInputListProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "children"
  > {
  children?:
    | ((context: { value: InputValue[] }) => React.ReactNode)
    | React.ReactNode;
}

const TagsInputList = React.forwardRef<HTMLDivElement, TagsInputListProps>(
  (props, ref) => {
    const { children, ...contentProps } = props;
    const context = useTagsInput(LIST_NAME);
    const id = `${context.id}content`;

    return (
      <Primitive.div
        data-disabled={context.disabled ? "" : undefined}
        id={id}
        {...contentProps}
        ref={ref}
      >
        {typeof children === "function" ? (
          <>{children({ value: context.value })}</>
        ) : (
          children
        )}
      </Primitive.div>
    );
  },
);

TagsInputList.displayName = LIST_NAME;

const List = TagsInputList;

export { List, TagsInputList };

export type { TagsInputListProps };
