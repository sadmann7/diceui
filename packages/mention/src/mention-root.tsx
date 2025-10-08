import {
  type CollectionItem,
  composeRefs,
  createContext,
  type Direction,
  type HighlightingDirection,
  Primitive,
  useCollection,
  useControllableState,
  useDirection,
  useFilterStore,
  useFormControl,
  useId,
  useListHighlighting,
  VisuallyHiddenInput,
} from "@diceui/shared";
import type { VirtualElement } from "@floating-ui/react";
import * as React from "react";
import type { ContentElement } from "./mention-content";
import type { InputElement } from "./mention-input";
import type { ItemElement } from "./mention-item";

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

const ROOT_NAME = "MentionRoot";

type RootElement = React.ElementRef<typeof Primitive.div>;

interface ItemData {
  label: string;
  value: string;
  disabled: boolean;
}

interface Mention extends Omit<ItemData, "label" | "disabled"> {
  start: number;
  end: number;
}

interface MentionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  virtualAnchor: VirtualElement | null;
  onVirtualAnchorChange: (element: VirtualElement | null) => void;
  trigger: string;
  onTriggerChange: (character: string) => void;
  getEnabledItems: () => CollectionItem<ItemElement, ItemData>[];
  onItemRegister: (item: CollectionItem<ItemElement, ItemData>) => void;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
  };
  onFilter?: (options: string[], term: string) => string[];
  onItemsFilter: () => void;
  getIsItemVisible: (value: string) => boolean;
  highlightedItem: CollectionItem<ItemElement, ItemData> | null;
  onHighlightedItemChange: (
    item: CollectionItem<ItemElement, ItemData> | null,
  ) => void;
  onHighlightMove: (direction: HighlightingDirection) => void;
  mentions: Mention[];
  onMentionsChange: React.Dispatch<React.SetStateAction<Mention[]>>;
  onMentionAdd: (value: string, triggerIndex: number) => void;
  onMentionsRemove: (mentionsToRemove: Mention[]) => void;
  isPasting: boolean;
  onIsPastingChange: (isPasting: boolean) => void;
  dir: Direction;
  disabled: boolean;
  exactMatch: boolean;
  loop: boolean;
  modal: boolean;
  readonly: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<ContentElement | null>;
  inputId: string;
  labelId: string;
  listId: string;
}

const [MentionProvider, useMentionContext] =
  createContext<MentionContextValue>(ROOT_NAME);

interface MentionRootProps
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

  /**
   * Whether the mention is required in a form context.
   * @default false
   */
  required?: boolean;

  /** The name of the mention for form submission. */
  name?: string;
}

