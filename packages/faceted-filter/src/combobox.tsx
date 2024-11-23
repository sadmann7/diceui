import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { createContextScope } from "@radix-ui/react-context";
import { useId } from "@radix-ui/react-id";
import * as MenuPrimitive from "@radix-ui/react-menu";
import { createMenuScope } from "@radix-ui/react-menu";
import { Primitive } from "@radix-ui/react-primitive";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";

import type { Scope } from "@radix-ui/react-context";

type Direction = "ltr" | "rtl";

type TValue = string | string[];

/* -------------------------------------------------------------------------------------------------
 * Combobox
 * -----------------------------------------------------------------------------------------------*/

const COMBOBOX_NAME = "Combobox";

type ScopedProps<P> = P & { __scopeCombobox?: Scope };
const [createComboboxContext, createComboboxScope] = createContextScope(
  COMBOBOX_NAME,
  [createMenuScope],
);
const useMenuScope = createMenuScope();

interface ComboboxContextValue {
  triggerId: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentId: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  modal: boolean;
  multiple?: boolean;
  value?: TValue | TValue[];
  onValueChange(value: TValue | TValue[]): void;
  disabled?: boolean;
}

const [ComboboxProvider, useComboboxContext] =
  createComboboxContext<ComboboxContextValue>(COMBOBOX_NAME);

interface ComboboxProps {
  children?: React.ReactNode;
  dir?: Direction;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  modal?: boolean;
  defaultValue?: TValue | TValue[];
  value?: TValue | TValue[];
  onValueChange?(value: TValue | TValue[]): void;
  disabled?: boolean;
}

function Combobox(props: ScopedProps<ComboboxProps>) {
  const {
    __scopeCombobox,
    children,
    dir,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true,
    disabled = false,
    defaultValue,
    value: valueProp,
    onValueChange,
  } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  return (
    <ComboboxProvider
      scope={__scopeCombobox}
      triggerId={useId()}
      triggerRef={triggerRef}
      contentId={useId()}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={React.useCallback(
        () => setOpen((prevOpen) => !prevOpen),
        [setOpen],
      )}
      modal={modal}
      value={value}
      onValueChange={setValue}
      disabled={disabled}
    >
      <MenuPrimitive.Root
        {...menuScope}
        open={open}
        onOpenChange={setOpen}
        dir={dir}
        modal={modal}
      >
        {children}
      </MenuPrimitive.Root>
    </ComboboxProvider>
  );
}

Combobox.displayName = COMBOBOX_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "ComboboxTrigger";

type ComboboxTriggerElement = React.ElementRef<typeof Primitive.button>;
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<
  typeof Primitive.button
>;
interface ComboboxTriggerProps extends PrimitiveButtonProps {}

const ComboboxTrigger = React.forwardRef<
  ComboboxTriggerElement,
  ComboboxTriggerProps
>((props: ScopedProps<ComboboxTriggerProps>, forwardedRef) => {
  const { __scopeCombobox, disabled = false, ...triggerProps } = props;
  const context = useComboboxContext(TRIGGER_NAME, __scopeCombobox);
  const menuScope = useMenuScope(__scopeCombobox);
  return (
    <MenuPrimitive.Anchor asChild {...menuScope}>
      <Primitive.button
        type="button"
        id={context.triggerId}
        aria-haspopup="menu"
        aria-expanded={context.open}
        aria-controls={context.open ? context.contentId : undefined}
        data-state={context.open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        {...triggerProps}
        ref={composeRefs(forwardedRef, context.triggerRef)}
        onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
          // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
          // but not when the control key is pressed (avoiding MacOS right click)
          if (!disabled && event.button === 0 && event.ctrlKey === false) {
            context.onOpenToggle();
            // prevent trigger focusing when opening
            // this allows the content to be given focus without competition
            if (!context.open) event.preventDefault();
          }
        })}
        onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
          if (disabled) return;
          if (["Enter", " "].includes(event.key)) context.onOpenToggle();
          if (event.key === "ArrowDown") context.onOpenChange(true);
          // prevent keydown from scrolling window / first focused item to execute
          // that keydown (inadvertently closing the menu)
          if (["Enter", " ", "ArrowDown"].includes(event.key))
            event.preventDefault();
        })}
      />
    </MenuPrimitive.Anchor>
  );
});

ComboboxTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "ComboboxPortal";

type MenuPortalProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.Portal
>;
interface ComboboxPortalProps extends MenuPortalProps {}

