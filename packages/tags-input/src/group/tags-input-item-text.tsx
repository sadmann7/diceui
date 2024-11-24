import { Primitive } from "@radix-ui/react-primitive";
import { useTagsInputItem } from "./tags-input-item";

import * as React from "react";

interface TagsInputTextProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const TagsInputText = React.forwardRef<HTMLSpanElement, TagsInputTextProps>(
  (props, ref) => {
    const { children, ...tagsInputTextProps } = props;
    const itemContext = useTagsInputItem();

    return (
      <Primitive.span ref={ref} id={itemContext.textId} {...tagsInputTextProps}>
        {children ?? itemContext.displayValue}
      </Primitive.span>
    );
  },
);

TagsInputText.displayName = "TagsInputText";

const Text = TagsInputText;

export { TagsInputText, Text };

export type { TagsInputTextProps };