const MentionRoot = React.forwardRef<RootElement, MentionRootProps>(
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
      onFilter,
      trigger: triggerProp = "@",
      dir: dirProp,
      disabled = false,
      exactMatch = false,
      loop = false,
      modal = false,
      readonly = false,
      required = false,
      name,
      ...rootProps
    } = props;

    const listRef = React.useRef<ContentElement | null>(null);
    const inputRef = React.useRef<InputElement | null>(null);

    const inputId = useId();
    const labelId = useId();
    const listId = useId();

    const { collectionRef, itemMap, getItems, onItemRegister } = useCollection<
      ItemElement,
      ItemData
    >();
    const { isFormControl, onTriggerChange } = useFormControl<RootElement>();
    const composedRef = composeRefs(forwardedRef, collectionRef, (node) =>
      onTriggerChange(node),
    );

    const dir = useDirection(dirProp);
    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChangeProp,
    });
    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });
    const [inputValue = "", setInputValue] = useControllableState({
      prop: inputValueProp,
      defaultProp: "",
      onChange: onInputValueChange,
    });
    const [trigger, setTrigger] =
      React.useState<MentionContextValue["trigger"]>(triggerProp);
    const [virtualAnchor, setVirtualAnchor] =
      React.useState<VirtualElement | null>(null);
    const [highlightedItem, setHighlightedItem] = React.useState<CollectionItem<
      ItemElement,
      ItemData
    > | null>(null);
    const [mentions, setMentions] = React.useState<Mention[]>([]);
    const [isPasting, setIsPasting] = React.useState(false);

    const { filterStore, onItemsFilter, getIsItemVisible } = useFilterStore({
      itemMap,
      onFilter,
      exactMatch,
      onCallback: (itemCount) => {
        if (itemCount === 0) {
          // Close the menu if no items match the filter
          setOpen(false);
          setHighlightedItem(null);
          setVirtualAnchor(null);
        }
      },
    });

    const getEnabledItems = React.useCallback(() => {
      return getItems().filter((item) => !item.disabled);
    }, [getItems]);

    const onOpenChange = React.useCallback(
      (open: boolean) => {
        if (open && filterStore.search && filterStore.itemCount === 0) {
          return;
        }
        setOpen(open);
        if (open) {
          requestAnimationFrame(() => {
            const items = getEnabledItems();
            const firstItem = items[0] ?? null;
            setHighlightedItem(firstItem);
          });
        } else {
          setHighlightedItem(null);
          setVirtualAnchor(null);
        }
      },
      [setOpen, getEnabledItems, filterStore],
    );

    const { onHighlightMove } = useListHighlighting({
      highlightedItem,
      onHighlightedItemChange: setHighlightedItem,
      getItems: React.useCallback(() => {
        return getItems().filter(
          (item) => !item.disabled && getIsItemVisible(item.value),
        );
      }, [getItems, getIsItemVisible]),
      getIsItemSelected: (item) => value.includes(item.value),
      loop,
    });

    const onMentionAdd = React.useCallback(
      (payloadValue: string, triggerIndex: number) => {
        const input = inputRef.current;
        if (!input) return;

        const mentionLabel =
          getEnabledItems().find((item) => item.value === payloadValue)
            ?.label ?? payloadValue;
        const mentionText = `${trigger}${mentionLabel}`;
        const beforeTrigger = input.value.slice(0, triggerIndex);
        const afterSearchText = input.value.slice(
          input.selectionStart ?? triggerIndex,
        );
        const newValue = `${beforeTrigger}${mentionText} ${afterSearchText}`;

        const newMention: Mention = {
          value: payloadValue,
          start: triggerIndex,
          end: triggerIndex + mentionText.length,
        };

        setMentions((prev) => [...prev, newMention]);

        input.value = newValue;
        setInputValue(newValue);
        setValue((prev) => [...(prev ?? []), payloadValue]);

        const newCursorPosition = triggerIndex + mentionText.length + 1;
        input.setSelectionRange(newCursorPosition, newCursorPosition);

        setOpen(false);
        setHighlightedItem(null);
        filterStore.search = "";
      },
      [trigger, setInputValue, setValue, setOpen, getEnabledItems, filterStore],
    );

    const onMentionsRemove = React.useCallback(
  (mentionsToRemove: Mention[]) => {
    setMentions((prev) => {
      // must match their actual order in the text
      const removed = [...mentionsToRemove].sort((a, b) => a.start - b.start);

      let newTextLengthDelta = 0;
      const newMentions = prev
        .filter((mention) => {
          const isRemoved = removed.some((m) => m.value === mention.value);
          if (isRemoved) {
            newTextLengthDelta += mention.end - mention.start + 1;
          }
          return !isRemoved;
        })
        .map((mention) => {
          // Shift mentions
          const shift = removed
            .filter((r) => r.start < mention.start)
            .reduce((acc, r) => acc + (r.end - r.start + 1), 0);

          return {
            ...mention,
            start: mention.start - shift,
            end: mention.end - shift,
          };
        });

      return newMentions;
    });
  },
  [],
);


    return (
      <MentionProvider
        open={open}
        onOpenChange={onOpenChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        value={value}
        onValueChange={setValue}
        virtualAnchor={virtualAnchor}
        onVirtualAnchorChange={setVirtualAnchor}
        trigger={trigger}
        onTriggerChange={setTrigger}
        getEnabledItems={getEnabledItems}
        onItemRegister={onItemRegister}
        filterStore={filterStore}
        onFilter={onFilter}
        onItemsFilter={onItemsFilter}
        getIsItemVisible={getIsItemVisible}
        highlightedItem={highlightedItem}
        onHighlightedItemChange={setHighlightedItem}
        onHighlightMove={onHighlightMove}
        mentions={mentions}
        onMentionsChange={setMentions}
        onMentionAdd={onMentionAdd}
        onMentionsRemove={onMentionsRemove}
        isPasting={isPasting}
        onIsPastingChange={setIsPasting}
        dir={dir}
        disabled={disabled}
        exactMatch={exactMatch}
        loop={loop}
        modal={modal}
        readonly={readonly}
        inputRef={inputRef}
        listRef={listRef}
        inputId={inputId}
        labelId={labelId}
        listId={listId}
      >
        <Primitive.div ref={composedRef} {...rootProps}>
          {children}
          {isFormControl && name && (
            <VisuallyHiddenInput
              type="hidden"
              control={collectionRef.current}
              name={name}
              value={value}
              disabled={disabled}
              readOnly={readonly}
              required={required}
            />
          )}
        </Primitive.div>
      </MentionProvider>
    );
  },
);

MentionRoot.displayName = ROOT_NAME;

const Root = MentionRoot;

export { MentionRoot, Root, getDataState, useMentionContext };

export type { ItemData, Mention, MentionRootProps };
