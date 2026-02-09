"use client";

import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/bases/radix/components/visually-hidden-input";
import { useAsRef } from "@/registry/bases/radix/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/radix/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";

const ROOT_NAME = "Editable";
const LABEL_NAME = "EditableLabel";
const AREA_NAME = "EditableArea";
const PREVIEW_NAME = "EditablePreview";
const INPUT_NAME = "EditableInput";
const TRIGGER_NAME = "EditableTrigger";
const TOOLBAR_NAME = "EditableToolbar";
const CANCEL_NAME = "EditableCancel";
const SUBMIT_NAME = "EditableSubmit";

type Direction = "ltr" | "rtl";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof Editable>;
type PreviewElement = React.ComponentRef<typeof EditablePreview>;
type SubmitElement = React.ComponentRef<typeof EditableSubmit>;
type InputElement = React.ComponentRef<typeof EditableInput>;

interface StoreState {
  value: string;
  editing: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(
  selector: (state: StoreState) => T,
  ogStore?: Store | null,
): T {
  const contextStore = React.useContext(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface EditableContextValue {
  rootId: string;
  inputId: string;
  labelId: string;
  defaultValue: string;
  onCancel: () => void;
  onEdit: () => void;
  onSubmit: (value: string) => void;
  onEnterKeyDown?: (event: KeyboardEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  dir?: Direction;
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

function useEditableContext(consumerName: string) {
  const context = React.useContext(EditableContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface EditableProps extends Omit<DivProps, "onSubmit"> {
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
  onEnterKeyDown?: (event: KeyboardEvent) => void;
  dir?: Direction;
  maxLength?: number;
  name?: string;
  placeholder?: string;
  triggerMode?: EditableContextValue["triggerMode"];
  autosize?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
}

function Editable(props: EditableProps) {
  const {
    value: valueProp,
    defaultValue = "",
    defaultEditing,
    editing: editingProp,
    onValueChange,
    onEditingChange,
    onCancel: onCancelProp,
    onEdit: onEditProp,
    onSubmit: onSubmitProp,
    onEscapeKeyDown,
    onEnterKeyDown,
    dir: dirProp,
    maxLength,
    name,
    placeholder,
    triggerMode = "click",
    asChild,
    autosize = false,
    disabled,
    required,
    readOnly,
    invalid,
    className,
    id,
    ref,
    ...rootProps
  } = props;

  const instanceId = React.useId();
  const rootId = id ?? instanceId;

  const inputId = React.useId();
  const labelId = React.useId();

  const dir = DirectionPrimitive.useDirection(dirProp);

  const previousValueRef = React.useRef(defaultValue);

  const [formTrigger, setFormTrigger] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    value: valueProp ?? defaultValue,
    editing: editingProp ?? defaultEditing ?? false,
  }));

  const propsRef = useAsRef({
    onValueChange,
    onEditingChange,
    onCancel: onCancelProp,
    onEdit: onEditProp,
    onSubmit: onSubmitProp,
    onEscapeKeyDown,
    onEnterKeyDown,
  });

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "value" && typeof value === "string") {
          stateRef.current.value = value;
          propsRef.current.onValueChange?.(value);
        } else if (key === "editing" && typeof value === "boolean") {
          stateRef.current.editing = value;
          propsRef.current.onEditingChange?.(value);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  const value = useStore((state) => state.value, store);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp]);

  useIsomorphicLayoutEffect(() => {
    if (editingProp !== undefined) {
      store.setState("editing", editingProp);
    }
  }, [editingProp]);

  const onCancel = React.useCallback(() => {
    const prevValue = previousValueRef.current;
    store.setState("value", prevValue);
    store.setState("editing", false);
    propsRef.current.onCancel?.();
  }, [store, propsRef]);

  const onEdit = React.useCallback(() => {
    const currentValue = store.getState().value;
    previousValueRef.current = currentValue;
    store.setState("editing", true);
    propsRef.current.onEdit?.();
  }, [store, propsRef]);

  const onSubmit = React.useCallback(
    (newValue: string) => {
      store.setState("value", newValue);
      store.setState("editing", false);
      propsRef.current.onSubmit?.(newValue);
    },
    [store, propsRef],
  );

  const contextValue = React.useMemo<EditableContextValue>(
    () => ({
      rootId,
      inputId,
      labelId,
      defaultValue,
      onSubmit,
      onEdit,
      onCancel,
      onEscapeKeyDown,
      onEnterKeyDown,
      dir,
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
      rootId,
      inputId,
      labelId,
      defaultValue,
      onSubmit,
      onCancel,
      onEdit,
      onEscapeKeyDown,
      onEnterKeyDown,
      dir,
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

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <EditableContext.Provider value={contextValue}>
        <RootPrimitive
          data-slot="editable"
          {...rootProps}
          id={id}
          ref={composedRef}
          className={cn("flex min-w-0 flex-col gap-2", className)}
        />
        {isFormControl && (
          <VisuallyHiddenInput
            type="hidden"
            control={formTrigger}
            name={name}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </EditableContext.Provider>
    </StoreContext.Provider>
  );
}

interface EditableLabelProps extends React.ComponentProps<"label"> {
  asChild?: boolean;
}

function EditableLabel(props: EditableLabelProps) {
  const { asChild, className, children, ref, ...labelProps } = props;
  const context = useEditableContext(LABEL_NAME);

  const LabelPrimitive = asChild ? SlotPrimitive.Slot : "label";

  return (
    <LabelPrimitive
      data-disabled={context.disabled ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      data-required={context.required ? "" : undefined}
      data-slot="editable-label"
      {...labelProps}
      ref={ref}
      id={context.labelId}
      htmlFor={context.inputId}
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-required:after:ml-0.5 data-required:after:text-destructive data-required:after:content-['*']",
        className,
      )}
    >
      {children}
    </LabelPrimitive>
  );
}

interface EditableAreaProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function EditableArea(props: EditableAreaProps) {
  const { asChild, className, ref, ...areaProps } = props;
  const context = useEditableContext(AREA_NAME);
  const editing = useStore((state) => state.editing);

  const AreaPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <AreaPrimitive
      role="group"
      data-disabled={context.disabled ? "" : undefined}
      data-editing={editing ? "" : undefined}
      data-slot="editable-area"
      dir={context.dir}
      {...areaProps}
      ref={ref}
      className={cn(
        "relative inline-block min-w-0 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
    />
  );
}

interface EditablePreviewProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function EditablePreview(props: EditablePreviewProps) {
  const {
    onClick: onClickProp,
    onDoubleClick: onDoubleClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    asChild,
    className,
    ref,
    ...previewProps
  } = props;

  const context = useEditableContext(PREVIEW_NAME);
  const value = useStore((state) => state.value);
  const editing = useStore((state) => state.editing);

  const propsRef = useAsRef({
    onClick: onClickProp,
    onDoubleClick: onDoubleClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
  });

  const onTrigger = React.useCallback(() => {
    if (context.disabled || context.readOnly) return;
    context.onEdit();
  }, [context.onEdit, context.disabled, context.readOnly]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<PreviewElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || context.triggerMode !== "click") return;

      onTrigger();
    },
    [propsRef, onTrigger, context.triggerMode],
  );

  const onDoubleClick = React.useCallback(
    (event: React.MouseEvent<PreviewElement>) => {
      propsRef.current.onDoubleClick?.(event);
      if (event.defaultPrevented || context.triggerMode !== "dblclick") return;

      onTrigger();
    },
    [propsRef, onTrigger, context.triggerMode],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<PreviewElement>) => {
      propsRef.current.onFocus?.(event);
      if (event.defaultPrevented || context.triggerMode !== "focus") return;

      onTrigger();
    },
    [propsRef, onTrigger, context.triggerMode],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<PreviewElement>) => {
      propsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Enter") {
        const nativeEvent = event.nativeEvent;
        if (context.onEnterKeyDown) {
          context.onEnterKeyDown(nativeEvent);
          if (nativeEvent.defaultPrevented) return;
        }
        onTrigger();
      }
    },
    [propsRef, onTrigger, context.onEnterKeyDown],
  );

  const PreviewPrimitive = asChild ? SlotPrimitive.Slot : "div";

  if (editing || context.readOnly) return null;

  return (
    <PreviewPrimitive
      role="button"
      aria-disabled={context.disabled || context.readOnly}
      data-empty={!value ? "" : undefined}
      data-disabled={context.disabled ? "" : undefined}
      data-readonly={context.readOnly ? "" : undefined}
      data-slot="editable-preview"
      tabIndex={context.disabled || context.readOnly ? undefined : 0}
      {...previewProps}
      ref={ref}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className={cn(
        "cursor-text truncate rounded-sm border border-transparent py-1 text-base focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring data-disabled:cursor-not-allowed data-readonly:cursor-default data-empty:text-muted-foreground data-disabled:opacity-50 md:text-sm",
        className,
      )}
    >
      {value || context.placeholder}
    </PreviewPrimitive>
  );
}

interface EditableInputProps extends React.ComponentProps<"input"> {
  asChild?: boolean;
  maxLength?: number;
}

function EditableInput(props: EditableInputProps) {
  const {
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onKeyDown: onKeyDownProp,
    asChild,
    className,
    disabled,
    readOnly,
    required,
    maxLength,
    ref,
    ...inputProps
  } = props;

  const context = useEditableContext(INPUT_NAME);
  const store = useStoreContext(INPUT_NAME);
  const value = useStore((state) => state.value);
  const editing = useStore((state) => state.editing);
  const inputRef = React.useRef<InputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);

