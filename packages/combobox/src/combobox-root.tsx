import {
  BubbleInput,
  DATA_VALUE_ATTR,
  type Direction,
  createContext,
  forwardRef,
  useAnchor,
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

type Value<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string;

type HighlightingDirection = "next" | "prev" | "first" | "last" | "selected";

interface ComboboxContextValue<Multiple extends boolean = false> {
  value: Value<Multiple>;
  onValueChange: (value: Value<Multiple>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => Promise<void>;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedText: string;
  onSelectedTextChange: (value: string) => void;
  onFilter?: (options: string[], term: string) => string[];
  collectionRef: React.RefObject<HTMLDivElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
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
  onHighlightMove: (target: HighlightingDirection) => void;
  onCustomAnchorAdd: () => void;
  onCustomAnchorRemove: () => void;
  disabled: boolean;
  hasCustomAnchor: boolean;
  loop: boolean;
  modal: boolean;
  multiple: Multiple;
  openOnFocus: boolean;
  readOnly: boolean;
  dir: Direction;
  id: string;
  labelId: string;
  contentId: string;
  preserveInputOnBlur: boolean;
}

const [ComboboxProvider, useComboboxContext] =
  createContext<ComboboxContextValue<boolean>>(ROOT_NAME);

interface ComboboxRootProps<Multiple extends boolean = false>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange"
  > {
  /** The current value of the combobox. */
  value?: Value<Multiple>;

  /** The default value of the combobox. */
  defaultValue?: Value<Multiple>;

  /** Event handler called when the value changes. */
  onValueChange?: (value: Value<Multiple>) => void;

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

  /**
   * The reading direction of the combobox.
   * @default "ltr"
   */
  dir?: Direction;

  /** Whether the combobox is disabled. */
  disabled?: boolean;

  /**
   * Whether the combobox uses fuzzy filtering.
   * @default true
   */
  fuzzy?: boolean;

  /**
   * Whether the combobox loops through items.
   * @default false
   */
  loop?: boolean;

  /**
   * Whether the combobox is modal.
   * @default false
   */
  modal?: boolean;

  /**
   * Whether the combobox allows multiple values.
   * @default false
   */
  multiple?: Multiple;

  /**
   * Whether the combobox opens on input focus.
   * @default false
   */
  openOnFocus?: boolean;

  /**
   * Whether to preserve the input value when the input is blurred and no item is selected.
   * Only applicable when items are not selected.
   * @default false
   */
  preserveInputOnBlur?: boolean;

  /**
   * Whether the combobox is read-only.
   * @default false
   */
  readOnly?: boolean;

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
    onInputValueChange: onInputValueChangeProp,
    onFilter,
    multiple = false,
    disabled = false,
    fuzzy = true,
    loop = false,
    modal = false,
    openOnFocus = false,
    preserveInputOnBlur = false,
    readOnly = false,
    required = false,
    dir: dirProp,
    name,
    children,
    ...rootProps
  } = props;

  const collectionRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const id = useId();
  const labelId = `${id}label`;
  const contentId = `${id}content`;

  const dir = useDirection(dirProp);
  const {
    anchorRef,
    hasCustomAnchor,
    onCustomAnchorAdd,
    onCustomAnchorRemove,
  } = useAnchor<HTMLDivElement>();
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
    onChange: (value) => {
      if (!readOnly) {
        onInputValueChangeProp?.(value);
      }
    },
  });
  const [selectedText, setSelectedText] = React.useState("");
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
      filterStore.search = "";
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
    [setOpen, filterStore],
  );

  const onInputValueChange = React.useCallback(
    (value: string) => {
      if (!readOnly) {
        setInputValue(value);
      }
    },
    [readOnly, setInputValue],
  );

  const onValueChange = React.useCallback(
    (newValue: string | string[]) => {
      if (readOnly) return;

      if (multiple) {
        const currentValue = Array.isArray(value) ? value : [];
        const typedNewValue = typeof newValue === "string" ? newValue : "";
        const newValues = currentValue.includes(typedNewValue)
          ? currentValue.filter((v) => v !== newValue)
          : [...currentValue, newValue];
        setValue(newValues as Value<Multiple>);
        return;
      }

      setValue(newValue as Value<Multiple>);
    },
    [multiple, setValue, value, readOnly],
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
    (direction: HighlightingDirection) => {
      const items = getEnabledItems();
      if (!items.length) return;

      const currentIndex = items.indexOf(highlightedItem as HTMLElement);
      let nextIndex: number;

      switch (direction) {
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
            (item) => item.getAttribute(DATA_VALUE_ATTR) === selectedValue,
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

  return (
    <ComboboxProvider
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={onOpenChange}
      inputValue={inputValue}
      onInputValueChange={onInputValueChange}
      selectedText={selectedText}
      onSelectedTextChange={setSelectedText}
      onFilter={onFilter}
      collectionRef={collectionRef}
      listRef={listRef}
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
      disabled={disabled}
      hasCustomAnchor={hasCustomAnchor}
      loop={loop}
      modal={modal}
      multiple={multiple}
      openOnFocus={openOnFocus}
      preserveInputOnBlur={preserveInputOnBlur}
      readOnly={readOnly}
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

export type { ComboboxRootProps, HighlightingDirection };