const ComboboxPortal: React.FC<ComboboxPortalProps> = (
  props: ScopedProps<ComboboxPortalProps>,
) => {
  const { __scopeCombobox, ...portalProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  return <MenuPrimitive.Portal {...menuScope} {...portalProps} />;
};

ComboboxPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "ComboboxContent";

type ComboboxContentElement = React.ElementRef<typeof MenuPrimitive.Content>;
type MenuContentProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.Content
>;
interface ComboboxContentProps extends Omit<MenuContentProps, "onEntryFocus"> {}

const ComboboxContent = React.forwardRef<
  ComboboxContentElement,
  ComboboxContentProps
>((props: ScopedProps<ComboboxContentProps>, forwardedRef) => {
  const { __scopeCombobox, ...contentProps } = props;
  const context = useComboboxContext(CONTENT_NAME, __scopeCombobox);
  const menuScope = useMenuScope(__scopeCombobox);
  const hasInteractedOutsideRef = React.useRef(false);

  return (
    <MenuPrimitive.Content
      id={context.contentId}
      aria-labelledby={context.triggerId}
      {...menuScope}
      {...contentProps}
      ref={forwardedRef}
      onCloseAutoFocus={composeEventHandlers(
        props.onCloseAutoFocus,
        (event) => {
          if (!hasInteractedOutsideRef.current)
            context.triggerRef.current?.focus();
          hasInteractedOutsideRef.current = false;
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        },
      )}
      onInteractOutside={composeEventHandlers(
        props.onInteractOutside,
        (event) => {
          const originalEvent = event.detail.originalEvent as PointerEvent;
          const ctrlLeftClick =
            originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (!context.modal || isRightClick)
            hasInteractedOutsideRef.current = true;
        },
      )}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        ...{
          "--combobox-content-transform-origin":
            "var(--radix-popper-transform-origin)",
          "--combobox-content-available-width":
            "var(--radix-popper-available-width)",
          "--combobox-content-available-height":
            "var(--radix-popper-available-height)",
          "--combobox-trigger-width": "var(--radix-popper-anchor-width)",
          "--combobox-trigger-height": "var(--radix-popper-anchor-height)",
        },
      }}
    />
  );
});

ComboboxContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = "ComboboxGroup";

type ComboboxGroupElement = React.ElementRef<typeof MenuPrimitive.Group>;
type MenuGroupProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.Group
>;
interface ComboboxGroupProps extends MenuGroupProps {}

const ComboboxGroup = React.forwardRef<
  ComboboxGroupElement,
  ComboboxGroupProps
