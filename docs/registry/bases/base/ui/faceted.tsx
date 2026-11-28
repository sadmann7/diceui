"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ReactStore, useStore } from "@base-ui/utils/store";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "cn";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/registry/bases/base/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/base/ui/popover";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

type FacetedSelectedValue<Multiple extends boolean> = Multiple extends true
  ? string[]
  : string;

interface FacetedOption {
  label: string;
  value: string;
}

const NO_ITEMS: FacetedOption[] = [];

interface FacetedStoreState {
  value: string | string[] | undefined;
  items: FacetedOption[];
  multiple: boolean;
  label: string | undefined;
  announcement: string;
}

interface FacetedController {
  isValueControlled: boolean;
  onValueChange?: (value: string | string[] | undefined) => void;
  setOpen: (open: boolean) => void;
}

function getIsValueSelected(
  value: string | string[] | undefined,
  multiple: boolean,
  itemValue: string,
) {
  if (multiple) return Array.isArray(value) && value.includes(itemValue);
  return value === itemValue;
}

const labelsCache = new WeakMap<FacetedOption[], Map<string, string>>();

function getLabels(items: FacetedOption[]) {
  let labels = labelsCache.get(items);
  if (!labels) {
    labels = new Map(items.map((item) => [item.value, item.label]));
    labelsCache.set(items, labels);
  }
  return labels;
}

