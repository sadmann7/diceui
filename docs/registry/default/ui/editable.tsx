"use client";

import { composeEventHandlers, useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const DATA_ACTION_ATTR = "data-action";

const ROOT_NAME = "Editable";
const AREA_NAME = "EditableArea";
const PREVIEW_NAME = "EditablePreview";
const INPUT_NAME = "EditableInput";
const TRIGGER_NAME = "EditableTrigger";
const LABEL_NAME = "EditableLabel";
const TOOLBAR_NAME = "EditableToolbar";
const CANCEL_NAME = "EditableCancel";
const SUBMIT_NAME = "EditableSubmit";

const EDITABLE_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [AREA_NAME]: `\`${AREA_NAME}\` must be within \`${ROOT_NAME}\``,
  [PREVIEW_NAME]: `\`${PREVIEW_NAME}\` must be within \`${ROOT_NAME}\``,
  [INPUT_NAME]: `\`${INPUT_NAME}\` must be within \`${ROOT_NAME}\``,
  [TRIGGER_NAME]: `\`${TRIGGER_NAME}\` must be within \`${ROOT_NAME}\``,
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
  editing: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSubmit: (value: string) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  dir?: "ltr" | "rtl";
  maxLength?: number;
  placeholder?: string;
  triggerMode: "click" | "dblclick" | "focus";
  autosize: boolean;
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

type RootElement = React.ComponentRef<typeof EditableRoot>;

interface EditableRootProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSubmit"> {
  id?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultEditing?: boolean;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onSubmit?: (value: string) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  dir?: "ltr" | "rtl";
  name?: string;
  maxLength?: number;
  placeholder?: string;
  triggerMode?: EditableContextValue["triggerMode"];
  asChild?: boolean;
  autosize?: boolean;
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
      defaultEditing = false,
      editing: editingProp,
      onEditingChange: onEditingChangeProp,
      onCancel: onCancelProp,
      onEdit: onEditProp,
      onSubmit: onSubmitProp,
      onEscapeKeyDown,
      dir = "ltr",
      name,
      maxLength,
      placeholder,
      triggerMode = "click",
      asChild,
      autosize = false,
      disabled,
      required,
      readOnly,
      invalid,
      className,
      ...rootProps
    } = props;

    const inputId = React.useId();
    const labelId = React.useId();

    const isControlled = valueProp !== undefined;
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState(defaultValue);
    const value = isControlled ? valueProp : uncontrolledValue;
    const previousValueRef = React.useRef(value);
    const onValueChangeRef = React.useRef(onValueChangeProp);

    const isEditingControlled = editingProp !== undefined;
    const [uncontrolledEditing, setUncontrolledEditing] =
      React.useState(defaultEditing);
    const editing = isEditingControlled ? editingProp : uncontrolledEditing;
    const onEditingChangeRef = React.useRef(onEditingChangeProp);

    React.useEffect(() => {
      onValueChangeRef.current = onValueChangeProp;
      onEditingChangeRef.current = onEditingChangeProp;
    });

    const onValueChange = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(nextValue);
        }
        onValueChangeRef.current?.(nextValue);
      },
      [isControlled],
    );

    const onEditingChange = React.useCallback(
      (nextEditing: boolean) => {
        if (!isEditingControlled) {
          setUncontrolledEditing(nextEditing);
        }
        onEditingChangeRef.current?.(nextEditing);
      },
      [isEditingControlled],
    );

    React.useEffect(() => {
      if (isControlled && valueProp !== previousValueRef.current) {
        previousValueRef.current = valueProp;
      }
    }, [isControlled, valueProp]);

    const [formTrigger, setFormTrigger] = React.useState<RootElement | null>(
      null,
    );
    const composedRef = useComposedRefs(forwardedRef, (node) =>
      setFormTrigger(node),
    );
    const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

    const onCancel = React.useCallback(() => {
      const prevValue = previousValueRef.current;
      onValueChange(prevValue);
      onEditingChange(false);
      onCancelProp?.();
    }, [onValueChange, onCancelProp, onEditingChange]);

    const onEdit = React.useCallback(() => {
      previousValueRef.current = value;
      onEditingChange(true);
      onEditProp?.();
    }, [value, onEditProp, onEditingChange]);

    const onSubmit = React.useCallback(
      (newValue: string) => {
        onValueChange(newValue);
        onEditingChange(false);
        onSubmitProp?.(newValue);
      },

      [onValueChange, onSubmitProp, onEditingChange],
    );

    const contextValue = React.useMemo<EditableContextValue>(
      () => ({
        id,
        inputId,
        labelId,
        defaultValue,
        value,
        onValueChange,
        editing,
        onSubmit,
        onEdit,
        onCancel,
        onEscapeKeyDown,
        maxLength,
        placeholder,
        triggerMode,
        autosize,
        disabled,
        readOnly,
        required,
        invalid,
      }),
      [
        id,
        inputId,
        labelId,
        defaultValue,
        value,
        onValueChange,
        editing,
        onSubmit,
        onCancel,
        onEdit,
        onEscapeKeyDown,
        maxLength,
        placeholder,
        triggerMode,
        autosize,
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
          dir={dir}
          {...rootProps}
          ref={composedRef}
          className={cn("flex min-w-0 flex-col gap-2", className)}
        />
        {name && isFormControl && (
          <VisuallyHiddenInput
            control={formTrigger}
            type="hidden"
            name={name}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </EditableContext.Provider>
    );
  },
);
EditableRoot.displayName = ROOT_NAME;

interface EditableLabelProps extends React.ComponentPropsWithoutRef<"label"> {
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

interface EditableAreaProps extends React.ComponentPropsWithoutRef<"div"> {
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
        data-editing={context.editing ? "" : undefined}
        {...areaProps}
        ref={forwardedRef}
        className={cn(
          "relative inline-block data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        )}
      />
    );
  },
);
EditableArea.displayName = AREA_NAME;

interface EditablePreviewProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const EditablePreview = React.forwardRef<HTMLDivElement, EditablePreviewProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...previewProps } = props;
    const context = useEditableContext(PREVIEW_NAME);

    const onTrigger = React.useCallback(() => {
      if (context.disabled || context.readOnly) return;
      context.onEdit();
    }, [context.disabled, context.readOnly, context.onEdit]);

    const PreviewSlot = asChild ? Slot : "div";

    if (context.editing || context.readOnly) return null;

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
        onClick={composeEventHandlers(
          previewProps.onClick,
          context.triggerMode === "click" ? onTrigger : undefined,
        )}
        onDoubleClick={composeEventHandlers(
          previewProps.onDoubleClick,
          context.triggerMode === "dblclick" ? onTrigger : undefined,
        )}
        onFocus={composeEventHandlers(
          previewProps.onFocus,
          context.triggerMode === "focus" ? onTrigger : undefined,
        )}
        className={cn(
          "cursor-text truncate rounded-sm border border-transparent py-1 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default data-[empty]:text-muted-foreground data-[disabled]:opacity-50 md:text-sm",
          className,
        )}
      >
        {context.value || context.placeholder}
      </PreviewSlot>
    );
  },
);
EditablePreview.displayName = PREVIEW_NAME;

