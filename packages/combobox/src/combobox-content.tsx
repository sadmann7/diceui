import {
  type Align,
  type AnchorPositionerProps,
  type PointerDownOutsideEvent,
  Primitive,
  type Side,
  createContext,
  useAnchorPositioner,
  useComposedRefs,
  useDismiss,
  useScrollLock,
} from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import * as React from "react";
import { getDataState, useComboboxContext } from "./combobox-root";

const CONTENT_NAME = "ComboboxContent";

type ContentElement = React.ElementRef<typeof Primitive.div>;

interface ComboboxContentContextValue {
  side: Side;
  align: Align;
  onArrowChange: (arrow: HTMLElement | null) => void;
  arrowStyles: React.CSSProperties;
  arrowDisplaced: boolean;
  forceMount: boolean;
}

const [ComboboxContentProvider, useComboboxContentContext] =
  createContext<ComboboxContentContextValue>(CONTENT_NAME);

interface ComboboxContentProps
  extends AnchorPositionerProps,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Event handler called when the `Escape` key is pressed.
   *
   * Can be used to prevent input value from being reset on `Escape` key press.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Event handler called when a `pointerdown` event happens outside of the content.
   *
   * Can be used to prevent the content from closing when the pointer is outside of the content.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
}

const ComboboxContent = React.forwardRef<ContentElement, ComboboxContentProps>(
  (props, forwardedRef) => {
    const {
      forceMount = false,
      side = "bottom",
      sideOffset = 4,
      align = "start",
      alignOffset = 0,
      arrowPadding = 0,
      collisionBoundary,
      collisionPadding,
      sticky = "partial",
      strategy = "absolute",
      avoidCollisions = true,
      fitViewport = false,
      hideWhenDetached = false,
      trackAnchor = true,
      onEscapeKeyDown,
      onPointerDownOutside,
      style,
      ...contentProps
    } = props;

    const context = useComboboxContext(CONTENT_NAME);

    const positionerContext = useAnchorPositioner({
      open: context.open,
      onOpenChange: context.onOpenChange,
      anchorRef: context.hasAnchor ? context.anchorRef : context.inputRef,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      strategy,
      avoidCollisions,
      fitViewport,
      hideWhenDetached,
      trackAnchor,
    });

    const composedRef = useComposedRefs(forwardedRef, context.listRef, (node) =>
      positionerContext.refs.setFloating(node),
    );

    const composedStyle = React.useMemo<React.CSSProperties>(() => {
      return {
        ...style,
        ...positionerContext.floatingStyles,
        ...(!context.open && forceMount ? { visibility: "hidden" } : {}),
      };
    }, [style, positionerContext.floatingStyles, context.open, forceMount]);

    useDismiss({
      enabled: context.open,
      onDismiss: () => context.onOpenChange(false),
      refs: [context.listRef, context.anchorRef],
      onFocusOutside: (event) => event.preventDefault(),
      onEscapeKeyDown,
      onPointerDownOutside,
      disableOutsidePointerEvents: context.open && context.modal,
      preventScrollDismiss: context.open,
    });

    useScrollLock({
      referenceElement: context.inputRef.current,
      enabled: context.open && context.modal,
    });

    if (!forceMount && !context.open) return null;

    return (
      <ComboboxContentProvider
        side={positionerContext.side}
        align={positionerContext.align}
        onArrowChange={positionerContext.onArrowChange}
        arrowDisplaced={positionerContext.arrowDisplaced}
        arrowStyles={positionerContext.arrowStyles}
        forceMount={forceMount}
      >
        <FloatingFocusManager
          context={positionerContext.context}
          modal={false}
          initialFocus={context.inputRef}
          returnFocus={false}
          disabled={!context.open}
          visuallyHiddenDismiss
        >
          <Primitive.div
            data-state={getDataState(context.open)}
            role="listbox"
            {...positionerContext.getFloatingProps(contentProps)}
            ref={composedRef}
            style={composedStyle}
          />
        </FloatingFocusManager>
      </ComboboxContentProvider>
    );
  },
);

ComboboxContent.displayName = CONTENT_NAME;

const Content = ComboboxContent;

export { ComboboxContent, Content, useComboboxContentContext };

export type { ComboboxContentProps, ContentElement };
