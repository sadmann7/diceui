import {
  BubbleInput,
  type Direction,
  createContext,
  forwardRef,
  useCollection,
  useComposedRefs,
  useControllableState,
  useDirection,
  useFilter,
  useFormControl,
  useId,
} from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const ROOT_NAME = "ComboboxRoot";

type ComboboxValue<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string;

interface ComboboxContextValue<Multiple extends boolean = false> {
  value: ComboboxValue<Multiple>;
  onValueChange: (value: ComboboxValue<Multiple>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => Promise<void>;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onFilter?: (options: string[], term: string) => string[];
  collectionRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
    groups: Map<string, Set<string>>;
  };
  highlightedItem: HTMLElement | null;
  onHighlightedItemChange: (item: HTMLElement | null) => void;
  onRegisterItem: (id: string, value: string, groupId?: string) => () => void;
  onFilterItems: () => void;
  onHighlightMove: (
    target: "next" | "prev" | "first" | "last" | "selected",
  ) => void;
  onCustomAnchorAdd: () => void;
  onCustomAnchorRemove: () => void;
  hasCustomAnchor: boolean;
  multiple: Multiple;
  disabled: boolean;
  loop: boolean;
  resetOnBlur: boolean;
  modal: boolean;
  dir: Direction;
  id: string;
  labelId: string;
  contentId: string;
}

const [ComboboxProvider, useComboboxContext] =
  createContext<ComboboxContextValue<boolean>>(ROOT_NAME);

interface ComboboxRootProps<Multiple extends boolean = false>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange"
  > {
  /** The current value of the combobox. */
  value?: ComboboxValue<Multiple>;

  /** The default value of the combobox. */
  defaultValue?: ComboboxValue<Multiple>;

  /** Event handler called when the value changes. */
  onValueChange?: (value: ComboboxValue<Multiple>) => void;

  /** Whether the combobox is open. */
  open?: boolean;
  /**
   * Whether the combobox is open by default.
   * @default false
   */
  defaultOpen?: boolean;

  /** Event handler called when the open state of the combobox changes. */
  onOpenChange?: (open: boolean) => void;

  /** The current input value of the combobox. */
  inputValue?: string;

  /** Event handler called when the input value changes. */
  onInputValueChange?: (value: string) => void;

  /**
   * Event handler called when the filter is applied.
   * Can be used to prevent the filtering behavior.
   */
  onFilter?: (options: string[], inputValue: string) => string[];

  /** The direction of the combobox. */
  dir?: Direction;

  /**
   * Whether the combobox allows multiple values.
   * @default false
   */
  multiple?: Multiple;

  /** Whether the combobox is disabled. */
  disabled?: boolean;
  /**
   * Whether the combobox loops through items.
   * @default false
   */
  loop?: boolean;

  /**
   * Whether the combobox resets the value on blur.
   * @default true
   */
  resetOnBlur?: boolean;

  /**
   * Whether the combobox uses fuzzy filtering.
   * @default true
   */
  fuzzy?: boolean;
  /**
   * Whether the combobox is modal.
   * @default false
   */

  modal?: boolean;

  /**
   * Whether the combobox is required in a form context.
   * @default false
   */
  required?: boolean;

  /** The name of the combobox when used in a form. */
  name?: string;
}