  const propsRef = useAsRef({
    onBlur: onBlurProp,
    onChange: onChangeProp,
    onKeyDown: onKeyDownProp,
  });

  const isDisabled = disabled || context.disabled;
  const isReadOnly = readOnly || context.readOnly;
  const isRequired = required || context.required;

  const onAutosize = React.useCallback(
    (target: InputElement) => {
      if (!context.autosize) return;

      if (target instanceof HTMLTextAreaElement) {
        target.style.height = "0";
        target.style.height = `${target.scrollHeight}px`;
      } else {
        target.style.width = "0";
        target.style.width = `${target.scrollWidth + 4}px`;
      }
    },
    [context.autosize],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<InputElement>) => {
      if (isDisabled || isReadOnly) return;

      propsRef.current.onBlur?.(event);
      if (event.defaultPrevented) return;

      const relatedTarget = event.relatedTarget;

      const isAction =
        relatedTarget instanceof HTMLElement &&
        (relatedTarget.closest(`[data-slot="editable-trigger"]`) ||
          relatedTarget.closest(`[data-slot="editable-cancel"]`));

      if (!isAction) {
        context.onSubmit(value);
      }
    },
    [value, context.onSubmit, propsRef, isDisabled, isReadOnly],
  );

  const onChange = React.useCallback(
    (event: React.ChangeEvent<InputElement>) => {
      if (isDisabled || isReadOnly) return;

      propsRef.current.onChange?.(event);
      if (event.defaultPrevented) return;

      store.setState("value", event.target.value);
      onAutosize(event.target);
    },
    [store, propsRef, onAutosize, isDisabled, isReadOnly],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<InputElement>) => {
      if (isDisabled || isReadOnly) return;

      propsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Escape") {
        const nativeEvent = event.nativeEvent;
        if (context.onEscapeKeyDown) {
          context.onEscapeKeyDown(nativeEvent);
          if (nativeEvent.defaultPrevented) return;
        }
        context.onCancel();
      } else if (event.key === "Enter") {
        context.onSubmit(value);
      }
    },
    [
      value,
      context.onSubmit,
      context.onCancel,
      context.onEscapeKeyDown,
      propsRef,
      isDisabled,
      isReadOnly,
    ],
  );

  useIsomorphicLayoutEffect(() => {
    if (!editing || isDisabled || isReadOnly || !inputRef.current) return;

    const frameId = window.requestAnimationFrame(() => {
      if (!inputRef.current) return;

      inputRef.current.focus();
      inputRef.current.select();
      onAutosize(inputRef.current);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [editing, onAutosize, isDisabled, isReadOnly]);

  const InputPrimitive = asChild ? SlotPrimitive.Slot : "input";

  if (!editing && !isReadOnly) return null;

  return (
    <InputPrimitive
      aria-required={isRequired}
      aria-invalid={context.invalid}
      data-slot="editable-input"
      dir={context.dir}
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      {...inputProps}
      id={context.inputId}
      aria-labelledby={context.labelId}
      ref={composedRef}
      maxLength={maxLength}
      placeholder={context.placeholder}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={cn(
        "flex rounded-sm border border-input bg-transparent py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        context.autosize ? "w-auto" : "w-full",
        className,
      )}
    />
  );
}

interface EditableTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  forceMount?: boolean;
}

function EditableTrigger(props: EditableTriggerProps) {
  const { asChild, forceMount = false, ref, ...triggerProps } = props;
  const context = useEditableContext(TRIGGER_NAME);
  const editing = useStore((state) => state.editing);

  const onTrigger = React.useCallback(() => {
    if (context.disabled || context.readOnly) return;
    context.onEdit();
  }, [context.disabled, context.readOnly, context.onEdit]);

  const TriggerPrimitive = asChild ? SlotPrimitive.Slot : "button";

  if (!forceMount && (editing || context.readOnly)) return null;

  return (
    <TriggerPrimitive
      type="button"
      aria-controls={context.rootId}
      aria-disabled={context.disabled || context.readOnly}
      data-disabled={context.disabled ? "" : undefined}
      data-readonly={context.readOnly ? "" : undefined}
      data-slot="editable-trigger"
      {...triggerProps}
      ref={ref}
      onClick={context.triggerMode === "click" ? onTrigger : undefined}
      onDoubleClick={context.triggerMode === "dblclick" ? onTrigger : undefined}
    />
  );
}

interface EditableToolbarProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  orientation?: "horizontal" | "vertical";
}

