import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";

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
  const context = useTagsInput();

  return (
    <Primitive.div
      ref={ref}
      data-disabled={context.disabled ? "" : undefined}
      {...tagsInputItemListProps}
    >
      {typeof children === "function" ? (
        <>{children(context.value)}</>
      ) : (
        children
      )}
    </Primitive.div>
  );
});

TagsInputContent.displayName = "TagsInputContent";

const Content = TagsInputContent;

export { Content, TagsInputContent };

export type { TagsInputContentProps };