import * as React from "react";
import { useCallbackRef } from "./use-callback-ref";

interface UseFormResetParams<T> {
  /**
   * The form element to attach reset handler to.
   */
  form?: HTMLFormElement | null;

  /**
   * The default value to reset to.
   */
  defaultValue?: T;

  /**
   * Callback fired when form is reset.
   */
  onReset?: (value: T) => void;
}

/**
 * A hook to handle form reset events.
 * Can be triggered by onReset callback or by form reset event.
 */
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
