import * as React from "react";

/**
 * A hook to determine if element is inside a form element.
 * @param form - The form element to check against.
 */
export function useFormControl<TElement extends HTMLElement>(form?: string) {
  const [trigger, setTrigger] = React.useState<TElement | null>(null);

  const isFormControl = trigger ? form || !!trigger.closest("form") : true;

  return { isFormControl, trigger, onTriggerChange: setTrigger };
}
