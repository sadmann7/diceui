import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

interface TagsInputLabelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.label> {}

const TagsInputLabel = React.forwardRef<HTMLLabelElement, TagsInputLabelProps>(
  (props, ref) => {
    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
    return <Primitive.label ref={ref} {...props} />;
  },
);

TagsInputLabel.displayName = "TagsInputLabel";

const Label = TagsInputLabel;

export { Label, TagsInputLabel, type TagsInputLabelProps };
