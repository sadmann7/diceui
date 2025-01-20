/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/primitive/src/Primitive.tsx
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Slot } from "./slot";

type IntrinsicElementsKeys = keyof React.JSX.IntrinsicElements;

type PrimitivePropsWithRef<E extends IntrinsicElementsKeys> = Omit<
  React.JSX.IntrinsicElements[E],
  "ref"
> & {
  /** Whether to render the wrapped component and merge their props. */
  asChild?: boolean;
  ref?: React.Ref<React.ElementRef<E>>;
};

type PrimitiveForwardRefComponent<E extends IntrinsicElementsKeys> =
  React.ForwardRefExoticComponent<PrimitivePropsWithRef<E>>;

function createPrimitive<E extends IntrinsicElementsKeys>(
  element: E,
): PrimitiveForwardRefComponent<E> {
  const Primitive = React.forwardRef<
    React.ElementRef<E>,
    PrimitivePropsWithRef<E>
  >((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;

    if (asChild) {
      return React.createElement(Slot, {
        ...primitiveProps,
        ref: forwardedRef as React.Ref<HTMLElement>,
      });
    }

    return React.createElement(element, {
      ...primitiveProps,
      ref: forwardedRef,
    });
  });

  Primitive.displayName = `Primitive.${String(element)}`;
  return Primitive as PrimitiveForwardRefComponent<E>;
}

type Primitives = {
  [E in IntrinsicElementsKeys]: PrimitiveForwardRefComponent<E>;
};

const cache = new Map<
  IntrinsicElementsKeys,
  PrimitiveForwardRefComponent<IntrinsicElementsKeys>
>();

const Primitive = new Proxy(
  {},
  {
    get: (_, element: PropertyKey) => {
      const key = element as IntrinsicElementsKeys;
      if (!cache.has(key)) {
        cache.set(key, createPrimitive(key));
      }
      return cache.get(key);
    },
  },
) as Primitives;

/**
 * Flush custom event dispatch for React 18 batching
 * @see https://github.com/facebook/react/blob/a8a4742f1c54493df00da648a3f9d26e3db9c8b5/packages/react-dom/src/events/ReactDOMEventListener.js#L294-L350
 */
function dispatchDiscreteCustomEvent<E extends CustomEvent>(
  target: E["target"],
  event: E,
) {
  if (!target) return;

  ReactDOM.flushSync(() => target.dispatchEvent(event));
}

export { dispatchDiscreteCustomEvent, Primitive };

export type { PrimitivePropsWithRef };
