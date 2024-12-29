import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

interface MentionState {
  isOpen: boolean;
  activeId: string | null;
  inputValue: string;
  selectedValue: string | null;
  triggerPoint: { top: number; left: number } | null;
}

interface MentionContext {
  state: MentionState;
  onOpen: () => void;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSelect: (value: string) => void;
  setTriggerPoint: (point: { top: number; left: number } | null) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const MentionContext = React.createContext<MentionContext | null>(null);

function useMentionContext(componentName?: string) {
  const context = React.useContext(MentionContext);
  if (!context) {
    throw new Error(
      `use${componentName || "Mention"} must be used within a MentionProvider`,
    );
  }
  return context;
}

export function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

interface MentionProps {
  /** The content of the mention component */
  children: React.ReactNode;
  /** Event handler called when a mention item is selected */
  onSelect?: (value: string) => void;
  /** Event handler called when the input value changes */
  onChange?: (value: string) => void;
}

const MentionRoot = React.forwardRef<HTMLDivElement, MentionProps>(
  ({ children, onSelect, onChange }, forwardedRef) => {
    const [state, setState] = React.useState<MentionState>({
      isOpen: false,
      activeId: null,
      inputValue: "",
      selectedValue: null,
      triggerPoint: null,
    });

    const triggerRef = React.useRef<HTMLElement | null>(null);

    const onOpen = React.useCallback(() => {
      setState((prev: MentionState) => ({ ...prev, isOpen: true }));
    }, []);

    const onClose = React.useCallback(() => {
      setState((prev: MentionState) => ({
        ...prev,
        isOpen: false,
        triggerPoint: null,
      }));
    }, []);

    const onInputChange = React.useCallback(
      (value: string) => {
        setState((prev: MentionState) => ({ ...prev, inputValue: value }));
        onChange?.(value);
      },
      [onChange],
    );

    const onSelectValue = React.useCallback(
      (value: string) => {
        setState((prev: MentionState) => ({
          ...prev,
          selectedValue: value,
          isOpen: false,
          triggerPoint: null,
        }));
        onSelect?.(value);
      },
      [onSelect],
    );

    const setTriggerPoint = React.useCallback(
      (point: { top: number; left: number } | null) => {
        setState((prev: MentionState) => ({ ...prev, triggerPoint: point }));
      },
      [],
    );

    const value = React.useMemo(
      () => ({
        state,
        onOpen,
        onClose,
        onInputChange,
        onSelect: onSelectValue,
        setTriggerPoint,
        triggerRef,
      }),
      [state, onOpen, onClose, onInputChange, onSelectValue, setTriggerPoint],
    );

    return (
      <MentionContext.Provider value={value}>
        <Primitive.div ref={forwardedRef}>{children}</Primitive.div>
      </MentionContext.Provider>
    );
  },
);

MentionRoot.displayName = "MentionRoot";

const Root = MentionRoot;

export { MentionRoot, Root, useMentionContext };

export type { MentionProps };
