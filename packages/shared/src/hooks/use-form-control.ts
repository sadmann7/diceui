import * as React from "react";

/** Tracks whether the trigger element is inside a form, or tied to one by `form`. */
function useFormControl<TElement extends HTMLElement>(form?: string) {
  const [trigger, setTrigger] = React.useState<TElement | null>(null);

  const isFormControl = trigger ? form || !!trigger.closest("form") : true;

  return { isFormControl, trigger, onTriggerChange: setTrigger };
}

export { useFormControl };