>((props: ScopedProps<ComboboxGroupProps>, forwardedRef) => {
  const { __scopeCombobox, ...groupProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  return (
    <MenuPrimitive.Group {...menuScope} {...groupProps} ref={forwardedRef} />
  );
});

ComboboxGroup.displayName = GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = "ComboboxLabel";

type ComboboxLabelElement = React.ElementRef<typeof MenuPrimitive.Label>;
type MenuLabelProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.Label
>;
interface ComboboxLabelProps extends MenuLabelProps {}

const ComboboxLabel = React.forwardRef<
  ComboboxLabelElement,
  ComboboxLabelProps
>((props: ScopedProps<ComboboxLabelProps>, forwardedRef) => {
  const { __scopeCombobox, ...labelProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  return (
    <MenuPrimitive.Label {...menuScope} {...labelProps} ref={forwardedRef} />
  );
});

ComboboxLabel.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "ComboboxItem";

type ComboboxItemElement = React.ElementRef<typeof MenuPrimitive.Item>;
type MenuItemProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item>;
interface ComboboxItemProps extends MenuItemProps {}

const ComboboxItem = React.forwardRef<ComboboxItemElement, ComboboxItemProps>(
  (props: ScopedProps<ComboboxItemProps>, forwardedRef) => {
    const { __scopeCombobox, ...itemProps } = props;
    const menuScope = useMenuScope(__scopeCombobox);
    return (
      <MenuPrimitive.Item {...menuScope} {...itemProps} ref={forwardedRef} />
    );
  },
);

ComboboxItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = "ComboboxItemIndicator";

type ComboboxItemIndicatorElement = React.ElementRef<
  typeof MenuPrimitive.ItemIndicator
>;
type MenuItemIndicatorProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.ItemIndicator
>;
interface ComboboxItemIndicatorProps extends MenuItemIndicatorProps {}

const ComboboxItemIndicator = React.forwardRef<
  ComboboxItemIndicatorElement,
  ComboboxItemIndicatorProps
>((props: ScopedProps<ComboboxItemIndicatorProps>, forwardedRef) => {
  const { __scopeCombobox, ...itemIndicatorProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  return (
    <MenuPrimitive.ItemIndicator
      {...menuScope}
      {...itemIndicatorProps}
      ref={forwardedRef}
    />
  );
});

ComboboxItemIndicator.displayName = INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = "ComboboxSeparator";

type ComboboxSeparatorElement = React.ElementRef<
  typeof MenuPrimitive.Separator
>;
type MenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.Separator
>;
interface ComboboxSeparatorProps extends MenuSeparatorProps {}

const ComboboxSeparator = React.forwardRef<
  ComboboxSeparatorElement,
  ComboboxSeparatorProps
>((props: ScopedProps<ComboboxSeparatorProps>, forwardedRef) => {
  const { __scopeCombobox, ...separatorProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  return (
    <MenuPrimitive.Separator
      {...menuScope}
      {...separatorProps}
      ref={forwardedRef}
    />
  );
});

ComboboxSeparator.displayName = SEPARATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = "ComboboxArrow";

type ComboboxArrowElement = React.ElementRef<typeof MenuPrimitive.Arrow>;
type MenuArrowProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.Arrow
>;
interface ComboboxArrowProps extends MenuArrowProps {}

const ComboboxArrow = React.forwardRef<
  ComboboxArrowElement,
  ComboboxArrowProps
>((props: ScopedProps<ComboboxArrowProps>, forwardedRef) => {
  const { __scopeCombobox, ...arrowProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  return (
    <MenuPrimitive.Arrow {...menuScope} {...arrowProps} ref={forwardedRef} />
  );
});

ComboboxArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxSub
 * -----------------------------------------------------------------------------------------------*/

interface ComboboxSubProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}

const ComboboxSub: React.FC<ComboboxSubProps> = (
  props: ScopedProps<ComboboxSubProps>,
) => {
  const {
    __scopeCombobox,
    children,
    open: openProp,
    onOpenChange,
    defaultOpen,
  } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <MenuPrimitive.Sub {...menuScope} open={open} onOpenChange={setOpen}>
      {children}
    </MenuPrimitive.Sub>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ComboboxSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = "ComboboxSubTrigger";

type ComboboxSubTriggerElement = React.ElementRef<
  typeof MenuPrimitive.SubTrigger
>;
type MenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.SubTrigger
>;
interface ComboboxSubTriggerProps extends MenuSubTriggerProps {}

const ComboboxSubTrigger = React.forwardRef<
  ComboboxSubTriggerElement,
  ComboboxSubTriggerProps
>((props: ScopedProps<ComboboxSubTriggerProps>, forwardedRef) => {
  const { __scopeCombobox, ...subTriggerProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);
  return (
    <MenuPrimitive.SubTrigger
      {...menuScope}
      {...subTriggerProps}
      ref={forwardedRef}
    />
  );
});

ComboboxSubTrigger.displayName = SUB_TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * ComboboxSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = "ComboboxSubContent";

type ComboboxSubContentElement = React.ElementRef<typeof MenuPrimitive.Content>;
type MenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof MenuPrimitive.SubContent
>;
interface ComboboxSubContentProps extends MenuSubContentProps {}

const ComboboxSubContent = React.forwardRef<
  ComboboxSubContentElement,
  ComboboxSubContentProps
>((props: ScopedProps<ComboboxSubContentProps>, forwardedRef) => {
  const { __scopeCombobox, ...subContentProps } = props;
  const menuScope = useMenuScope(__scopeCombobox);

  return (
    <MenuPrimitive.SubContent
      {...menuScope}
      {...subContentProps}
      ref={forwardedRef}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        ...{
          "--combobox-content-transform-origin":
            "var(--radix-popper-transform-origin)",
          "--combobox-content-available-width":
            "var(--radix-popper-available-width)",
          "--combobox-content-available-height":
            "var(--radix-popper-available-height)",
          "--combobox-trigger-width": "var(--radix-popper-anchor-width)",
          "--combobox-trigger-height": "var(--radix-popper-anchor-height)",
        },
      }}
    />
  );
});

ComboboxSubContent.displayName = SUB_CONTENT_NAME;

/* -----------------------------------------------------------------------------------------------*/

const Root = Combobox;
const Trigger = ComboboxTrigger;
const Portal = ComboboxPortal;
const Content = ComboboxContent;
const Group = ComboboxGroup;
const Label = ComboboxLabel;
const Item = ComboboxItem;
const ItemIndicator = ComboboxItemIndicator;
const Separator = ComboboxSeparator;
const Arrow = ComboboxArrow;
const Sub = ComboboxSub;
const SubTrigger = ComboboxSubTrigger;
const SubContent = ComboboxSubContent;

export {
  Arrow,
  //
  Combobox,
  ComboboxArrow,
  ComboboxContent,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxSeparator,
  ComboboxSub,
  ComboboxSubContent,
  ComboboxSubTrigger,
  ComboboxTrigger,
  Content,
  createComboboxScope,
  Group,
  Item,
  ItemIndicator,
  Label,
  Portal,
  //
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
};
export type {
  ComboboxArrowProps,
  ComboboxContentProps,
  ComboboxGroupProps,
  ComboboxItemIndicatorProps,
  ComboboxItemProps,
  ComboboxLabelProps,
  ComboboxPortalProps,
  ComboboxProps,
  ComboboxSeparatorProps,
  ComboboxSubContentProps,
  ComboboxSubProps,
  ComboboxSubTriggerProps,
  ComboboxTriggerProps,
};