function ComboboxRootImpl<Multiple extends boolean = false>(
  props: ComboboxRootProps<Multiple>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange: onValueChangeProp,
    open: openProp,
    defaultOpen = false,
    onOpenChange: onOpenChangeProp,
    inputValue: inputValueProp,
    onInputValueChange,
    onFilter,
    multiple = false,
    disabled = false,
    loop = false,
    resetOnBlur = true,
    fuzzy = true,
    modal = false,
    required = false,
    dir: dirProp,
    name,
    children,
    ...rootProps
  } = props;

  const collectionRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  const id = useId();
  const labelId = `${id}label`;
  const contentId = `${id}content`;

  const dir = useDirection(dirProp);
  const { getEnabledItems } = useCollection({ ref: collectionRef });
  const { isFormControl, onTriggerChange } = useFormControl();
  const composedRef = useComposedRefs(forwardedRef, collectionRef, (node) =>
    onTriggerChange(node),
  );

  const [value = multiple ? [""] : "", setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChangeProp,
  });
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChangeProp,
  });
  const [inputValue = "", setInputValue] = useControllableState({
    prop: inputValueProp,
    onChange: onInputValueChange,
  });

  const [hasCustomAnchor, setHasCustomAnchor] = React.useState(false);

  const [highlightedItem, setHighlightedItem] =
    React.useState<HTMLElement | null>(null);

  const items = React.useRef(new Map<string, string>()).current;
  const groups = React.useRef(new Map<string, Set<string>>()).current;
  const filterStore = React.useRef<ComboboxContextValue["filterStore"]>({
    search: "",
    itemCount: 0,
    items: new Map<string, number>(),
    groups: new Map<string, Set<string>>(),
  }).current;

  const filter = useFilter({ sensitivity: "base" });
  const currentFilter = fuzzy ? filter.fuzzy : filter.contains;

  const normalizeString = React.useCallback((str: string) => {
    return str
      .toLowerCase()
      .replace(/[-_\s]+/g, " ")
      .trim();
  }, []);

  const onFilterItems = React.useCallback(() => {
    filterStore.groups.clear();
    filterStore.items.clear();

    function processItem(id: string, value: string) {
      const normalizedValue = normalizeString(value);
      const normalizedSearch = normalizeString(filterStore.search);

      if (normalizedSearch.trim() === "") return 0;

      const score = onFilter
        ? Number(onFilter([value], filterStore.search).length > 0)
        : Number(currentFilter(normalizedValue, normalizedSearch));
      filterStore.items.set(id, score);
      return score;
    }

    let itemCount = 0;
    for (const [id, value] of items.entries()) {
      itemCount += processItem(id, value);
    }
    filterStore.itemCount = itemCount;

    // Only process groups if there are any
    if (groups.size) {
      for (const [groupId, group] of groups.entries()) {
        const hasMatchingItem = Array.from(group).some((itemId) =>
          filterStore.items.get(itemId),
        );
        if (hasMatchingItem) {
          filterStore.groups.set(groupId, new Set());
        }
      }
    }
  }, [filterStore, items, groups, onFilter, currentFilter, normalizeString]);

  const onOpenChange = React.useCallback(
    async (open: boolean) => {
      setOpen(open);
      if (open) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const input = inputRef.current;
        if (input) {
          input.focus();
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }
    },
    [setOpen],
  );

  const onValueChange = React.useCallback(
    (newValue: string | string[]) => {
      if (multiple && typeof newValue === "string") {
        const currentValue = (value as string[]) || [];
        const newValues = currentValue.includes(newValue)
          ? currentValue.filter((v) => v !== newValue)
          : [...currentValue, newValue];
        setValue(newValues as ComboboxValue<Multiple>);
      } else {
        setValue(newValue as ComboboxValue<Multiple>);
        if (!multiple) {
          setOpen(false);
        }
      }
    },
    [multiple, setValue, setOpen, value],
  );

  const onRegisterItem = React.useCallback(
    (id: string, value: string, groupId?: string) => {
      items.set(id, value);

      if (groupId) {
        if (!groups.has(groupId)) {
          groups.set(groupId, new Set());
        }
        groups.get(groupId)?.add(id);
      }

      return () => {
        items.delete(id);
        if (groupId) {
          const group = groups.get(groupId);
          group?.delete(id);
          if (group?.size === 0) {
            groups.delete(groupId);
          }
        }
      };
    },
    [items, groups],
  );

  const onHighlightMove = React.useCallback(
    (target: Parameters<ComboboxContextValue["onHighlightMove"]>[0]) => {
      const items = getEnabledItems();
      if (!items.length) return;

      const currentIndex = items.indexOf(highlightedItem as HTMLElement);
      let nextIndex: number;

      switch (target) {
        case "next":
          nextIndex = currentIndex + 1;
          if (nextIndex >= items.length) {
            nextIndex = loop ? 0 : items.length - 1;
          }
          break;
        case "prev":
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? items.length - 1 : 0;
          }
          break;
        case "first":
          nextIndex = 0;
          break;
        case "last":
          nextIndex = items.length - 1;
          break;
        case "selected": {
          const selectedValue = Array.isArray(value) ? value[0] : value;
          nextIndex = items.findIndex(
            (item) => item.getAttribute("data-value") === selectedValue,
          );

          if (nextIndex === -1) nextIndex = 0;
          break;
        }
      }

      const nextItem = items[nextIndex];
      if (nextItem) {
        nextItem.scrollIntoView({ block: "nearest" });
        setHighlightedItem(nextItem);
      }
    },
    [loop, highlightedItem, getEnabledItems, value],
  );

  const onCustomAnchorAdd = React.useCallback(
    () => setHasCustomAnchor(true),
    [],
  );

  const onCustomAnchorRemove = React.useCallback(
    () => setHasCustomAnchor(false),
    [],
  );

  return (
    <ComboboxProvider
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={onOpenChange}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      onFilter={onFilter}
      collectionRef={collectionRef}
      contentRef={contentRef}
      inputRef={inputRef}
      anchorRef={anchorRef}
      filterStore={filterStore}
      highlightedItem={highlightedItem}
      onHighlightedItemChange={setHighlightedItem}
      onRegisterItem={onRegisterItem}
      onFilterItems={onFilterItems}
      onHighlightMove={onHighlightMove}
      onCustomAnchorAdd={onCustomAnchorAdd}
      onCustomAnchorRemove={onCustomAnchorRemove}
      hasCustomAnchor={hasCustomAnchor}
      multiple={multiple}
      disabled={disabled}
      loop={loop}
      resetOnBlur={resetOnBlur}
      modal={modal}
      dir={dir}
      id={id}
      labelId={labelId}
      contentId={contentId}
    >
      <Primitive.div {...rootProps} ref={composedRef}>
        {children}
        {isFormControl && name && (
          <BubbleInput
            type="hidden"
            control={collectionRef.current}
            name={name}
            value={value}
            disabled={disabled}
            required={required}
          />
        )}
      </Primitive.div>
    </ComboboxProvider>
  );
}

type ComboboxRootComponent = (<Multiple extends boolean = false>(
  props: ComboboxRootProps<Multiple> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement) & { displayName: string };

const ComboboxRoot = forwardRef(ComboboxRootImpl) as ComboboxRootComponent;

ComboboxRoot.displayName = ROOT_NAME;

const Root = ComboboxRoot;

export { ComboboxRoot, Root, useComboboxContext };

export type { ComboboxRootProps };
