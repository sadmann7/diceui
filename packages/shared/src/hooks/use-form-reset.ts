import * as React from "react";

import { useCallbackRef } from "./use-callback-ref";

interface UseFormResetParams<T> {
  /** The form element to attach the reset handler to. */
  form?: HTMLFormElement | null;

  /** The default value to reset to. */
  defaultValue?: T;

  /** Event handler called when the form is reset. */
  onReset?: (value: T) => void;
}

/** Calls `onReset` with `defaultValue` when the form resets. */
function useFormReset<T>({
  form,
  defaultValue,
  onReset,
}: UseFormResetParams<T>) {
  const onResetCallback = useCallbackRef(onReset);

  React.useEffect(() => {
    if (!form) return;

    function onFormReset() {
      if (defaultValue !== undefined) {
        onResetCallback?.(defaultValue);
      }
    }

    form.addEventListener("reset", onFormReset);
    return () => form.removeEventListener("reset", onFormReset);
  }, [form, defaultValue, onResetCallback]);
}

export { useFormReset };
