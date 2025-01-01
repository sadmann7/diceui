import { Primitive, createContext, useControllableState } from "@diceui/shared";
import * as React from "react";

const ROOT_NAME = "MentionRoot";

interface MentionState {
  activeId: string | null;
  triggerPoint: { top: number; left: number } | null;
}

interface MentionContextValue {
  // Controlled states
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  selectedValue: string | null;
  onSelectedValueChange: (value: string | null) => void;

  // Internal states
  state: MentionState;
  setTriggerPoint: (point: { top: number; left: number } | null) => void;
  triggerRef: React.RefObject<HTMLInputElement | null>;

  // Convenience methods
  onOpen: () => void;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const [Provider, useContext] = createContext<MentionContextValue>(ROOT_NAME);

export function getDataState(open: boolean) {
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
      onOpenChange,
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
      onChange: onOpenChange,
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

    const onOpen = React.useCallback(() => {
      setOpen(true);
    }, [setOpen]);

    const onClose = React.useCallback(() => {
      setOpen(false);
      setTriggerPoint(null);
    }, [setOpen, setTriggerPoint]);

    const onSelect = React.useCallback(
      (value: string) => {
        setSelectedValue(value);
        onClose();
      },
      [setSelectedValue, onClose],
    );

    const contextValue: MentionContextValue = React.useMemo(
      () => ({
        open,
        onOpenChange: setOpen,
        inputValue,
        onInputValueChange: setInputValue,
        selectedValue,
        onSelectedValueChange: setSelectedValue,
        state,
        setTriggerPoint,
        triggerRef,
        onOpen,
        onClose,
        onSelect,
      }),
      [
        open,
        setOpen,
        inputValue,
        setInputValue,
        selectedValue,
        setSelectedValue,
        state,
        setTriggerPoint,
        onOpen,
        onClose,
        onSelect,
      ],
    );

    return (
      <Provider {...contextValue}>
        <Primitive.div ref={forwardedRef} {...restProps}>
          {children}
        </Primitive.div>
      </Provider>
    );
  },
);

MentionRoot.displayName = ROOT_NAME;

const Root = MentionRoot;

export { MentionRoot, Root, useContext as useMentionContext };

export type { MentionProps, MentionContextValue };