function getSelectedValues(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function getSelectedItems(
  values: string[],
  items: FacetedOption[],
): FacetedOption[] {
  const labels = getLabels(items);

  return values.map((value) => ({
    label: labels.get(value) ?? value,
    value,
  }));
}

function getIsFacetedSelectedValue<Multiple extends boolean>(
  value: string | string[] | undefined,
  multiple: Multiple,
): value is FacetedSelectedValue<Multiple> | undefined {
  if (value === undefined) return true;
  return multiple ? Array.isArray(value) : typeof value === "string";
}

const facetedSelectors = {
  value: (state: FacetedStoreState) => state.value,
  items: (state: FacetedStoreState) => state.items,
  multiple: (state: FacetedStoreState) => state.multiple,
  label: (state: FacetedStoreState) => state.label,
  announcement: (state: FacetedStoreState) => state.announcement,
  isValueSelected: (state: FacetedStoreState, itemValue: string) =>
    getIsValueSelected(state.value, state.multiple, itemValue),
  hasSelection: (state: FacetedStoreState) =>
    getSelectedValues(state.value).length > 0,
};

type FacetedStore = ReactStore<
  FacetedStoreState,
  FacetedController,
  typeof facetedSelectors
>;

function commitValue(
  store: FacetedStore,
  nextValue: string | string[] | undefined,
) {
  store.context.onValueChange?.(nextValue);
  if (!store.context.isValueControlled) store.set("value", nextValue);
}

function setOpen(store: FacetedStore, open: boolean) {
  store.set("announcement", "");
  store.context.setOpen(open);
}

function selectItem(store: FacetedStore, selectedValue: string) {
  const { value, multiple, items } = store.state;

  if (multiple) {
    const selected = Array.isArray(value) ? value : [];
    const isRemoving = selected.includes(selectedValue);
    commitValue(
      store,
      isRemoving
        ? selected.filter((item) => item !== selectedValue)
        : [...selected, selectedValue],
    );
    const itemLabel = getLabels(items).get(selectedValue) ?? selectedValue;
    store.set(
      "announcement",
      `${itemLabel} ${isRemoving ? "not selected" : "selected"}`,
    );
    return;
  }

  commitValue(store, value === selectedValue ? undefined : selectedValue);
  setOpen(store, false);
}

function clear(store: FacetedStore) {
  commitValue(store, store.state.multiple ? [] : undefined);
}

const FacetedStoreContext = React.createContext<FacetedStore | null>(null);

function useFacetedStore(name: string) {
  const store = React.useContext(FacetedStoreContext);
  if (!store) {
    throw new Error(`\`${name}\` must be used within \`Faceted\`.`);
  }
  return store;
}

interface FacetedProps<Multiple extends boolean = false> extends Omit<
  React.ComponentProps<typeof Popover>,
  "onOpenChange"
> {
  value?: FacetedSelectedValue<Multiple>;
  defaultValue?: FacetedSelectedValue<Multiple>;
  onValueChange?: (value: FacetedSelectedValue<Multiple> | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  items?: FacetedOption[];
  multiple?: Multiple;
}

function Faceted<Multiple extends boolean = false>({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  value,
  defaultValue,
  onValueChange,
  items = NO_ITEMS,
  multiple = false as Multiple,
  ...props
}: FacetedProps<Multiple>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;

  const [store] = React.useState<FacetedStore>(
    () =>
      new ReactStore<
        FacetedStoreState,
        FacetedController,
        typeof facetedSelectors
      >(
        {
          value: value ?? defaultValue,
          items,
          multiple,
          label: undefined,
          announcement: "",
        },
        { isValueControlled: value !== undefined, setOpen: () => {} },
        facetedSelectors,
      ),
  );

  useIsoLayoutEffect(() => {
    Object.assign(store.context, {
      isValueControlled: value !== undefined,
      onValueChange(nextValue) {
        if (!getIsFacetedSelectedValue(nextValue, multiple)) return;
        onValueChange?.(nextValue);
      },
      setOpen(nextOpen) {
        onOpenChange?.(nextOpen);
        if (openProp === undefined) setInternalOpen(nextOpen);
      },
    } satisfies FacetedController);
  });

  const wasValueControlledRef = React.useRef(value !== undefined);

  useIsoLayoutEffect(() => {
    const isValueControlled = value !== undefined;
    if (isValueControlled || wasValueControlledRef.current) {
      store.update({ value, items, multiple });
    } else {
      store.update({ items, multiple });
    }
    wasValueControlledRef.current = isValueControlled;
  }, [store, value, items, multiple]);

  return (
    <FacetedStoreContext.Provider value={store}>
      <Popover
        data-slot="faceted"
        open={open}
        onOpenChange={(nextOpen) => setOpen(store, nextOpen)}
        {...props}
      />
    </FacetedStoreContext.Provider>
  );
}

function FacetedTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverTrigger>) {
  return (
    <PopoverTrigger
      data-slot="faceted-trigger"
      className={cn("cn-faceted-trigger", className)}
      {...props}
    />
  );
}

interface FacetedValueProps {
  placeholder?: React.ReactNode;
  children?: React.ReactNode | ((selected: FacetedOption[]) => React.ReactNode);
}

function FacetedValue({
  placeholder = "Select options...",
  children,
}: FacetedValueProps) {
  const store = useFacetedStore("FacetedValue");
  const value = useStore(store, facetedSelectors.value);
  const items = useStore(store, facetedSelectors.items);
  const multiple = useStore(store, facetedSelectors.multiple);
  const values = getSelectedValues(value);

  if (typeof children === "function") {
    return children(getSelectedItems(values, items));
  }
  if (children != null) return children;

  const selected =
    multiple && values.length > 2 ? [] : getSelectedItems(values, items);
  const [item] = selected;

  return (
    <span
      data-slot="faceted-value"
      className={cn(
        "cn-faceted-value",
        values.length === 0 && "text-muted-foreground",
      )}
    >
      {multiple && values.length > 0 ? (
        <FacetedBadgeList>
          {values.length > 2 ? (
            <FacetedBadge>{values.length} selected</FacetedBadge>
          ) : (
            selected.map((selectedItem) => (
              <FacetedBadge key={selectedItem.value}>
                <span className="cn-faceted-value-2">{selectedItem.label}</span>
              </FacetedBadge>
            ))
          )}
        </FacetedBadgeList>
      ) : (
        <span className="cn-faceted-value-3">
          {item ? item.label : placeholder}
        </span>
      )}
      <IconPlaceholder
        lucide="ChevronDown"
        tabler="IconChevronDown"
        hugeicons="ArrowDown01Icon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
        className="cn-faceted-value-4"
      />
    </span>
  );
}

function FacetedBadgeList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="faceted-badge-list"
      className={cn("cn-faceted-badge-list", className)}
      {...props}
    />
  );
}

