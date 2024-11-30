import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

const LABEL_NAME = "TagsInputLabel";

interface TagsInputLabelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.label> {}

const TagsInputLabel = React.forwardRef<HTMLLabelElement, TagsInputLabelProps>(
  (props, ref) => {
    const context = useTagsInput(LABEL_NAME);

    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
      <Primitive.label
        ref={ref}
        id={context.labelId}
        htmlFor={context.inputId}
        {...props}
      />
    );
  },
);

TagsInputLabel.displayName = LABEL_NAME;

const Label = TagsInputLabel;

export { Label, TagsInputLabel, type TagsInputLabelProps };