type InputElement = React.ComponentRef<typeof EditableInput>;

interface EditableInputProps extends React.ComponentPropsWithoutRef<"input"> {
  asChild?: boolean;
  maxLength?: number;
}

const EditableInput = React.forwardRef<HTMLInputElement, EditableInputProps>(
  (props, forwardedRef) => {
    const {
      asChild,
      className,
      disabled,
      readOnly,
      required,
      maxLength,
      ...inputProps
    } = props;
    const context = useEditableContext(INPUT_NAME);
    const inputRef = React.useRef<InputElement>(null);
    const composedRef = useComposedRefs(forwardedRef, inputRef);

    const isDisabled = disabled || context.disabled;
    const isReadOnly = readOnly || context.readOnly;
    const isRequired = required || context.required;

    const onBlur = React.useCallback(
      (event: React.FocusEvent<InputElement>) => {
        if (isReadOnly) return;
        const relatedTarget = event.relatedTarget;
        console.log("blur", relatedTarget);

        const isAction =
          relatedTarget instanceof HTMLElement &&
          relatedTarget.closest(`[${DATA_ACTION_ATTR}=""]`);

        if (!isAction) {
          context.onSubmit(context.value);
        }
      },
      [context.value, context.onSubmit, isReadOnly],
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (isReadOnly) return;
        context.onValueChange(event.target.value);

        if (!context.autosize) return;
        const target = event.target;
        if (target instanceof HTMLTextAreaElement) {
          target.style.height = "0";
          target.style.height = `${target.scrollHeight}px`;
        } else {
          target.style.width = "0";
          target.style.width = `${target.scrollWidth + 4}px`;
        }
      },
      [context.onValueChange, context.autosize, isReadOnly],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<InputElement>) => {
        if (isReadOnly) return;
        if (event.key === "Escape") {
          const nativeEvent = event.nativeEvent;
          if (context.onEscapeKeyDown) {
            context.onEscapeKeyDown(nativeEvent);
            if (nativeEvent.defaultPrevented) return;
          }
          context.onCancel();
        } else if (event.key === "Enter") {
          context.onSubmit(context.value);
        }
      },
      [
        context.value,
        context.onSubmit,
        context.onCancel,
        context.onEscapeKeyDown,
        isReadOnly,
      ],
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (context.editing && !isReadOnly) {
          event.target.select();

          if (!context.autosize) return;
          const target = event.target;
          if (target instanceof HTMLTextAreaElement) {
            target.style.height = "0";
            target.style.height = `${target.scrollHeight}px`;
          } else {
            target.style.width = "0";
            target.style.width = `${target.scrollWidth + 4}px`;
          }
        }
      },
      [context.editing, isReadOnly, context.autosize],
    );

    const InputSlot = asChild ? Slot : "input";

    if (!context.editing && !isReadOnly) return null;

    return (
      <InputSlot
        aria-required={isRequired}
        aria-invalid={context.invalid}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={isRequired}
        autoFocus={context.editing && !isReadOnly}
        {...inputProps}
        id={context.inputId}
        aria-labelledby={context.labelId}
        ref={composedRef}
        maxLength={maxLength}
        placeholder={context.placeholder}
        value={context.value}
        onFocus={composeEventHandlers(inputProps.onFocus, onFocus)}
        onBlur={composeEventHandlers(inputProps.onBlur, onBlur)}
        onChange={composeEventHandlers(inputProps.onChange, onChange)}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, onKeyDown)}
        className={cn(
          "flex rounded-sm border border-input bg-transparent py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          context.autosize ? "w-auto" : "w-full",
          className,
        )}
      />
    );
  },
);
EditableInput.displayName = INPUT_NAME;

