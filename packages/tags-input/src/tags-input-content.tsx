import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";

const CONTENT_NAME = "TagsInputContent";

interface TagsInputContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "children"
  > {
  children?: ((value: InputValue[]) => React.ReactNode) | React.ReactNode;
}

const TagsInputContent = React.forwardRef<
  HTMLDivElement,
  TagsInputContentProps
>((props, ref) => {
  const { children, ...tagsInputItemListProps } = props;
  const context = useTagsInput(CONTENT_NAME);
  const id = `${context.id}content`;

  return (
    <Primitive.div
      ref={ref}
      id={id}
      data-disabled={context.disabled ? "" : undefined}
      {...tagsInputItemListProps}
    >
      {typeof children === "function" ? (
        <>{children(context.values)}</>
      ) : (
        children
      )}
    </Primitive.div>
  );
});

TagsInputContent.displayName = CONTENT_NAME;

const Content = TagsInputContent;

export { Content, TagsInputContent, type TagsInputContentProps };
