import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";

const CONTENT_NAME = "TagsInputContent";

interface TagsInputContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "children"
  > {
  children?:
    | ((context: { value: InputValue[] }) => React.ReactNode)
    | React.ReactNode;
}

const TagsInputContent = React.forwardRef<
  HTMLDivElement,
  TagsInputContentProps
>((props, ref) => {
  const { children, ...contentProps } = props;
  const context = useTagsInput(CONTENT_NAME);
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
});

TagsInputContent.displayName = CONTENT_NAME;

const Content = TagsInputContent;

export { Content, TagsInputContent, type TagsInputContentProps };
