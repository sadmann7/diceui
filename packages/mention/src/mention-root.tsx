import {
  type CollectionItem,
  type CollectionItemMap,
  type Direction,
  type HighlightingDirection,
  Primitive,
  composeRefs,
  createCollection,
  createContext,
  useControllableState,
  useDirection,
  useFilter,
  useId,
} from "@diceui/shared";
import * as React from "react";
import type { MentionInput } from "./mention-input";
import type { MentionPositioner } from "./mention-positioner";

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

const ROOT_NAME = "MentionRoot";

type CollectionElement = HTMLDivElement;
type InputElement = React.ElementRef<typeof MentionInput>;
type ListElement = React.ElementRef<typeof MentionPositioner>;

interface ItemData {
  value: string;
  textValue: string;
  disabled: boolean;
}

const [{ Provider, ItemSlot }, useCollection] = createCollection<
  CollectionElement,
  ItemData
>(ROOT_NAME);

interface MentionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<ListElement | null>;
  trigger: string;
  onTriggerChange: (character: string) => void;
  triggerPoint: { top: number; left: number } | null;
  onTriggerPointChange: (point: { top: number; left: number } | null) => void;
  onFilter?: (options: string[], term: string) => string[];
  onFilterItems: () => void;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
  };
  highlightedItem: CollectionItem<CollectionElement, ItemData> | null;
  onHighlightedItemChange: (
    item: CollectionItem<CollectionElement, ItemData> | null,
  ) => void;
  onHighlightMove: (direction: HighlightingDirection) => void;
  dir: Direction;
  disabled: boolean;
  exactMatch: boolean;
  loop: boolean;
  modal: boolean;
  readonly: boolean;
  inputId: string;
  labelId: string;
  contentId: string;
}

const [MentionProvider, useMentionContext] =
  createContext<MentionContextValue>(ROOT_NAME);

interface MentionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue"
  > {
  /** The currently selected value. */
  value?: string[];

  /** The default selected value. */
  defaultValue?: string[];

  /** Event handler called when a mention item is selected. */
  onValueChange?: (value: string[]) => void;

  /** Whether the mention menu is open. */
  open?: boolean;

  /** The default open state. */
  defaultOpen?: boolean;

  /** Event handler called when the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** The current input value. */
  inputValue?: string;

  /** Event handler called when the input value changes. */
  onInputValueChange?: (value: string) => void;

  /** The character that activates the mention menu when typed. */
  trigger?: string;

  /** The direction the mention should open. */
  dir?: Direction;

  /** Whether the mention is disabled. */
  disabled?: boolean;

  /**
   * Event handler called when the filter is applied.
   * Can be used to prevent the default filtering behavior.
   */
  onFilter?: (options: string[], term: string) => string[];

  /**
   * Whether the mention uses exact string matching or fuzzy matching.
   * When onFilter is provided, this prop is ignored.
   * @default false
   */
  exactMatch?: boolean;

  /**
   * Whether the mention loops through items.
   * @default false
   */
  loop?: boolean;

  /**
   * Whether the mention is modal.
   * @default false
   */
  modal?: boolean;

  /**
   * Whether the mention is read-only.
   * @default false
   */
  readonly?: boolean;
}

const MentionRoot = React.forwardRef<CollectionElement, MentionProps>(
  (props, forwardedRef) => {
    const {
      children,
      open: openProp,
      defaultOpen = false,
      onOpenChange: onOpenChangeProp,
      inputValue: inputValueProp,
      onInputValueChange,
      value: valueProp,
      defaultValue,
      onValueChange,
      trigger: triggerProp = "@",
      dir: dirProp,
      disabled = false,
      onFilter,
      exactMatch = false,
      loop = false,
      modal = false,
      readonly = false,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<CollectionElement | null>(null);
    const listRef = React.useRef<ListElement | null>(null);
    const inputRef = React.useRef<InputElement | null>(null);
    const itemMap = React.useRef<
      CollectionItemMap<CollectionElement, ItemData>
    >(new Map()).current;
    const filterStore = React.useRef<MentionContextValue["filterStore"]>({
      search: "",
      itemCount: 0,
      items: new Map<string, number>(),
    }).current;

    const { getItems } = useCollection({ collectionRef, itemMap });
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

    const inputId = useId();
    const labelId = useId();
    const contentId = useId();

    const dir = useDirection(dirProp);
    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChangeProp,
    });
    const [inputValue = "", setInputValue] = useControllableState({
      prop: inputValueProp,
      defaultProp: "",
      onChange: onInputValueChange,
    });
    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });
    const [trigger, setTrigger] =
      React.useState<MentionContextValue["trigger"]>(triggerProp);
    const [triggerPoint, setTriggerPoint] =
      React.useState<MentionContextValue["triggerPoint"]>(null);

    const onOpenChange = React.useCallback(
      (open: boolean) => {
        setOpen(open);
        if (!open) {
          setTriggerPoint(null);
        }
      },
      [setOpen],
    );

    const onFilterItems = React.useCallback(() => {
      if (!filterStore.search) {
        filterStore.itemCount = itemMap.size;
        return;
      }

      filterStore.items.clear();

      const searchTerm = filterStore.search;
      let itemCount = 0;
      let pendingBatch: [
        React.RefObject<CollectionElement | null>,
        ItemData,
      ][] = [];
      const BATCH_SIZE = 250;

      function processBatch() {
        if (!pendingBatch.length) return;

        const scores = new Map<
          React.RefObject<CollectionElement | null>,
          number
        >();

        for (const [ref, data] of pendingBatch) {
          const score = getItemScore(data.value, searchTerm);
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
      for (const [ref, data] of itemMap.entries()) {
        pendingBatch.push([ref, data]);

        if (pendingBatch.length >= BATCH_SIZE) {
          processBatch();
        }
      }

      // Process remaining items
      if (pendingBatch.length > 0) {
        processBatch();
      }

      filterStore.itemCount = itemCount;
    }, [filterStore, itemMap, getItemScore]);

    const [highlightedItem, setHighlightedItem] = React.useState<CollectionItem<
      CollectionElement,
      ItemData
    > | null>(null);

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
          case "selected":
            nextIndex = items.findIndex((item) => value.includes(item.value));
            if (nextIndex === -1) nextIndex = 0;
            break;
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
      <MentionProvider
        open={open}
        onOpenChange={onOpenChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        value={value}
        onValueChange={setValue}
        triggerPoint={triggerPoint}
        onTriggerPointChange={setTriggerPoint}
        onFilter={onFilter}
        onFilterItems={onFilterItems}
        filterStore={filterStore}
        inputRef={inputRef}
        listRef={listRef}
        trigger={trigger}
        onTriggerChange={setTrigger}
        dir={dir}
        disabled={disabled}
        exactMatch={exactMatch}
        loop={loop}
        modal={modal}
        readonly={readonly}
        inputId={inputId}
        labelId={labelId}
        contentId={contentId}
        highlightedItem={highlightedItem}
        onHighlightedItemChange={setHighlightedItem}
        onHighlightMove={onHighlightMove}
      >
        <Provider collectionRef={collectionRef} itemMap={itemMap}>
          <Primitive.div
            ref={composeRefs(forwardedRef, collectionRef)}
            {...rootProps}
          >
            {children}
          </Primitive.div>
        </Provider>
      </MentionProvider>
    );
  },
);

MentionRoot.displayName = ROOT_NAME;

const Root = MentionRoot;

export { ItemSlot, MentionRoot, Root, getDataState, useMentionContext };

export type { MentionContextValue, MentionProps };
