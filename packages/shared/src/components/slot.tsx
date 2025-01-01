/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/slot/src/Slot.tsx
 */

import * as React from "react";
import { composeRefs } from "../lib/compose-refs";
import { getElementRef } from "../lib/get-element-ref";

type PrimitiveProps = Record<string, unknown>;

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

interface SlotCloneProps {
  children: React.ReactNode;
}

const isSlottable = function isSlottable(
  child: React.ReactNode,
): child is React.ReactElement<
  { children: React.ReactNode },
  typeof Slottable
> {
  return React.isValidElement(child) && child.type === Slottable;
};

function mergeProps(
  slotProps: PrimitiveProps,
  childProps: PrimitiveProps,
): PrimitiveProps {
  const overrideProps: PrimitiveProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    if (/^on[A-Z]/.test(propName)) {
      if (
        typeof slotPropValue === "function" &&
        typeof childPropValue === "function"
      ) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (typeof slotPropValue === "function") {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style" && slotPropValue && childPropValue) {
      overrideProps[propName] = {
        ...(slotPropValue as React.CSSProperties),
        ...(childPropValue as React.CSSProperties),
      };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(" ");
    }
  }

  return { ...slotProps, ...overrideProps };
}

const SlotClone = React.forwardRef<HTMLElement, SlotCloneProps>(
  (props, forwardedRef) => {
    const { children, ...slotProps } = props;

    if (!React.isValidElement(children)) {
      return React.Children.count(children) > 1
        ? React.Children.only(null)
        : null;
    }

    const childrenRef = getElementRef(children);
    const mergedProps = mergeProps(
      slotProps as PrimitiveProps,
      children.props as PrimitiveProps,
    );

    // Handle intrinsic elements (like 'div', 'span', etc.)
    if (typeof children.type === "string") {
      return React.cloneElement(children, {
        ...mergedProps,
        ref: forwardedRef
          ? composeRefs(forwardedRef, childrenRef)
          : childrenRef,
      } as React.HTMLAttributes<HTMLElement>);
    }

    // Handle custom components
    return React.cloneElement(children, {
      ...mergedProps,
      ref: forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef,
    } as React.ComponentProps<typeof children.type>);
  },
);

SlotClone.displayName = "SlotClone";

const Slot = React.forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = React.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (!slottable) {
    return (
      <SlotClone {...slotProps} ref={forwardedRef}>
        {children}
      </SlotClone>
    );
  }

  if (!React.isValidElement(slottable)) {
    return null;
  }

  const newElement = (
    slottable as React.ReactElement<{ children: React.ReactNode }>
  ).props.children;

  const newChildren = childrenArray.map((child) => {
    if (child === slottable) {
      if (React.Children.count(newElement) > 1) {
        return React.Children.only(null);
      }
      return React.isValidElement(newElement)
        ? (newElement.props as { children: React.ReactNode }).children
        : null;
    }
    return child;
  });

  return (
    <SlotClone {...slotProps} ref={forwardedRef}>
      {React.isValidElement(newElement)
        ? React.cloneElement(newElement, undefined, newChildren)
        : null}
    </SlotClone>
  );
});

Slot.displayName = "Slot";

interface SlottableProps {
  children: React.ReactNode;
}

const Slottable = React.memo(function Slottable({ children }: SlottableProps) {
  return <>{children}</>;
});

Slottable.displayName = "Slottable";

export { Slot, Slottable };

export type { SlotProps };
