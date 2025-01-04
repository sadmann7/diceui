import {
  type Direction,
  type ItemMap,
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

type CollectionItem = HTMLDivElement;
type InputElement = React.ElementRef<typeof MentionInput>;
type ListElement = React.ElementRef<typeof MentionPositioner>;

interface ItemData {
  value: string;
  textValue: string;
  disabled: boolean;
}

const [Collection, useCollection] = createCollection<CollectionItem, ItemData>(
  ROOT_NAME,
);

interface MentionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onItemSelect: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<ListElement | null>;
  triggerCharacter: string;
  onTriggerCharacterChange: (character: string) => void;
  triggerPoint: { top: number; left: number } | null;
  onTriggerPointChange: (point: { top: number; left: number } | null) => void;
  onFilter?: (options: string[], term: string) => string[];
  onFilterItems: () => void;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
  };
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

  /** Whether the mention content is open. */
  open?: boolean;

  /** The default open state. */
  defaultOpen?: boolean;

  /** Event handler called when the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** The current input value. */
  inputValue?: string;

  /** Event handler called when the input value changes. */
  onInputValueChange?: (value: string) => void;

  /** The trigger character to trigger the mention content. */
  triggerCharacter?: string;

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

const MentionRoot = React.forwardRef<CollectionItem, MentionProps>(
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
      dir: dirProp,
      disabled = false,
      onFilter,
      exactMatch = false,
      loop = false,
      modal = false,
      readonly = false,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<CollectionItem | null>(null);
    const listRef = React.useRef<ListElement | null>(null);
    const inputRef = React.useRef<InputElement | null>(null);
    const itemMap = React.useRef<ItemMap<CollectionItem, ItemData>>(
      new Map(),
    ).current;
    const filterStore = React.useRef<MentionContextValue["filterStore"]>({
      search: "",
      itemCount: 0,
      items: new Map<string, number>(),
    }).current;

    // const { getItems } = useCollection({ collectionRef, itemMap });
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
    const [triggerPoint, setTriggerPoint] =
      React.useState<MentionContextValue["triggerPoint"]>(null);
    const [triggerCharacter, setTriggerCharacter] =
      React.useState<MentionContextValue["triggerCharacter"]>("@");

    const onOpenChange = React.useCallback(
      (open: boolean) => {
        setOpen(open);
        if (!open) {
          setTriggerPoint(null);
        }
      },
      [setOpen],
    );

    const onItemSelect = React.useCallback(
      (value: string) => {
        setValue([...value, value]);
        onOpenChange(false);
      },
      [setValue, onOpenChange],
    );

    const onFilterItems = React.useCallback(() => {
      if (!filterStore.search) {
        filterStore.itemCount = itemMap.size;
        return;
      }

      filterStore.items.clear();

      const searchTerm = filterStore.search;
      let itemCount = 0;
      let pendingBatch: [React.RefObject<CollectionItem | null>, ItemData][] =
        [];
      const BATCH_SIZE = 250;

      function processBatch() {
        if (!pendingBatch.length) return;

        const scores = new Map<
          React.RefObject<CollectionItem | null>,
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

    return (
      <MentionProvider
        open={open}
        onOpenChange={onOpenChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        value={value}
        onValueChange={setValue}
        onItemSelect={onItemSelect}
        triggerPoint={triggerPoint}
        onTriggerPointChange={setTriggerPoint}
        onFilter={onFilter}
        onFilterItems={onFilterItems}
        filterStore={filterStore}
        inputRef={inputRef}
        listRef={listRef}
        triggerCharacter={triggerCharacter}
        onTriggerCharacterChange={setTriggerCharacter}
        dir={dir}
        disabled={disabled}
        exactMatch={exactMatch}
        loop={loop}
        modal={modal}
        readonly={readonly}
        inputId={inputId}
        labelId={labelId}
        contentId={contentId}
      >
        <Collection.Provider collectionRef={collectionRef} itemMap={itemMap}>
          <Primitive.div
            ref={composeRefs(forwardedRef, collectionRef)}
            {...rootProps}
          >
            {children}
          </Primitive.div>
        </Collection.Provider>
      </MentionProvider>
    );
  },
);

MentionRoot.displayName = ROOT_NAME;

const Root = MentionRoot;

const CollectionItem = Collection.ItemSlot;

export { CollectionItem, MentionRoot, Root, getDataState, useMentionContext };

export type { MentionContextValue, MentionProps };