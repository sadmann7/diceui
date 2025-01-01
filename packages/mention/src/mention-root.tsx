import {
  DATA_VALUE_ATTR,
  type Direction,
  Primitive,
  createContext,
  useControllableState,
  useDirection,
  useId,
} from "@diceui/shared";
import * as React from "react";
import type { MentionItem } from "./mention-item";
import type { MentionPositioner } from "./mention-positioner";

const ROOT_NAME = "MentionRoot";

type HighlightingDirection = "next" | "prev" | "first" | "last" | "selected";

type CollectionElement = React.ElementRef<typeof Primitive.div>;
type PositionerElement = React.ElementRef<typeof MentionPositioner>;
type ItemElement = React.ElementRef<typeof MentionItem>;

interface MentionState {
  activeId: string | null;
  triggerPoint: { top: number; left: number } | null;
}

interface MentionContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedValue: string | null;
  onSelectedValueChange: (value: string | null) => void;
  onItemSelect: (value: string) => void;
  state: MentionState;
  onTriggerPointChange: (point: { top: number; left: number } | null) => void;
  triggerRef: React.RefObject<HTMLInputElement | null>;
  collectionRef: React.RefObject<CollectionElement | null>;
  listRef: React.RefObject<PositionerElement | null>;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
    groups: Map<string, Set<string>>;
  };
  highlightedItem: ItemElement | null;
  onHighlightedItemChange: (item: ItemElement | null) => void;
  onRegisterItem: (id: string, value: string, groupId?: string) => () => void;
  onFilterItems: () => void;
  onHighlightMove: (direction: HighlightingDirection) => void;
  disabled: boolean;
  loop: boolean;
  dir: Direction;
  contentId: string;
}

const [MentionProvider, useMentionContext] =
  createContext<MentionContextValue>(ROOT_NAME);

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

interface MentionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue"
  > {
  /** Whether the mention popover is open. */
  open?: boolean;

  /** The default open state. */
  defaultOpen?: boolean;

  /** Event handler called when the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** The current input value. */
  inputValue?: string;

  /** Event handler called when the input value changes. */
  onInputValueChange?: (value: string) => void;

  /** The currently selected value. */
  value?: string | null;

  /** The default selected value */
  defaultValue?: string | null;

  /** Event handler called when a mention item is selected. */
  onValueChange?: (value: string | null) => void;

  /** Whether the mention is disabled. */
  disabled?: boolean;

  /** Whether to loop through items. */
  loop?: boolean;

  /** The reading direction of the mention. */
  dir?: Direction;
}

