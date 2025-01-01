import {
  type Direction,
  type ItemMap,
  Primitive,
  createCollection,
  createContext,
  useControllableState,
  useDirection,
} from "@diceui/shared";
import * as React from "react";

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

const ROOT_NAME = "MentionRoot";

type CollectionItem = HTMLDivElement;

interface ItemData {
  value: string;
  textValue: string;
  disabled: boolean;
}

const [Collection, useCollection] = createCollection<CollectionItem, ItemData>(
  ROOT_NAME,
);

interface MentionContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedValue: string | null;
  onSelectedValueChange: (value: string | null) => void;
  onItemSelect: (value: string) => void;
  state: {
    activeId: string | null;
    triggerPoint: { top: number; left: number } | null;
  };
  onTriggerPointChange: (point: { top: number; left: number } | null) => void;
  triggerRef: React.RefObject<HTMLInputElement | null>;
  dir: Direction;
  disabled: boolean;
}

const [MentionProvider, useMentionContext] =
  createContext<MentionContextValue>(ROOT_NAME);

interface MentionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue"
  > {
  /** Whether the mention popup is open. */
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

  /** The default selected value. */
  defaultValue?: string | null;

  /** Event handler called when a mention item is selected. */
  onValueChange?: (value: string | null) => void;

  /** The direction the mention should open. */
  dir?: Direction;

  /** Whether the mention is disabled. */
  disabled?: boolean;
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
      defaultValue = null,
      onValueChange,
      dir: dirProp,
      disabled = false,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<CollectionItem | null>(null);
    const itemMapRef = React.useRef<ItemMap<CollectionItem, ItemData>>(
      new Map(),
    );

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

    const [selectedValue = null, setSelectedValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [state, setState] = React.useState<MentionContextValue["state"]>({
      activeId: null,
      triggerPoint: null,
    });

    const triggerRef = React.useRef<HTMLInputElement | null>(null);

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
        dir={dir}
        disabled={disabled}
      >
        <Collection.Provider
          collectionRef={collectionRef}
          itemMap={itemMapRef.current}
        >
          <Primitive.div ref={forwardedRef} {...rootProps}>
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
