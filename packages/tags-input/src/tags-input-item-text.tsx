import { Primitive } from "@radix-ui/react-primitive";
import { useTagsInputItem } from "./tags-input-item";

import * as React from "react";

interface TagsInputItemTextProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const TagsInputItemText = React.forwardRef<
  HTMLSpanElement,
  TagsInputItemTextProps
>((props, ref) => {
  const { children, ...tagsInputTextProps } = props;
  const itemContext = useTagsInputItem();

  return (
    <Primitive.span ref={ref} id={itemContext.textId} {...tagsInputTextProps}>
      {children ?? itemContext.displayValue}
    </Primitive.span>
  );
});

TagsInputItemText.displayName = "TagsInputItemText";

const Text = TagsInputItemText;

export { TagsInputItemText, Text };

export type { TagsInputItemTextProps };
