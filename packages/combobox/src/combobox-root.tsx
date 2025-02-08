import {
  type CollectionItem,
  type Direction,
  type FilterStore,
  type HighlightingDirection,
  Primitive,
  VisuallyHiddenInput,
  createContext,
  forwardRef,
  useAnchor,
  useCollection,
  useComposedRefs,
  useControllableState,
  useDirection,
  useFilterStore,
  useFormControl,
  useId,
  useListHighlighting,
} from "@diceui/shared";
import * as React from "react";
import type { AnchorElement } from "./combobox-anchor";
import type { ContentElement } from "./combobox-content";
import type { InputElement } from "./combobox-input";
import type { ItemElement } from "./combobox-item";

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

const ROOT_NAME = "ComboboxRoot";

type Value<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string;

interface ItemData {
  label: string;
  value: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

type RootElement = React.ElementRef<typeof Primitive.div>;

interface ComboboxContextValue<Multiple extends boolean = false> {
  value: Value<Multiple>;
  onValueChange: (value: Value<Multiple>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedText: string;
  onSelectedTextChange: (value: string) => void;
  filterStore: FilterStore;
  onFilter?: (options: string[], term: string) => string[];
  onItemsFilter: () => void;
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
  onHighlightMove: (direction: HighlightingDirection) => void;
  getIsItemVisible: (value: string) => boolean;
  getIsListEmpty: (manual?: boolean) => boolean;
  hasAnchor: boolean;
  onHasAnchorChange: (value: boolean) => void;
  hasBadgeList: boolean;
  onHasBadgeListChange: (value: boolean) => void;
  autoHighlight: boolean;
  disabled: boolean;
  loop: boolean;
  manualFiltering: boolean;
  modal: boolean;
  multiple: Multiple;
  openOnFocus: boolean;
  preserveInputOnBlur: boolean;
  readOnly: boolean;
  dir: Direction;
  collectionRef: React.RefObject<ItemElement | null>;
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

  /**
   * Whether to automatically highlight the first visible item when filtering.
   * @default false
   */
  autoHighlight?: boolean;

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

  /** The name of the combobox for form submission. */
  name?: string;
}

function ComboboxRootImpl<Multiple extends boolean = false>(
  props: ComboboxRootProps<Multiple>,
  forwardedRef: React.ForwardedRef<RootElement>,
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
    autoHighlight = false,
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

  const inputId = useId();
  const labelId = useId();
  const listId = useId();

  const dir = useDirection(dirProp);
  const { collectionRef, getItems, itemMap, groupMap, onItemRegister } =
    useCollection<ItemElement, ItemData>({
      grouped: true,
    });
  const { anchorRef, hasAnchor, onHasAnchorChange } =
    useAnchor<AnchorElement>();
  const { isFormControl, onTriggerChange } = useFormControl<RootElement>();
  const composedRef = useComposedRefs(forwardedRef, collectionRef, (node) =>
    onTriggerChange(node),
  );

  const [selectedText, setSelectedText] = React.useState("");
  const [highlightedItem, setHighlightedItem] = React.useState<CollectionItem<
    ItemElement,
    ItemData
  > | null>(null);
  const [highlightedBadgeIndex, setHighlightedBadgeIndex] = React.useState(-1);
  const [hasBadgeList, setHasBadgeList] = React.useState(false);

  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: (newOpen) => {
      if (!newOpen) {
        filterStore.search = "";
      }
      onOpenChange?.(newOpen);
      if (multiple) {
        setHighlightedBadgeIndex(-1);
        return;
      }
      if (defaultValue && !Array.isArray(defaultValue) && selectedText === "") {
        setSelectedText(defaultValue);
      }
    },
  });
  const [value = multiple ? ([] as string[]) : "", setValue] =
    useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChangeProp,
    });
  const [inputValue = "", setInputValue] = useControllableState({
    defaultProp: !multiple && defaultValue ? String(defaultValue) : "",
    prop: inputValueProp,
    onChange: (payload) => {
      if (disabled || readOnly) return;
      onInputValueChange?.(payload);
      if (autoHighlight && open) {
        onHighlightMove("first");
      }
    },
  });

  const { filterStore, onItemsFilter, getIsItemVisible, getIsListEmpty } =
    useFilterStore({
      itemMap,
      groupMap,
      onFilter,
      exactMatch,
      manualFiltering,
    });

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

  const { onHighlightMove } = useListHighlighting({
    highlightedItem,
    onHighlightedItemChange: setHighlightedItem,
    getItems: React.useCallback(() => {
      return getItems().filter(
        (item) => !item.disabled && getIsItemVisible(item.value),
      );
    }, [getItems, getIsItemVisible]),
    getIsItemSelected: (item) => {
      const selectedValue = Array.isArray(value) ? value[0] : value;
      return item.value === selectedValue;
    },
    loop,
  });

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
      onItemsFilter={onItemsFilter}
      highlightedItem={highlightedItem}
      onHighlightedItemChange={setHighlightedItem}
      highlightedBadgeIndex={highlightedBadgeIndex}
      onHighlightedBadgeIndexChange={setHighlightedBadgeIndex}
      onItemRegister={onItemRegister}
      onItemRemove={onItemRemove}
      onHighlightMove={onHighlightMove}
      getIsItemVisible={getIsItemVisible}
      getIsListEmpty={getIsListEmpty}
      hasAnchor={hasAnchor}
      onHasAnchorChange={onHasAnchorChange}
      hasBadgeList={hasBadgeList}
      onHasBadgeListChange={setHasBadgeList}
      autoHighlight={autoHighlight}
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
          <VisuallyHiddenInput
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