function EditableToolbar(props: EditableToolbarProps) {
  const {
    asChild,
    className,
    orientation = "horizontal",
    ref,
    ...toolbarProps
  } = props;
  const context = useEditableContext(TOOLBAR_NAME);

  const ToolbarPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ToolbarPrimitive
      role="toolbar"
      aria-controls={context.rootId}
      aria-orientation={orientation}
      data-slot="editable-toolbar"
      dir={context.dir}
      {...toolbarProps}
      ref={ref}
      className={cn(
        "flex items-center gap-2",
        orientation === "vertical" && "flex-col",
        className,
      )}
    />
  );
}

interface EditableCancelProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function EditableCancel(props: EditableCancelProps) {
  const { onClick: onClickProp, asChild, ref, ...cancelProps } = props;
  const context = useEditableContext(CANCEL_NAME);
  const editing = useStore((state) => state.editing);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (context.disabled || context.readOnly) return;

      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;

      context.onCancel();
    },
    [propsRef, context.onCancel, context.disabled, context.readOnly],
  );

  const CancelPrimitive = asChild ? SlotPrimitive.Slot : "button";

  if (!editing && !context.readOnly) return null;

  return (
    <CancelPrimitive
      type="button"
      aria-controls={context.rootId}
      data-slot="editable-cancel"
      {...cancelProps}
      onClick={onClick}
      ref={ref}
    />
  );
}

interface EditableSubmitProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function EditableSubmit(props: EditableSubmitProps) {
  const { onClick: onClickProp, asChild, ref, ...submitProps } = props;
  const context = useEditableContext(SUBMIT_NAME);
  const value = useStore((state) => state.value);
  const editing = useStore((state) => state.editing);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const onClick = React.useCallback(
    (event: React.MouseEvent<SubmitElement>) => {
      if (context.disabled || context.readOnly) return;

      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;

      context.onSubmit(value);
    },
    [propsRef, context.onSubmit, value, context.disabled, context.readOnly],
  );

  const SubmitPrimitive = asChild ? SlotPrimitive.Slot : "button";

  if (!editing && !context.readOnly) return null;

  return (
    <SubmitPrimitive
      type="button"
      aria-controls={context.rootId}
      data-slot="editable-submit"
      {...submitProps}
      ref={ref}
      onClick={onClick}
    />
  );
}

export {
  Editable,
  EditableLabel,
  EditableArea,
  EditablePreview,
  EditableInput,
  EditableTrigger,
  EditableToolbar,
  EditableCancel,
  EditableSubmit,
  //
  useStore as useEditable,
  //
  type EditableProps,
};
