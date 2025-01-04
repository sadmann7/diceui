import {
  type Direction,
  type ItemMap,
  Primitive,
  composeRefs,
  createCollection,
  createContext,
  useControllableState,
  useDirection,
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

    const { getItems } = useCollection({ collectionRef, itemMap });

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

    const onFilterItems = React.useCallback(() => {}, []);

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

export {
  CollectionItem,
  MentionRoot,
  Root,
  getDataState,
  useCollection,
  useMentionContext,
};

export type { MentionContextValue, MentionProps };