const MentionRoot = React.forwardRef<HTMLDivElement, MentionProps>(
  (props, forwardedRef) => {
    const {
      open: openProp,
      defaultOpen = false,
      onOpenChange: onOpenChangeProp,
      inputValue: inputValueProp,
      onInputValueChange,
      value: valueProp,
      defaultValue = null,
      onValueChange,
      disabled = false,
      loop = false,
      dir: dirProp,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<CollectionElement | null>(null);
    const listRef = React.useRef<PositionerElement | null>(null);
    const triggerRef = React.useRef<HTMLInputElement | null>(null);

    const contentId = useId();
    const dir = useDirection(dirProp);

    const items = React.useRef(new Map<string, string>()).current;
    const groups = React.useRef(new Map<string, Set<string>>()).current;
    const filterStore = React.useRef<MentionContextValue["filterStore"]>({
      search: "",
      itemCount: 0,
      items: new Map<string, number>(),
      groups: new Map<string, Set<string>>(),
    }).current;

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

    const [selectedValue = null, setSelectedValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [state, setState] = React.useState<MentionState>({
      activeId: null,
      triggerPoint: null,
    });

    const [highlightedItem, setHighlightedItem] =
      React.useState<ItemElement | null>(null);

    const setTriggerPoint = React.useCallback(
      (point: { top: number; left: number } | null) => {
        setState((prev) => ({ ...prev, triggerPoint: point }));
      },
      [],
    );

    const onOpenChange = React.useCallback(
      (open: boolean) => {
        setOpen(open);
        if (!open) {
          setTriggerPoint(null);
          setHighlightedItem(null);
        }
      },
      [setOpen, setTriggerPoint],
    );

    const onItemSelect = React.useCallback(
      (value: string) => {
        setSelectedValue(value);
        onOpenChange(false);
      },
      [setSelectedValue, onOpenChange],
    );

    const onRegisterItem = React.useCallback(
      (id: string, value: string, groupId?: string) => {
        items.set(id, value);
        if (groupId) {
          const group = groups.get(groupId) ?? new Set<string>();
          group.add(id);
          groups.set(groupId, group);
        }
        filterStore.itemCount = items.size;
        return () => {
          items.delete(id);
          if (groupId) {
            const group = groups.get(groupId);
            if (group) {
              group.delete(id);
              if (group.size === 0) {
                groups.delete(groupId);
              }
            }
          }
          filterStore.itemCount = items.size;
        };
      },
      [items, groups, filterStore],
    );

    const onFilterItems = React.useCallback(() => {
      filterStore.search = inputValue;
    }, [filterStore, inputValue]);

    const onHighlightMove = React.useCallback(
      (direction: HighlightingDirection) => {
        if (!open) return;

        const itemElements = Array.from(
          collectionRef.current?.querySelectorAll(`[${DATA_VALUE_ATTR}]`) ?? [],
        ) as ItemElement[];

        if (itemElements.length === 0) return;

        const currentIndex = itemElements.findIndex(
          (item) => item === highlightedItem,
        );

        let nextIndex: number;
        switch (direction) {
          case "first":
            nextIndex = 0;
            break;
          case "last":
            nextIndex = itemElements.length - 1;
            break;
          case "next":
            if (currentIndex === -1) {
              nextIndex = 0;
            } else {
              nextIndex = loop
                ? (currentIndex + 1) % itemElements.length
                : Math.min(currentIndex + 1, itemElements.length - 1);
            }
            break;
          case "prev":
            if (currentIndex === -1) {
              nextIndex = itemElements.length - 1;
            } else {
              nextIndex = loop
                ? (currentIndex - 1 + itemElements.length) % itemElements.length
                : Math.max(currentIndex - 1, 0);
            }
            break;
          case "selected":
            nextIndex = itemElements.findIndex(
              (item) => item.getAttribute(DATA_VALUE_ATTR) === selectedValue,
            );
            if (nextIndex === -1) nextIndex = 0;
            break;
          default:
            nextIndex = -1;
        }

        const nextItem = itemElements[nextIndex];
        if (nextItem) {
          setHighlightedItem(nextItem);
          nextItem.scrollIntoView({ block: "nearest" });
        }
      },
      [open, highlightedItem, loop, selectedValue],
    );

    return (
      <MentionProvider
        open={open}
        onOpenChange={onOpenChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        selectedValue={selectedValue}
        onSelectedValueChange={setSelectedValue}
        onItemSelect={onItemSelect}
        state={state}
        onTriggerPointChange={setTriggerPoint}
        triggerRef={triggerRef}
        collectionRef={collectionRef}
        listRef={listRef}
        filterStore={filterStore}
        highlightedItem={highlightedItem}
        onHighlightedItemChange={setHighlightedItem}
        onRegisterItem={onRegisterItem}
        onFilterItems={onFilterItems}
        onHighlightMove={onHighlightMove}
        disabled={disabled}
        loop={loop}
        dir={dir}
        contentId={contentId}
      >
        <Primitive.div ref={forwardedRef} {...rootProps} />
      </MentionProvider>
    );
  },
);

MentionRoot.displayName = ROOT_NAME;

const Root = MentionRoot;

export { MentionRoot, Root, getDataState, useMentionContext };

export type { HighlightingDirection, MentionContextValue, MentionProps };
