"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ROOT_NAME = "Editable";
const AREA_NAME = "EditableArea";
const INPUT_NAME = "EditableInput";
const PREVIEW_NAME = "EditablePreview";
const LABEL_NAME = "EditableLabel";
const TOOLBAR_NAME = "EditableToolbar";
const CANCEL_NAME = "EditableCancel";
const SUBMIT_NAME = "EditableSubmit";

const EDITABLE_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [AREA_NAME]: `\`${AREA_NAME}\` must be within \`${ROOT_NAME}\``,
  [INPUT_NAME]: `\`${INPUT_NAME}\` must be within \`${ROOT_NAME}\``,
  [PREVIEW_NAME]: `\`${PREVIEW_NAME}\` must be within \`${ROOT_NAME}\``,
  [LABEL_NAME]: `\`${LABEL_NAME}\` must be within \`${ROOT_NAME}\``,
  [TOOLBAR_NAME]: `\`${TOOLBAR_NAME}\` must be within \`${ROOT_NAME}\``,
  [CANCEL_NAME]: `\`${CANCEL_NAME}\` must be within \`${ROOT_NAME}\``,
  [SUBMIT_NAME]: `\`${SUBMIT_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

interface EditableContextValue {
  id: string;
  value: string;
  defaultValue: string;
  isEditing: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  setIsEditing: (isEditing: boolean) => void;
  setValue: (value: string) => void;
}

const EditableContext = React.createContext<EditableContextValue | null>(null);
EditableContext.displayName = ROOT_NAME;

function useEditableContext(name: keyof typeof EDITABLE_ERROR) {
  const context = React.useContext(EditableContext);
  if (!context) {
    throw new Error(EDITABLE_ERROR[name]);
  }
  return context;
}

interface EditableRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  disabled?: boolean;
  asChild?: boolean;
}

const EditableRoot = React.forwardRef<HTMLDivElement, EditableRootProps>(
  (props, forwardedRef) => {
    const {
      id = React.useId(),
      value: valueProp,
      defaultValue = "",
      placeholder,
      onValueChange,
      onSubmit,
      onCancel,
      onEdit,
      disabled,
      asChild,
      className,
      ...rootProps
    } = props;

    const [isEditing, setIsEditing] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue);

    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;

    const setValue = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange],
    );

    const contextValue = React.useMemo(
      () => ({
        id,
        value,
        defaultValue,
        isEditing,
        disabled,
        placeholder,
        onValueChange,
        onSubmit,
        onCancel,
        onEdit,
        setIsEditing,
        setValue,
      }),
      [
        id,
        value,
        defaultValue,
        isEditing,
        disabled,
        placeholder,
        onValueChange,
        onSubmit,
        onCancel,
        onEdit,
        setValue,
      ],
    );

    const RootSlot = asChild ? Slot : "div";

    return (
      <EditableContext.Provider value={contextValue}>
        <RootSlot
          {...rootProps}
          ref={forwardedRef}
          className={cn("flex flex-col gap-2", className)}
        />
      </EditableContext.Provider>
    );
  },
);
EditableRoot.displayName = ROOT_NAME;

interface EditableLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

const EditableLabel = React.forwardRef<HTMLLabelElement, EditableLabelProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...labelProps } = props;
    const context = useEditableContext(LABEL_NAME);

    const LabelSlot = asChild ? Slot : "label";

    return (
      <LabelSlot
        {...labelProps}
        ref={forwardedRef}
        data-disabled={context.isDisabled ? "" : undefined}
        data-invalid={context.isDisabled ? "" : undefined}
        className={cn(
          "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
      />
    );
  },
);
EditableLabel.displayName = LABEL_NAME;

interface EditableAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const EditableArea = React.forwardRef<HTMLDivElement, EditableAreaProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...areaProps } = props;
    const context = useEditableContext(AREA_NAME);

    const AreaSlot = asChild ? Slot : "div";

    return (
      <AreaSlot
        {...areaProps}
        ref={forwardedRef}
        data-disabled={context.isDisabled ? "" : undefined}
        data-editing={context.isEditing ? "" : undefined}
        className={cn(
          "relative inline-block min-w-[200px] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        )}
      />
    );
  },
);
EditableArea.displayName = AREA_NAME;

interface EditablePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const EditablePreview = React.forwardRef<HTMLDivElement, EditablePreviewProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...previewProps } = props;
    const context = useEditableContext(PREVIEW_NAME);

    const PreviewSlot = asChild ? Slot : "div";

    if (context.isEditing) {
      return null;
    }

    return (
      <PreviewSlot
        {...previewProps}
        ref={forwardedRef}
        onClick={() => {
          if (!context.isDisabled) {
            context.onEdit?.();
            context.setIsEditing(true);
          }
        }}
        data-placeholder-shown={!context.value ? "" : undefined}
        data-disabled={context.isDisabled ? "" : undefined}
        className={cn(
          "cursor-text rounded-md px-3 py-2 text-sm hover:bg-accent/50 data-[disabled]:cursor-not-allowed data-[placeholder-shown]:text-muted-foreground data-[disabled]:opacity-50",
          className,
        )}
      >
        {context.value || context.placeholder}
      </PreviewSlot>
    );
  },
);
EditablePreview.displayName = PREVIEW_NAME;

interface EditableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

const EditableInput = React.forwardRef<HTMLInputElement, EditableInputProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...inputProps } = props;
    const context = useEditableContext(INPUT_NAME);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const composedRef = useComposedRefs(forwardedRef, inputRef);

    React.useEffect(() => {
      if (context.isEditing) {
        // Focus and select all text when entering edit mode
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      }
    }, [context.isEditing]);

    React.useEffect(() => {
      function onClickOutside(e: MouseEvent) {
        if (
          inputRef.current &&
          !inputRef.current.contains(e.target as Node) &&
          context.isEditing
        ) {
          context.onSubmit?.(context.value);
          context.setIsEditing(false);
        }
      }

      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }, [context]);

    const InputSlot = asChild ? Slot : "input";

    if (!context.isEditing) {
      return null;
    }

    return (
      <InputSlot
        {...inputProps}
        ref={composedRef}
        value={context.value}
        placeholder={context.placeholder}
        onChange={(e) => {
          inputProps.onChange?.(e);
          context.setValue(e.target.value);
        }}
        onKeyDown={(e) => {
          inputProps.onKeyDown?.(e);
          if (e.key === "Escape") {
            context.onCancel?.();
            context.setIsEditing(false);
          } else if (e.key === "Enter") {
            context.onSubmit?.(context.value);
            context.setIsEditing(false);
          }
        }}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
      />
    );
  },
);

EditableInput.displayName = INPUT_NAME;

interface EditableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const EditableToolbar = React.forwardRef<HTMLDivElement, EditableToolbarProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...toolbarProps } = props;
    const ToolbarSlot = asChild ? Slot : "div";

    return (
      <ToolbarSlot
        {...toolbarProps}
        ref={forwardedRef}
        className={cn("mt-2 flex items-center gap-2", className)}
      />
    );
  },
);
EditableToolbar.displayName = TOOLBAR_NAME;

interface EditableCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const EditableCancel = React.forwardRef<HTMLButtonElement, EditableCancelProps>(
  (props, forwardedRef) => {
    const { asChild, ...cancelProps } = props;
    const context = useEditableContext(CANCEL_NAME);

    const CancelSlot = asChild ? Slot : "button";

    if (!context.isEditing) {
      return null;
    }

    return (
      <CancelSlot
        type="button"
        aria-label="Cancel editing"
        {...cancelProps}
        onClick={() => {
          context.onCancel?.();
          context.setIsEditing(false);
          context.setValue(context.defaultValue);
        }}
        ref={forwardedRef}
        className={cn(
          "inline-flex h-8 items-center justify-center rounded-md border bg-transparent px-3 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          cancelProps.className,
        )}
      >
        {cancelProps.children ?? "Cancel"}
      </CancelSlot>
    );
  },
);
EditableCancel.displayName = CANCEL_NAME;

interface EditableSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const EditableSubmit = React.forwardRef<HTMLButtonElement, EditableSubmitProps>(
  (props, forwardedRef) => {
    const { asChild, ...submitProps } = props;
    const context = useEditableContext(SUBMIT_NAME);

    const SubmitSlot = asChild ? Slot : "button";

    if (!context.isEditing) {
      return null;
    }

    return (
      <SubmitSlot
        type="button"
        aria-label="Submit changes"
        {...submitProps}
        onClick={() => {
          context.onSubmit?.(context.value);
          context.setIsEditing(false);
        }}
        ref={forwardedRef}
        className={cn(
          "inline-flex h-8 items-center justify-center rounded-md border bg-primary px-3 font-medium text-primary-foreground text-sm shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          submitProps.className,
        )}
      >
        {submitProps.children ?? "Save"}
      </SubmitSlot>
    );
  },
);
EditableSubmit.displayName = SUBMIT_NAME;

const Root = EditableRoot;
const Label = EditableLabel;
const Area = EditableArea;
const Preview = EditablePreview;
const Input = EditableInput;
const Toolbar = EditableToolbar;
const Cancel = EditableCancel;
const Submit = EditableSubmit;

export {
  EditableRoot,
  EditableLabel,
  EditableArea,
  EditablePreview,
  EditableInput,
  EditableToolbar,
  EditableCancel,
  EditableSubmit,
  //
  Root,
  Label,
  Area,
  Preview,
  Input,
  Toolbar,
  Cancel,
  Submit,
};
