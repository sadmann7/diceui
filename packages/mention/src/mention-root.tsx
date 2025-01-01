import { Primitive, createContext, useControllableState } from "@diceui/shared";
import * as React from "react";

const ROOT_NAME = "MentionRoot";

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
}

const [MentionProvider, useMentionContext] =
  createContext<MentionContextValue>(ROOT_NAME);

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

interface MentionProps {
  /** The content of the mention component */
  children: React.ReactNode;
  /** Whether the mention popup is open */
  open?: boolean;
  /** The default open state */
  defaultOpen?: boolean;
  /** Event handler called when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** The current input value */
  inputValue?: string;
  /** Event handler called when the input value changes */
  onInputValueChange?: (value: string) => void;
  /** The currently selected value */
  value?: string | null;
  /** The default selected value */
  defaultValue?: string | null;
  /** Event handler called when a mention item is selected */
  onValueChange?: (value: string | null) => void;
}

const MentionRoot = React.forwardRef<HTMLDivElement, MentionProps>(
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
      ...restProps
    } = props;

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
      >
        <Primitive.div ref={forwardedRef} {...restProps}>
          {children}
        </Primitive.div>
      </MentionProvider>
    );
  },
);

MentionRoot.displayName = ROOT_NAME;

const Root = MentionRoot;

export { MentionRoot, Root, getDataState, useMentionContext };

export type { MentionContextValue, MentionProps };
