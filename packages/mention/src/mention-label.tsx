import { Primitive } from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const LABEL_NAME = "MentionLabel";

interface MentionLabelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.label> {}

const MentionLabel = React.forwardRef<HTMLLabelElement, MentionLabelProps>(
  (props, forwardedRef) => {
    const context = useMentionContext(LABEL_NAME);

    return (
      <Primitive.label
        ref={forwardedRef}
        id={context.labelId}
        htmlFor={context.inputId}
        {...props}
      />
    );
  },
);

MentionLabel.displayName = LABEL_NAME;

const Label = MentionLabel;

export { Label, MentionLabel };

export type { MentionLabelProps };
