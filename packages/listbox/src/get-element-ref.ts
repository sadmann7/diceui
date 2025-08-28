/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/slot/src/Slot.tsx
 */

import * as React from "react";

/**
 * Get the ref from a React element without throwing warnings.
 */
function getElementRef(element: React.ReactElement) {
  if (!React.isValidElement(element)) return undefined;

  // React <=18 in DEV
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    // biome-ignore lint/suspicious/noExplicitAny: accessing internal React ref property
    return (element as any).ref;
  }

  // React 19 in DEV
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element.props as { ref?: React.Ref<unknown> }).ref;
  }

  // Not DEV
  return (
    // biome-ignore lint/suspicious/noExplicitAny: accessing internal React ref property
    (element.props as { ref?: React.Ref<unknown> }).ref || (element as any).ref
  );
}

export { getElementRef };