interface EditableTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  forceMount?: boolean;
}

const EditableTrigger = React.forwardRef<
  HTMLButtonElement,
  EditableTriggerProps
>((props, forwardedRef) => {
  const { asChild, forceMount = false, ...triggerProps } = props;
  const context = useEditableContext(TRIGGER_NAME);

  const TriggerSlot = asChild ? Slot : "button";

  if (!forceMount && (context.editing || context.readOnly)) return null;

  const onTrigger = React.useCallback(() => {
    if (context.disabled || context.readOnly) return;
    context.onEdit();
  }, [context.disabled, context.readOnly, context.onEdit]);

  return (
    <TriggerSlot
      type="button"
      aria-controls={context.id}
      aria-disabled={context.disabled || context.readOnly}
      data-disabled={context.disabled ? "" : undefined}
      data-readonly={context.readOnly ? "" : undefined}
      {...triggerProps}
      ref={forwardedRef}
      onClick={context.triggerMode === "click" ? onTrigger : undefined}
      onDoubleClick={context.triggerMode === "dblclick" ? onTrigger : undefined}
    />
  );
});
EditableTrigger.displayName = TRIGGER_NAME;

interface EditableToolbarProps extends React.ComponentPropsWithoutRef<"div"> {
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
          "flex items-center gap-2",
          orientation === "vertical" && "flex-col",
          className,
        )}
      />
    );
  },
);
EditableToolbar.displayName = TOOLBAR_NAME;