function FacetedBadge({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  return useRender({
    defaultTagName: "span",
    render,
    state: {
      slot: "faceted-badge",
    },
    props: mergeProps<"span">(
      {
        className: cn("cn-faceted-badge", className),
      },
      props,
    ),
  });
}

interface FacetedContentProps
  extends
    React.ComponentProps<typeof PopoverContent>,
    Pick<
      React.ComponentProps<typeof Command>,
      "shouldFilter" | "filter" | "loop"
    > {}

function FacetedContent({
  className,
  children,
  shouldFilter,
  filter,
  loop,
  ...props
}: FacetedContentProps) {
  const store = useFacetedStore("FacetedContent");
  const label = useStore(store, facetedSelectors.label);
  const announcement = useStore(store, facetedSelectors.announcement);

  return (
    <PopoverContent
      aria-label={label}
      data-slot="faceted-content"
      align="start"
      className={cn(
        "cn-faceted-content cn-menu-target cn-menu-translucent",
        className,
      )}

      {...props}
    >
      <Command
        shouldFilter={shouldFilter}
        filter={filter}
        loop={loop}
        label={label}
        className="cn-faceted-content-2"
      >
        {children}
      </Command>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </PopoverContent>
  );
}

interface FacetedInputProps extends React.ComponentProps<
  typeof CommandPrimitive.Input
> {
  variant?: "default" | "line";
}

function FacetedInput({
  variant = "default",
  className,
  ref,
  ...props
}: FacetedInputProps) {
  const store = useFacetedStore("FacetedInput");
  const label = props["aria-label"] ?? props.placeholder;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useMergedRefs(ref, inputRef);

  React.useEffect(() => {
    const input = inputRef.current;
    const root = input?.closest("[cmdk-root]");
    if (!input || !root) return;

    // cmdk's own aria-activedescendant lags behind and targets the item wrapper.
    const onSync = () => {
      const id = root.querySelector(
        "[cmdk-item][aria-selected='true'] > [role='option']",
      )?.id;
      for (const element of [input, root.querySelector("[cmdk-list]")]) {
        if (!element) continue;
        if (!id) {
          element.removeAttribute("aria-activedescendant");
        } else if (element.getAttribute("aria-activedescendant") !== id) {
          element.setAttribute("aria-activedescendant", id);
        }
      }
    };

    onSync();
    const observer = new MutationObserver(onSync);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributeFilter: ["aria-selected", "aria-activedescendant"],
    });
    return () => observer.disconnect();
  }, []);

  useIsoLayoutEffect(() => {
    store.set("label", label);
    return () => store.set("label", undefined);
  }, [store, label]);

  if (variant === "line") {
    return (
      <div
        data-slot="faceted-input-wrapper"
        data-variant="line"
        className="cn-faceted-input-wrapper"
      >
        <IconPlaceholder
          lucide="SearchIcon"
          tabler="IconSearch"
          hugeicons="Search01Icon"
          phosphor="MagnifyingGlassIcon"
          remixicon="RiSearchLine"
          className="cn-faceted-input"
        />
        <CommandPrimitive.Input
          ref={composedRef}
          data-slot="faceted-input"
          className={cn("cn-faceted-input-2", className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <CommandInput
      ref={composedRef}
      data-slot="faceted-input"
      className={className}
      {...props}
    />
  );
}

function FacetedList({
  label: labelProp,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  const store = useFacetedStore("FacetedList");
  const label = useStore(store, facetedSelectors.label);
  const multiple = useStore(store, facetedSelectors.multiple);

  return (
    <CommandList
      data-slot="faceted-list"
      aria-multiselectable={multiple || undefined}
      label={labelProp ?? label}
      {...props}
    />
  );
}

function FacetedEmpty({ ...props }: React.ComponentProps<typeof CommandEmpty>) {
  return <CommandEmpty data-slot="faceted-empty" {...props} />;
}

function FacetedLoading({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
  return (
    <CommandPrimitive.Loading
      data-slot="faceted-loading"
      className={cn("cn-faceted-loading", className)}
      {...props}
    />
  );
}

function FacetedGroup({ ...props }: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="faceted-group" {...props} />;
}

interface FacetedCommandItemProps extends React.ComponentProps<
  typeof CommandPrimitive.Item
> {
  selected?: boolean;
}

function FacetedCommandItem({
  selected,
  disabled,
  className,
  children,
  onPointerDownCapture,
  onMouseDown,
  onSelect,
  ...props
}: FacetedCommandItemProps) {
  const optionId = React.useId();

  return (
    <CommandPrimitive.Item
      disabled={disabled}
      className={cn("cn-faceted-command-item group/command-item", className)}
      {...mergeProps<"div">(
        {
          onPointerDownCapture(event) {
            // A focusable item steals the input on pointerdown.
            event.preventDefault();
            if (event.pointerType === "touch") return;
            event.currentTarget
              .closest("[cmdk-root]")
              ?.querySelector<HTMLInputElement>("[cmdk-input]")
              ?.focus();
          },
          onMouseDown(event) {
            // iOS Safari can emit a synthetic mousedown without a pointerdown.
            event.preventDefault();
          },
        },
        { onPointerDownCapture, onMouseDown },
      )}
      onSelect={onSelect}
      {...props}
      asChild
    >
      {/* cmdk marks the highlighted item with aria-selected, so the option is an inner element. */}
      <div role="none" aria-disabled={disabled || undefined}>
        <div
          role="option"
          id={optionId}
          aria-selected={selected}
          aria-disabled={disabled || undefined}
          className="justify-[inherit] flex min-w-0 flex-1 items-center gap-[inherit] group-data-selected/command-item:*:[svg]:text-foreground"
        >
          {children}
        </div>
      </div>
    </CommandPrimitive.Item>
  );
}

interface FacetedItemProps extends React.ComponentProps<
  typeof CommandPrimitive.Item
> {
  value: string;
}

function FacetedItem({ value, onSelect, ...props }: FacetedItemProps) {
  const store = useFacetedStore("FacetedItem");
  const isSelected = useStore(store, facetedSelectors.isValueSelected, value);

  return (
    <FacetedCommandItem
      data-slot="faceted-item"
      data-checked={isSelected || undefined}
      selected={isSelected}
      onSelect={() => {
        if (onSelect) {
          onSelect(value);
          return;
        }
        selectItem(store, value);
      }}
      {...props}
    />
  );
}

function FacetedItemIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="faceted-item-indicator"
      className={cn("cn-faceted-item-indicator", className)}
      {...props}
    >
      {children != null && (
        <span className="cn-faceted-item-indicator-2">
          <span className="sr-only">, </span>
          {children}
        </span>
      )}
      <IconPlaceholder
        lucide="Check"
        tabler="IconCheck"
        hugeicons="Tick02Icon"
        phosphor="CheckIcon"
        remixicon="RiCheckLine"
        className="cn-faceted-item-indicator-3"
      />
    </span>
  );
}

function FacetedClear({
  className,
  children = "Clear",
  onSelect,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  const store = useFacetedStore("FacetedClear");
  const hasSelection = useStore(store, facetedSelectors.hasSelection);

  if (!hasSelection) return null;

  return (
    <>
      <FacetedSeparator />
      <FacetedGroup>
        <FacetedCommandItem
          data-slot="faceted-clear"
          className={cn("cn-faceted-clear", className)}
          onSelect={(value) => {
            onSelect?.(value);
            clear(store);
          }}
          {...props}
        >
          {children}
        </FacetedCommandItem>
      </FacetedGroup>
    </>
  );
}

function FacetedSeparator({
  ...props
}: React.ComponentProps<typeof CommandSeparator>) {
  return (
    <CommandSeparator
      data-slot="faceted-separator"
      aria-hidden="true"
      className="cn-faceted-separator"
      {...props}
    />
  );
}

export {
  Faceted,
  FacetedBadge,
  FacetedBadgeList,
  FacetedClear,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedItemIndicator,
  FacetedList,
  FacetedLoading,
  FacetedSeparator,
  FacetedTrigger,
  FacetedValue,
};
