import {
  BubbleInput,
  DATA_VALUE_ATTR,
  type Direction,
  createContext,
  forwardRef,
  getSortedItems,
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
import type { ComboboxAnchor } from "./combobox-anchor";
import type { ComboboxInput } from "./combobox-input";
import type { ComboboxItem } from "./combobox-item";
import type { ComboboxPositioner } from "./combobox-positioner";

const ROOT_NAME = "ComboboxRoot";

type Value<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string;

type HighlightingDirection = "next" | "prev" | "first" | "last" | "selected";

type CollectionElement = React.ElementRef<typeof Primitive.div>;
type PositionerElement = React.ElementRef<typeof ComboboxPositioner>;
type InputElement = React.ElementRef<typeof ComboboxInput>;
type AnchorElement = React.ElementRef<typeof ComboboxAnchor>;
type ItemElement = React.ElementRef<typeof ComboboxItem>;
interface ComboboxContextValue<Multiple extends boolean = false> {
  value: Value<Multiple>;
  onValueChange: (value: Value<Multiple>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedText: string;
  onSelectedTextChange: (value: string) => void;
  onFilter?: (options: string[], term: string) => string[];
  onItemRemove: (value: string) => void;
  collectionRef: React.RefObject<CollectionElement | null>;
  listRef: React.RefObject<PositionerElement | null>;
  inputRef: React.RefObject<InputElement | null>;
  anchorRef: React.RefObject<AnchorElement | null>;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
    groups: Map<string, Set<string>>;
  };
  highlightedItem: ItemElement | null;
  onHighlightedItemChange: (item: ItemElement | null) => void;
  highlightedBadgeIndex: number;
  onHighlightedBadgeIndexChange: (index: number) => void;
  onRegisterItem: (id: string, value: string, groupId?: string) => () => void;
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
  inputId: string;
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

  const collectionRef = React.useRef<CollectionElement | null>(null);
  const listRef = React.useRef<PositionerElement | null>(null);
  const inputRef = React.useRef<InputElement | null>(null);

  const inputId = useId();
  const labelId = useId();
  const contentId = useId();

  const items = React.useRef(new Map<string, string>()).current;
  const groups = React.useRef(new Map<string, Set<string>>()).current;
  const filterStore = React.useRef<ComboboxContextValue["filterStore"]>({
    search: "",
    itemCount: 0,
    items: new Map<string, number>(),
    groups: new Map<string, Set<string>>(),
  }).current;
  const normalizedCache = React.useRef(new Map<string, string>()).current;

  const dir = useDirection(dirProp);
  const { getEnabledItems } = useCollection<CollectionElement>({
    ref: collectionRef,
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
  const [highlightedItem, setHighlightedItem] =
    React.useState<ItemElement | null>(null);
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

  const normalizeString = React.useCallback(
    (str: string) => {
      if (!str) return "";
      if (typeof str !== "string") return "";

      const cacheKey = str;
      let normalized = normalizedCache.get(cacheKey);
      if (normalized !== undefined) return normalized;

      const SEPARATORS_PATTERN = /[-_\s./\\|:;,]+/g;
      const UNWANTED_CHARS = /[^\p{L}\p{N}\s]/gu;

      try {
        normalized = str
          .toLowerCase()
          .replace(UNWANTED_CHARS, " ")
          .replace(SEPARATORS_PATTERN, " ")
          .trim();

        if (normalized !== str.toLowerCase()) {
          normalizedCache.set(cacheKey, normalized);
        }

        return normalized;
      } catch (_err) {
        normalized = str
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        normalizedCache.set(cacheKey, normalized);
        return normalized;
      }
    },
    [normalizedCache],
  );

  const filter = useFilter({ sensitivity: "base" });
  const currentFilter = React.useMemo(
    () => (exactMatch ? filter.contains : filter.fuzzy),
    [filter.fuzzy, filter.contains, exactMatch],
  );

  const getItemScore = React.useCallback(
    (value: string, searchTerm: string) => {
      if (!searchTerm) return 1;
      if (!value) return 0;

      const normalizedValue = normalizeString(value);
      const normalizedSearch = normalizeString(searchTerm);

      if (normalizedSearch === "") return 1;
      if (normalizedValue === normalizedSearch) return 2;
      if (normalizedValue.startsWith(normalizedSearch)) return 1.5;

      return onFilter
        ? Number(onFilter([value], searchTerm).length > 0)
        : Number(currentFilter(normalizedValue, normalizedSearch));
    },
    [currentFilter, normalizeString, onFilter],
  );

  const onFilterItems = React.useCallback(() => {
    if (!filterStore.search || manualFiltering) {
      filterStore.itemCount = items.size;
      return;
    }

    filterStore.groups.clear();
    filterStore.items.clear();

    const searchTerm = filterStore.search;
    let itemCount = 0;
    let pendingBatch: [string, string][] = [];
    const BATCH_SIZE = 250;

    function processBatch() {
      if (!pendingBatch.length) return;

      const scores = new Map<string, number>();

      for (const [id, value] of pendingBatch) {
        const score = getItemScore(value, searchTerm);
        if (score > 0) {
          scores.set(id, score);
          itemCount++;
        }
      }

      // Sort by score in descending order and add to filterStore
      const sortedScores = Array.from(scores.entries()).sort(
        ([, a], [, b]) => b - a,
      );

      for (const [id, score] of sortedScores) {
        filterStore.items.set(id, score);
      }

      pendingBatch = [];
    }

    // Process items in batches
    for (const [id, value] of items) {
      pendingBatch.push([id, value]);

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
    if (groups.size && itemCount > 0) {
      const matchingItems = new Set(filterStore.items.keys());

      for (const [groupId, group] of groups) {
        const hasMatchingItem = Array.from(group).some((itemId) =>
          matchingItems.has(itemId),
        );

        if (hasMatchingItem) {
          filterStore.groups.set(groupId, new Set());
        }
      }
    }
  }, [manualFiltering, filterStore, items, groups, getItemScore]);

  const onHighlightMove = React.useCallback(
    (direction: HighlightingDirection) => {
      const items = getEnabledItems();
      if (!items.length) return;

      const currentIndex = items.indexOf(highlightedItem as ItemElement);
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
          const selectedValue = Array.isArray(value)
            ? getSortedItems(items, value)[0]
            : value;
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
      onOpenChange={setOpen}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
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
      highlightedBadgeIndex={highlightedBadgeIndex}
      onHighlightedBadgeIndexChange={setHighlightedBadgeIndex}
      onRegisterItem={onRegisterItem}
      onFilterItems={onFilterItems}
      onHighlightMove={onHighlightMove}
      onItemRemove={onItemRemove}
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
      dir={dir}
      inputId={inputId}
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

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

type ComboboxRootComponent = (<Multiple extends boolean = false>(
  props: ComboboxRootProps<Multiple> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement) &
  Pick<React.FC<ComboboxRootProps<boolean>>, "displayName">;

const ComboboxRoot = forwardRef(ComboboxRootImpl) as ComboboxRootComponent;

ComboboxRoot.displayName = ROOT_NAME;

const Root = ComboboxRoot;

export { ComboboxRoot, Root, getDataState, useComboboxContext };

export type { ComboboxRootProps, HighlightingDirection };