interface EditableCancelProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const EditableCancel = React.forwardRef<HTMLButtonElement, EditableCancelProps>(
  (props, forwardedRef) => {
    const { asChild, ...cancelProps } = props;
    const context = useEditableContext(CANCEL_NAME);

    const CancelSlot = asChild ? Slot : "button";

    if (!context.editing && !context.readOnly) return null;

    return (
      <CancelSlot
        type="button"
        aria-controls={context.id}
        {...{ [DATA_ACTION_ATTR]: "" }}
        {...cancelProps}
        onClick={composeEventHandlers(cancelProps.onClick, () => {
          context.onCancel();
        })}
        ref={forwardedRef}
      />
    );
  },
);
EditableCancel.displayName = CANCEL_NAME;

interface EditableSubmitProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const EditableSubmit = React.forwardRef<HTMLButtonElement, EditableSubmitProps>(
  (props, forwardedRef) => {
    const { asChild, ...submitProps } = props;
    const context = useEditableContext(SUBMIT_NAME);

    const SubmitSlot = asChild ? Slot : "button";

    if (!context.editing && !context.readOnly) return null;

    return (
      <SubmitSlot
        type="button"
        aria-controls={context.id}
        {...{ [DATA_ACTION_ATTR]: "" }}
        {...submitProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(submitProps.onClick, () => {
          context.onSubmit(context.value);
        })}
      />
    );
  },
);
EditableSubmit.displayName = SUBMIT_NAME;

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/checkbox/src/Checkbox.tsx#L165-L212
 */

interface VisuallyHiddenInputProps<T extends HTMLElement>
  extends React.ComponentPropsWithoutRef<"input"> {
  control: T | null;
  bubbles?: boolean;
}

function VisuallyHiddenInput<T extends HTMLElement>(
  props: VisuallyHiddenInputProps<T>,
) {
  const {
    control,
    value,
    bubbles = true,
    type = "hidden",
    ...inputProps
  } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const previousRef = React.useRef({ value, previous: value });
  const previousValue = React.useMemo(() => {
    if (inputRef.current?.value !== value) {
      previousRef.current.previous = previousRef.current.value;
      previousRef.current.value = value;
    }
    return previousRef.current.previous;
  }, [value]);

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const inputProto = window.HTMLInputElement.prototype;

    const propertyKey = "value";
    const eventType = "input";
    const currentValue = JSON.stringify(value);

    const descriptor = Object.getOwnPropertyDescriptor(
      inputProto,
      propertyKey,
    ) as PropertyDescriptor;
    const setter = descriptor.set;

    if (previousValue !== currentValue && setter) {
      const event = new Event(eventType, { bubbles });
      setter.call(input, currentValue);
      input.dispatchEvent(event);
    }
  }, [previousValue, value, bubbles]);

  return (
    <input
      type={type}
      {...inputProps}
      ref={inputRef}
      style={{
        ...props.style,
        border: 0,
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
      }}
    />
  );
}

const Root = EditableRoot;
const Label = EditableLabel;
const Area = EditableArea;
const Preview = EditablePreview;
const Input = EditableInput;
const Trigger = EditableTrigger;
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
  EditableTrigger,
  //
  Root,
  Label,
  Area,
  Preview,
  Input,
  Toolbar,
  Cancel,
  Submit,
  Trigger,
};
