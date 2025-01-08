import {
  BubbleInput,
  type CollectionItem,
  type Direction,
  type HighlightingDirection,
  Primitive,
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
import * as React from "react";
import type { AnchorElement, ComboboxAnchor } from "./combobox-anchor";
import type { ComboboxContent, ContentElement } from "./combobox-content";
import type { ComboboxInput, InputElement } from "./combobox-input";
import type { ItemElement } from "./combobox-item";

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

const ROOT_NAME = "ComboboxRoot";

type Value<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string;

type CollectionElement = React.ElementRef<typeof Primitive.div>;

interface ItemData {
  label: string;
  value: string;
  disabled?: boolean;
}

interface ComboboxContextValue<Multiple extends boolean = false> {
  value: Value<Multiple>;
  onValueChange: (value: Value<Multiple>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedText: string;
  onSelectedTextChange: (value: string) => void;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
    groups: Map<string, Set<string>>;
  };
  onFilter?: (options: string[], term: string) => string[];
  highlightedItem: CollectionItem<ItemElement, ItemData> | null;
  onHighlightedItemChange: (
    item: CollectionItem<ItemElement, ItemData> | null,
  ) => void;
  highlightedBadgeIndex: number;
  onHighlightedBadgeIndexChange: (index: number) => void;
  onItemRegister: (
    item: CollectionItem<ItemElement, ItemData>,
    groupId?: string,
  ) => () => void;
  onItemRemove: (value: string) => void;
  onFilterItems: () => void;
  onHighlightMove: (direction: HighlightingDirection) => void;
  hasAnchor: boolean;
  onHasAnchorChange: (value: boolean) => void;
  disabled: boolean;
  loop: boolean;
  manualFiltering: boolean;
  modal: boolean;
  multiple: Multiple;
  openOnFocus: boolean;
  preserveInputOnBlur: boolean;
  readOnly: boolean;
  dir: Direction;
  collectionRef: React.RefObject<CollectionElement | null>;
  listRef: React.RefObject<ContentElement | null>;
  inputRef: React.RefObject<InputElement | null>;
  anchorRef: React.RefObject<AnchorElement | null>;
  inputId: string;
  labelId: string;
  listId: string;
}

const [ComboboxProvider, useComboboxContext] =
  createContext<ComboboxContextValue<boolean>>(ROOT_NAME);

interface ComboboxRootProps<Multiple extends boolean = false>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange"
  > {
  /**
   * The current value of the combobox.
   *
   * - When multiple is false: `string`
   * - When multiple is true: `string[]`
   */
  value?: Value<Multiple>;

  /**
   * The default value of the combobox.
   *
   * - When multiple is false: `string`
   * - When multiple is true: `string[]`
   */
  defaultValue?: Value<Multiple>;

  /**
   * Event handler called when the value changes.
   *
   * - When multiple is false: `(value: string) => void`
   * - When multiple is true: `(value: string[]) => void`
   */
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
   *
   * Can be used to prevent the default filtering behavior.
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
   * Whether the combobox uses exact string matching or fuzzy matching.
   *
   * When `manualFiltering` is true, this prop is ignored.
   * When `onFilter` is provided, the combobox will use the provided filter function instead.
   *
   * @default false
   */
  exactMatch?: boolean;

  /**
   * Whether the combobox should filter items externally.
   * @default true
   */
  manualFiltering?: boolean;

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
   *
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
  forwardedRef: React.ForwardedRef<CollectionElement>,
) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange: onValueChangeProp,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    inputValue: inputValueProp,
    onInputValueChange,
    onFilter,
    disabled = false,
    exactMatch = false,
    manualFiltering = false,
    loop = false,
    modal = false,
    multiple = false,
    openOnFocus = false,
    preserveInputOnBlur = false,
    readOnly = false,
    required = false,
    dir: dirProp,
    name,
    children,
    ...rootProps
  } = props;

  const inputRef = React.useRef<InputElement | null>(null);
  const listRef = React.useRef<ContentElement | null>(null);
  const filterStore = React.useRef<ComboboxContextValue["filterStore"]>({
    search: "",
    itemCount: 0,
    items: new Map<string, number>(),
    groups: new Map<string, Set<string>>(),
  }).current;

  const inputId = useId();
  const labelId = useId();
  const listId = useId();

  const dir = useDirection(dirProp);
  const { collectionRef, getItems, itemMap, groupMap, onItemRegister } =
    useCollection<CollectionElement, ItemData>({
      grouped: true,
    });
  const { anchorRef, hasAnchor, onHasAnchorChange } =
    useAnchor<AnchorElement>();
  const { isFormControl, onTriggerChange } =
    useFormControl<CollectionElement>();
  const composedRef = useComposedRefs(forwardedRef, collectionRef, (node) =>
    onTriggerChange(node),
  );

  const [value = multiple ? ([] as string[]) : "", setValue] =
    useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChangeProp,
    });
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: (newOpen) => {
      if (!newOpen) {
        filterStore.search = "";
      }
      onOpenChange?.(newOpen);
      if (multiple) setHighlightedBadgeIndex(-1);
    },
  });
  const [inputValue = "", setInputValue] = useControllableState({
    prop: inputValueProp,
    onChange: (value) => {
      if (disabled || readOnly) return;
      onInputValueChange?.(value);
    },
  });
  const [selectedText, setSelectedText] = React.useState("");
  const [highlightedItem, setHighlightedItem] = React.useState<CollectionItem<
    ItemElement,
    ItemData
  > | null>(null);
  const [highlightedBadgeIndex, setHighlightedBadgeIndex] = React.useState(-1);

  const onValueChange = React.useCallback(
    (newValue: string | string[]) => {
      if (disabled || readOnly) return;

      if (multiple) {
        const currentValue = Array.isArray(value) ? value : [];
        const typedNewValue = typeof newValue === "string" ? newValue : "";
        if (!typedNewValue) return;
        const newValues = currentValue.includes(typedNewValue)
          ? currentValue.filter((v) => v !== newValue)
          : [...currentValue, newValue];
        setValue(newValues as Value<Multiple>);
        return;
      }

      setValue(newValue as Value<Multiple>);
    },
    [multiple, setValue, value, disabled, readOnly],
  );

  const onItemRemove = React.useCallback(
    (currentValue: string) => {
      const newValues = Array.isArray(value)
        ? value.filter((v) => v !== currentValue)
        : [];
      setValue(newValues as Value<Multiple>);
    },
    [setValue, value],
  );

  const filter = useFilter({ sensitivity: "base", gapMatch: true });
  const currentFilter = React.useMemo(
    () => (exactMatch ? filter.contains : filter.fuzzy),
    [filter.fuzzy, filter.contains, exactMatch],
  );

  const getItemScore = React.useCallback(
    (value: string, searchTerm: string) => {
      if (!searchTerm) return 1;
      if (!value) return 0;

      if (searchTerm === "") return 1;
      if (value === searchTerm) return 2;
      if (value.startsWith(searchTerm)) return 1.5;

      return onFilter
        ? Number(onFilter([value], searchTerm).length > 0)
        : Number(currentFilter(value, searchTerm));
    },
    [currentFilter, onFilter],
  );

  const onFilterItems = React.useCallback(() => {
    if (!filterStore.search || manualFiltering) {
      filterStore.itemCount = itemMap.size;
      return;
    }

    filterStore.groups.clear();
    filterStore.items.clear();

    const searchTerm = filterStore.search;
    let itemCount = 0;
    let pendingBatch: [React.RefObject<ItemElement | null>, ItemData][] = [];
    const BATCH_SIZE = 250;

    function processBatch() {
      if (!pendingBatch.length) return;

      const scores = new Map<
        React.RefObject<CollectionElement | null>,
        number
      >();

      for (const [ref, item] of pendingBatch) {
        const score = getItemScore(item.value, searchTerm);
        if (score > 0) {
          scores.set(ref, score);
          itemCount++;
        }
      }

      // Sort by score in descending order and add to filterStore
      const sortedScores = Array.from(scores.entries()).sort(
        ([, a], [, b]) => b - a,
      );

      for (const [ref, score] of sortedScores) {
        filterStore.items.set(ref.current?.id ?? "", score);
      }

      pendingBatch = [];
    }

    // Process items in batches
    for (const [ref, item] of itemMap) {
      pendingBatch.push([ref, item]);

      if (pendingBatch.length >= BATCH_SIZE) {
        processBatch();
      }
    }

    // Process remaining items
    if (pendingBatch.length > 0) {
      processBatch();
    }

    filterStore.itemCount = itemCount;

    // Update groups if needed
    if (groupMap?.size && itemCount > 0) {
      const matchingItems = new Set(filterStore.items.keys());

      for (const [groupId, group] of groupMap) {
        const hasMatchingItem = Array.from(group).some((ref) =>
          matchingItems.has(ref.current?.id ?? ""),
        );

        if (hasMatchingItem) {
          filterStore.groups.set(groupId, new Set());
        }
      }
    }
  }, [manualFiltering, filterStore, itemMap, groupMap, getItemScore]);

  const onHighlightMove = React.useCallback(
    (direction: HighlightingDirection) => {
      const items = getItems().filter((item) => !item.disabled);
      if (!items.length) return;

      const currentIndex = items.findIndex(
        (item) => item.ref.current === highlightedItem?.ref.current,
      );
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
          nextIndex = items.findIndex((item) => item.value === selectedValue);

          if (nextIndex === -1) nextIndex = 0;
          break;
        }
      }

      const nextItem = items[nextIndex];
      if (nextItem?.ref.current) {
        nextItem.ref.current.scrollIntoView({ block: "nearest" });
        setHighlightedItem(nextItem);
      }
    },
    [loop, highlightedItem, getItems, value],
  );

  return (
    <ComboboxProvider
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      selectedText={selectedText}
      onSelectedTextChange={setSelectedText}
      filterStore={filterStore}
      onFilter={onFilter}
      onFilterItems={onFilterItems}
      highlightedItem={highlightedItem}
      onHighlightedItemChange={setHighlightedItem}
      highlightedBadgeIndex={highlightedBadgeIndex}
      onHighlightedBadgeIndexChange={setHighlightedBadgeIndex}
      onItemRegister={onItemRegister}
      onItemRemove={onItemRemove}
      onHighlightMove={onHighlightMove}
      hasAnchor={hasAnchor}
      onHasAnchorChange={onHasAnchorChange}
      disabled={disabled}
      loop={loop}
      manualFiltering={manualFiltering}
      modal={modal}
      multiple={multiple}
      openOnFocus={openOnFocus}
      preserveInputOnBlur={preserveInputOnBlur}
      readOnly={readOnly}
      collectionRef={collectionRef}
      listRef={listRef}
      inputRef={inputRef}
      anchorRef={anchorRef}
      dir={dir}
      inputId={inputId}
      labelId={labelId}
      listId={listId}
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
            readOnly={readOnly}
            required={required}
          />
        )}
      </Primitive.div>
    </ComboboxProvider>
  );
}

type ComboboxRootComponent = (<Multiple extends boolean = false>(
  props: ComboboxRootProps<Multiple> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement) &
  Pick<React.FC<ComboboxRootProps<boolean>>, "displayName">;

const ComboboxRoot = forwardRef(ComboboxRootImpl) as ComboboxRootComponent;

ComboboxRoot.displayName = ROOT_NAME;

const Root = ComboboxRoot;

export { ComboboxRoot, Root, getDataState, useComboboxContext };

export type { ComboboxRootProps };
