"use client";

import { useComposedRefs } from "@/lib/composition";
import { composeEventHandlers } from "@/lib/composition";
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
  inputId: string;
  labelId: string;
  defaultValue: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
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
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  onCancel?: () => void;
  onEdit?: () => void;
  onSubmit?: (value: string) => void;
  asChild?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
}

const EditableRoot = React.forwardRef<HTMLDivElement, EditableRootProps>(
  (props, forwardedRef) => {
    const {
      id = React.useId(),
      defaultValue = "",
      value: valueProp,
      onValueChange: onValueChangeProp,
      placeholder,
      onCancel,
      onEdit,
      onSubmit,
      asChild,
      disabled,
      required,
      readOnly,
      invalid,
      className,
      ...rootProps
    } = props;

    const [isEditing, setIsEditing] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const inputId = React.useId();
    const labelId = React.useId();

    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;

    const onValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChangeProp?.(newValue);
      },
      [isControlled, onValueChangeProp],
    );

    const contextValue = React.useMemo<EditableContextValue>(
      () => ({
        id,
        inputId,
        labelId,
        defaultValue,
        value,
        onValueChange,
        isEditing,
        setIsEditing,
        disabled,
        readOnly,
        required,
        invalid,
        placeholder,
        onSubmit,
        onEdit,
        onCancel,
      }),
      [
        id,
        inputId,
        labelId,
        defaultValue,
        value,
        onValueChange,
        isEditing,
        placeholder,
        onSubmit,
        onCancel,
        onEdit,
        disabled,
        required,
        readOnly,
        invalid,
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
    const { asChild, className, children, ...labelProps } = props;
    const context = useEditableContext(LABEL_NAME);

    const LabelSlot = asChild ? Slot : "label";

    return (
      <LabelSlot
        data-disabled={context.disabled ? "" : undefined}
        data-invalid={context.invalid ? "" : undefined}
        data-required={context.required ? "" : undefined}
        {...labelProps}
        ref={forwardedRef}
        id={context.labelId}
        htmlFor={context.inputId}
        className={cn(
          "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[required]:after:ml-0.5 data-[required]:after:text-destructive data-[required]:after:content-['*']",
          className,
        )}
      >
        {children}
      </LabelSlot>
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
        role="group"
        data-disabled={context.disabled ? "" : undefined}
        data-editing={context.isEditing ? "" : undefined}
        {...areaProps}
        ref={forwardedRef}
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
        role="button"
        aria-disabled={context.disabled || context.readOnly}
        data-empty={!context.value ? "" : undefined}
        data-disabled={context.disabled ? "" : undefined}
        data-readonly={context.readOnly ? "" : undefined}
        tabIndex={context.disabled || context.readOnly ? undefined : 0}
        {...previewProps}
        ref={forwardedRef}
        onClick={() => {
          if (context.disabled || context.readOnly) return;

          context.onEdit?.();
          context.setIsEditing(true);
        }}
        className={cn(
          "cursor-text rounded-md px-3 py-2 text-sm hover:bg-accent/50 data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default data-[empty]:text-muted-foreground data-[disabled]:opacity-50",
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
    const { asChild, className, disabled, readOnly, required, ...inputProps } =
      props;
    const context = useEditableContext(INPUT_NAME);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const composedRef = useComposedRefs(forwardedRef, inputRef);

    const isDisabled = disabled || context.disabled;
    const isReadOnly = readOnly || context.readOnly;
    const isRequired = required || context.required;

    React.useEffect(() => {
      if (context.isEditing && !isReadOnly) {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      }
    }, [context.isEditing, isReadOnly]);

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

    if (!context.isEditing && !isReadOnly) return null;

    return (
      <InputSlot
        aria-required={isRequired}
        aria-invalid={context.invalid}
        aria-labelledby={context.labelId}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={isRequired}
        {...inputProps}
        ref={composedRef}
        id={context.inputId}
        placeholder={context.placeholder}
        value={context.value}
        onChange={composeEventHandlers(inputProps.onChange, (event) => {
          if (isReadOnly) return;
          context.onValueChange(event.target.value);
        })}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, (event) => {
          if (isReadOnly) return;
          if (event.key === "Escape") {
            context.onCancel?.();
            context.setIsEditing(false);
          } else if (event.key === "Enter") {
            context.onSubmit?.(context.value);
            context.setIsEditing(false);
          }
        })}
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
  orientation?: "horizontal" | "vertical";
}

const EditableToolbar = React.forwardRef<HTMLDivElement, EditableToolbarProps>(
  (props, forwardedRef) => {
    const {
      asChild,
      className,
      orientation = "horizontal",
      ...toolbarProps
    } = props;
    const context = useEditableContext(TOOLBAR_NAME);
    const ToolbarSlot = asChild ? Slot : "div";

    return (
      <ToolbarSlot
        role="toolbar"
        aria-controls={context.id}
        aria-orientation={orientation}
        {...toolbarProps}
        ref={forwardedRef}
        className={cn(
          "mt-2 flex items-center gap-2",
          orientation === "vertical" && "flex-col",
          className,
        )}
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

    if (!context.isEditing && !context.readOnly) return null;

    return (
      <CancelSlot
        type="button"
        aria-controls={context.id}
        {...cancelProps}
        onClick={composeEventHandlers(cancelProps.onClick, () => {
          context.onCancel?.();
          context.setIsEditing(false);
          context.onValueChange(context.defaultValue);
        })}
        ref={forwardedRef}
      />
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

    if (!context.isEditing && !context.readOnly) return null;

    return (
      <SubmitSlot
        type="button"
        aria-controls={context.id}
        {...submitProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(submitProps.onClick, () => {
          context.onSubmit?.(context.value);
          context.setIsEditing(false);
        })}
      />
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
