import { Primitive } from "@diceui/shared";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

const MESSAGE_NAME = "CheckboxGroupMessage";

interface CheckboxGroupMessageProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the description should be announced by screen readers immediately upon rendering.
   * @default false
   */
  announce?: boolean;
}

const CheckboxGroupMessage = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupMessageProps
>((props, ref) => {
  const { announce = false, children, ...messageProps } = props;
  const context = useCheckboxGroup(MESSAGE_NAME);

  if (!context.isInvalid) return null;

  const message = context.validationMessage || children;
  const messageContent = Array.isArray(message) ? message.join(" ") : message;

  return (
    <Primitive.div
      id={context.messageId}
      aria-live={announce ? "polite" : "off"}
      data-disabled={context.disabled ? "" : undefined}
      data-invalid={context.isInvalid ? "" : undefined}
      {...messageProps}
      ref={ref}
    >
      {messageContent}
    </Primitive.div>
  );
});

CheckboxGroupMessage.displayName = MESSAGE_NAME;

const Message = CheckboxGroupMessage;

export { CheckboxGroupMessage, Message };

export type { CheckboxGroupMessageProps };
