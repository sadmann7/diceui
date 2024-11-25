import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

interface TagsInputContentProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const TagsInputContent = React.forwardRef<
  HTMLDivElement,
  TagsInputContentProps
>((props, ref) => {
  const context = useTagsInput();

  return (
    <Primitive.div
      ref={ref}
      data-disabled={context.disabled ? "" : undefined}
      {...props}
    />
  );
});

TagsInputContent.displayName = "TagsInputContent";

const Content = TagsInputContent;

export { Content, TagsInputContent };

export type { TagsInputContentProps };
