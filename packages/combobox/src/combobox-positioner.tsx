import { useComposedRefs, useScrollLock } from "@diceui/shared";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const POSITIONER_NAME = "ComboboxPositioner";

interface ComboboxPositionerProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  forceMount?: boolean;
  sideOffset?: number;
}

const ComboboxPositioner = React.forwardRef<
  HTMLDivElement,
  ComboboxPositionerProps
>((props, forwardedRef) => {
  const {
    forceMount = false,
    sideOffset = 4,
    style,
    ...positionerProps
  } = props;
  const context = useComboboxContext(POSITIONER_NAME);

  const {
    refs: { setFloating, setReference },
    floatingStyles,
  } = useFloating({
    open: context.open,
    onOpenChange: context.onOpenChange,
    placement: "bottom-start",
    middleware: [offset(sideOffset), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const composedRef = useComposedRefs(
    forwardedRef,
    context.contentRef,
    (node) => setFloating(node),
  );

  const composedStyles = React.useMemo(
    () => ({
      ...floatingStyles,
      ...style,
    }),
    [floatingStyles, style],
  );

  useScrollLock({
    enabled: context.modal,
    referenceElement: context.contentRef.current,
  });

  React.useEffect(() => {
    if (context.inputRef.current) {
      setReference(context.inputRef.current);
    }
  }, [context.inputRef, setReference]);

  return (
    <Primitive.div
      {...positionerProps}
      ref={composedRef}
      style={composedStyles}
      data-state={context.open ? "open" : "closed"}
    />
  );
});

ComboboxPositioner.displayName = POSITIONER_NAME;

const Positioner = ComboboxPositioner;

export { ComboboxPositioner, Positioner };
export type { ComboboxPositionerProps };
