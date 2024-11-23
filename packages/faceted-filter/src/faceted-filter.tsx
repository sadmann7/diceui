"use client";

import { createContextScope } from "@radix-ui/react-context";
import { useId } from "@radix-ui/react-id";
import { Primitive } from "@radix-ui/react-primitive";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";

// Context
const FACETED_FILTER_NAME = "FacetedFilter";

type FacetedFilterContextValue = {
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  multi?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  contentId: string;
};

type ScopedProps<P> = P & { __scopeFacetedFilter?: Scope };
type Scope<C = FacetedFilterContextValue | undefined> =
  | { [scopeName: string]: React.Context<C>[] }
  | undefined;

const [createFacetedFilterContext, createFacetedFilterScope] =
  createContextScope(FACETED_FILTER_NAME);

const [FacetedFilterProvider, useFacetedFilterContext] =
  createFacetedFilterContext<FacetedFilterContextValue>(FACETED_FILTER_NAME);

// Root
interface FacetedFilterProps {
  value?: string[] | string;
  defaultValue?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  multi?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const FacetedFilter = React.forwardRef<HTMLDivElement, FacetedFilterProps>(
  (props: ScopedProps<FacetedFilterProps>, forwardedRef) => {
    const {
      __scopeFacetedFilter,
      value: valueProp,
      defaultValue,
      onValueChange,
      multi = false,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      children,
      ...filterProps
    } = props;

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
      <FacetedFilterProvider
        scope={__scopeFacetedFilter as Scope<FacetedFilterContextValue>}
        value={value}
        onValueChange={setValue}
        multi={multi}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        contentId={useId()}
      >
        <Primitive.div ref={forwardedRef} {...filterProps}>
          {children}
        </Primitive.div>
      </FacetedFilterProvider>
    );
  },
);
FacetedFilter.displayName = FACETED_FILTER_NAME;

// Trigger
const FacetedFilterTrigger = React.forwardRef<
  HTMLButtonElement,
  ScopedProps<React.ComponentPropsWithoutRef<typeof Primitive.button>>
>(({ className, children, __scopeFacetedFilter, ...props }, forwardedRef) => {
  const context = useFacetedFilterContext(
    FACETED_FILTER_NAME,
    __scopeFacetedFilter,
  );

  return (
    <Primitive.button
      ref={forwardedRef}
      type="button"
      aria-expanded={context.open}
      aria-disabled={context.disabled}
      data-state={context.open ? "open" : "closed"}
      disabled={context.disabled}
      className={className}
      onClick={() => context.onOpenChange(!context.open)}
      {...props}
    >
      {children}
    </Primitive.button>
  );
});
FacetedFilterTrigger.displayName = "FacetedFilterTrigger";

// Content
const FacetedFilterContent = React.forwardRef<
  HTMLDivElement,
  ScopedProps<React.ComponentPropsWithoutRef<typeof Primitive.div>>
>(({ className, children, __scopeFacetedFilter, ...props }, forwardedRef) => {
  const context = useFacetedFilterContext(
    FACETED_FILTER_NAME,
    __scopeFacetedFilter,
  );

  if (!context.open) return null;

  return (
    <Primitive.div
      ref={forwardedRef}
      id={context.contentId}
      data-state={context.open ? "open" : "closed"}
      className={className}
      {...props}
    >
      {children}
    </Primitive.div>
  );
});
FacetedFilterContent.displayName = "FacetedFilterContent";

// Item
interface FacetedFilterItemProps
  extends Omit<
    ScopedProps<React.ComponentPropsWithoutRef<typeof Primitive.div>>,
    "value" | "onSelect"
  > {
  value: string;
  onSelect?: (value: string) => void;
}

const FacetedFilterItem = React.forwardRef<
  HTMLDivElement,
  FacetedFilterItemProps
>(
  (
    { className, children, value, onSelect, __scopeFacetedFilter, ...props },
    forwardedRef,
  ) => {
    const context = useFacetedFilterContext(
      FACETED_FILTER_NAME,
      __scopeFacetedFilter,
    );

    const handleSelect = React.useCallback(() => {
      if (context.multi && Array.isArray(context.value)) {
        const newValue = context.value.includes(value)
          ? context.value.filter((v) => v !== value)
          : [...context.value, value];
        context.onValueChange?.(newValue);
      } else {
        context.onValueChange?.(value);
        context.onOpenChange(false);
      }
      onSelect?.(value);
    }, [context, value, onSelect]);

    const isSelected = React.useMemo(() => {
      if (context.multi && Array.isArray(context.value)) {
        return context.value.includes(value);
      }
      return context.value === value;
    }, [context.value, value, context.multi]);

    return (
      <Primitive.div
        ref={forwardedRef}
        role="option"
        aria-selected={isSelected}
        data-selected={isSelected ? "" : undefined}
        className={className}
        onClick={handleSelect}
        {...props}
      >
        {children}
      </Primitive.div>
    );
  },
);
FacetedFilterItem.displayName = "FacetedFilterItem";

// List
const FacetedFilterList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, children, ...props }, forwardedRef) => (
  <Primitive.div
    ref={forwardedRef}
    role="listbox"
    className={className}
    {...props}
  >
    {children}
  </Primitive.div>
));
FacetedFilterList.displayName = "FacetedFilterList";

// Input
const FacetedFilterInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ className, ...props }, forwardedRef) => (
  <Primitive.input ref={forwardedRef} className={className} {...props} />
));
FacetedFilterInput.displayName = "FacetedFilterInput";

// Group
const FacetedFilterGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, ...props }, forwardedRef) => (
  <Primitive.div ref={forwardedRef} className={className} {...props} />
));
FacetedFilterGroup.displayName = "FacetedFilterGroup";

// Empty
const FacetedFilterEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, children, ...props }, forwardedRef) => (
  <Primitive.div ref={forwardedRef} className={className} {...props}>
    {children}
  </Primitive.div>
));
FacetedFilterEmpty.displayName = "FacetedFilterEmpty";

export {
  createFacetedFilterScope,
  FacetedFilter,
  FacetedFilterContent,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterInput,
  FacetedFilterItem,
  FacetedFilterList,
  FacetedFilterTrigger,
};
