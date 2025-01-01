import * as React from "react";

/**
 * Get the ref from a React element without throwing warnings.
 * @param element - The React element to get the ref from.
 * @returns The ref from the element, or undefined if the element is not valid.
 */
function getElementRef(
  element: React.ReactElement
): React.Ref<unknown> | undefined {
  if (!React.isValidElement(element)) return undefined;

  const propDescriptor = Object.getOwnPropertyDescriptor(element.props, "ref");
  const elementDescriptor = Object.getOwnPropertyDescriptor(element, "ref");

  // Handle React <=18 warnings
  if (propDescriptor?.get && "isReactWarning" in propDescriptor.get) {
    return (element as { ref?: React.Ref<unknown> }).ref;
  }

  // Handle React 19 warnings
  if (elementDescriptor?.get && "isReactWarning" in elementDescriptor.get) {
    return (element.props as { ref?: React.Ref<unknown> }).ref;
  }

  return (
    (element.props as { ref?: React.Ref<unknown> }).ref ??
    (element as { ref?: React.Ref<unknown> }).ref
  );
}

export { getElementRef };
