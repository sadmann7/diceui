import { composeEventHandlers } from "@radix-ui/primitive";
import { createCollection } from "@radix-ui/react-collection";
import { composeRefs, useComposedRefs } from "@radix-ui/react-compose-refs";
import { createContextScope } from "@radix-ui/react-context";
import { Primitive } from "@radix-ui/react-primitive";
import { useCallbackRef } from "@radix-ui/react-use-callback-ref";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";

/* -------------------------------------------------------------------------------------------------
 * TagsInput
 * -----------------------------------------------------------------------------------------------*/

const TAGS_INPUT_NAME = "TagsInput";

type Scope = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
};

type ScopedProps<P> = P & { __scopeTagsInput?: Scope };

const [createTagsInputContext, createTagsInputScope] =
  createContextScope(TAGS_INPUT_NAME);

type TagsInputContextValue = {
  value: string[];
  onValueChange(value: string[]): void;
  disabled?: boolean;
  onItemDelete(value: string): void;
  selectedElement: React.MutableRefObject<HTMLElement | null>;
  isInvalidInput: boolean;
  setIsInvalidInput(value: boolean): void;
  addOnPaste: boolean;
  addOnTab: boolean;
  addOnBlur: boolean;
  delimiter: string;
  dir: "ltr" | "rtl";
  max: number;
  duplicate: boolean;
  displayValue(value: string): string;
  handleInputKeydown(event: KeyboardEvent): void;
};

const [TagsInputProvider, useTagsInputContext] =
  createTagsInputContext<TagsInputContextValue>(TAGS_INPUT_NAME);

interface TagsInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?(value: string[]): void;
  disabled?: boolean;
  addOnPaste?: boolean;
  addOnTab?: boolean;
  addOnBlur?: boolean;
  delimiter?: string;
  dir?: "ltr" | "rtl";
  max?: number;
  duplicate?: boolean;
  displayValue?: (value: string) => string;
  children?: React.ReactNode;
}

// Add utility function for array navigation
function getNextIndex(current: number, total: number, delta: number) {
  const next = current + delta;
  if (next < 0) return total - 1;
  if (next >= total) return 0;
  return next;
}

const TagsInputRoot = React.forwardRef<HTMLDivElement, TagsInputProps>(
  (props: ScopedProps<TagsInputProps>, forwardedRef) => {
    const {
      __scopeTagsInput,
      value: valueProp,
      defaultValue,
      onValueChange,
      disabled = false,
      addOnPaste = false,
      addOnTab = false,
      addOnBlur = false,
      delimiter = ",",
      dir = "ltr",
      max = 0,
      duplicate = false,
      displayValue = (v) => v,
      children,
      ...tagInputProps
    } = props;

    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [isInvalidInput, setIsInvalidInput] = React.useState(false);
    const selectedElement = React.useRef<HTMLElement | null>(null);
    const rootRef = React.useRef<HTMLDivElement>(null);

    const onItemDelete = React.useCallback(
      (itemValue: string) => {
        if (!disabled) {
          setValue(value.filter((v) => v !== itemValue));
        }
      },
      [disabled, setValue, value],
    );

    const handleInputKeydown = React.useCallback(
      (event: KeyboardEvent) => {
        const target = event.target as HTMLInputElement;
        const tagItems = Array.from(
          rootRef.current?.querySelectorAll(
            "[data-tag-item]:not([data-disabled])",
          ) || [],
        ) as HTMLElement[];

        if (!tagItems.length) return;

        const lastTag = tagItems[tagItems.length - 1];
        const isRTL = dir === "rtl";

        switch (event.key) {
          case "Delete":
          case "Backspace": {
            if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

            if (selectedElement.current) {
              const index = tagItems.indexOf(selectedElement.current);
              if (value[index]) {
                onItemDelete(value[index]);
                selectedElement.current =
                  (selectedElement.current === lastTag
                    ? tagItems[index - 1]
                    : tagItems[index + 1]) ?? null;
                event.preventDefault();
              }
            } else if (event.key === "Backspace") {
              selectedElement.current = lastTag ?? null;
              event.preventDefault();
            }
            break;
          }
          case "Home":
          case "End":
          case "ArrowRight":
          case "ArrowLeft": {
            const isArrowRight =
              (event.key === "ArrowRight" && !isRTL) ||
              (event.key === "ArrowLeft" && isRTL);
            const isArrowLeft = !isArrowRight;

            if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

            if (isArrowLeft && !selectedElement.current) {
              selectedElement.current = lastTag ?? null;
              event.preventDefault();
            } else if (isArrowRight && selectedElement.current === lastTag) {
              selectedElement.current = null;
              event.preventDefault();
            } else if (selectedElement.current) {
              const currentIndex = tagItems.indexOf(selectedElement.current);
              const delta = isArrowRight ? 1 : -1;
              const nextIndex = getNextIndex(
                currentIndex,
                tagItems.length,
                delta,
              );
              selectedElement.current = tagItems[nextIndex] ?? null;
              event.preventDefault();
            }
            break;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (selectedElement.current) event.preventDefault();
            break;
          }
          default: {
            selectedElement.current = null;
          }
        }
      },
      [dir, onItemDelete, value],
    );

    return (
      <TagsInputProvider
        scope={__scopeTagsInput}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        onItemDelete={onItemDelete}
        selectedElement={selectedElement}
        isInvalidInput={isInvalidInput}
        setIsInvalidInput={setIsInvalidInput}
        addOnPaste={addOnPaste}
        addOnTab={addOnTab}
        addOnBlur={addOnBlur}
        delimiter={delimiter}
        dir={dir}
        max={max}
        duplicate={duplicate}
        displayValue={displayValue}
        handleInputKeydown={handleInputKeydown}
      >
        <Primitive.div
          {...tagInputProps}
          ref={composeRefs(forwardedRef, rootRef)}
          data-invalid={isInvalidInput ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
        >
          {children}
        </Primitive.div>
      </TagsInputProvider>
    );
  },
);

TagsInputRoot.displayName = TAGS_INPUT_NAME;

/* -------------------------------------------------------------------------------------------------
 * TagsInputInput
 * -----------------------------------------------------------------------------------------------*/

const CONTROL_NAME = "TagsInputInput";

interface TagsInputControlProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {
  onAdd?(value: string): void;
}

const TagsInputInput = React.forwardRef<
  HTMLInputElement,
  TagsInputControlProps
>((props: ScopedProps<TagsInputControlProps>, forwardedRef) => {
  const {
    __scopeTagsInput,
    onAdd,
    onKeyDown,
    onBlur,
    onPaste,
    ...controlProps
  } = props;

  const context = useTagsInputContext(CONTROL_NAME, __scopeTagsInput);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleAdd = useCallbackRef((value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !context.disabled) {
      if (context.max && context.value.length >= context.max) {
        context.setIsInvalidInput(true);
        return false;
      }

      if (context.duplicate || !context.value.includes(trimmedValue)) {
        context.onValueChange([...context.value, trimmedValue]);
        onAdd?.(trimmedValue);
        context.setIsInvalidInput(false);
        return true;
      }
      context.setIsInvalidInput(true);
    }
    return false;
  });

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (!context.addOnBlur) return;

      const target = event.target;
      if (!target.value) return;

      const isAdded = handleAdd(target.value);
      if (isAdded) target.value = "";
    },
    [context.addOnBlur, handleAdd],
  );

  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (!context.addOnPaste) return;

      event.preventDefault();
      const value = event.clipboardData.getData("text");

      if (context.delimiter) {
        for (const v of value.split(context.delimiter)) {
          if (v.trim()) handleAdd(v);
        }
      } else {
        handleAdd(value);
      }
    },
    [context.addOnPaste, context.delimiter, handleAdd],
  );

  return (
    <Primitive.input
      {...controlProps}
      ref={composeRefs(forwardedRef, inputRef)}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        context.handleInputKeydown(event.nativeEvent);

        if (event.key === "Enter" && event.currentTarget.value) {
          const isAdded = handleAdd(event.currentTarget.value);
          if (isAdded) event.currentTarget.value = "";
          event.preventDefault();
        } else if (
          event.key === "Tab" &&
          context.addOnTab &&
          event.currentTarget.value
        ) {
          const isAdded = handleAdd(event.currentTarget.value);
          if (isAdded) event.currentTarget.value = "";
        }
      })}
      onBlur={composeEventHandlers(onBlur, handleBlur)}
      onPaste={composeEventHandlers(onPaste, handlePaste)}
      disabled={context.disabled}
      data-invalid={context.isInvalidInput ? "" : undefined}
    />
  );
});

TagsInputInput.displayName = CONTROL_NAME;

/* -------------------------------------------------------------------------------------------------
 * TagsInputItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "TagsInputItem";

type TagsInputItemContextValue = {
  value: string;
};

const [TagsInputItemProvider, useTagsInputItemContext] =
  createTagsInputContext<TagsInputItemContextValue>(ITEM_NAME);

interface TagsInputItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
}

const TagsInputItem = React.forwardRef<HTMLDivElement, TagsInputItemProps>(
  (props: ScopedProps<TagsInputItemProps>, forwardedRef) => {
    const { __scopeTagsInput, value, children, ...itemProps } = props;
    const context = useTagsInputContext(ITEM_NAME, __scopeTagsInput);
    const itemRef = React.useRef<HTMLDivElement>(null);

    const isSelected = context.selectedElement.current === itemRef.current;

    return (
      <TagsInputItemProvider scope={__scopeTagsInput} value={value}>
        <Primitive.div
          {...itemProps}
          ref={composeRefs(forwardedRef, itemRef)}
          data-tag-item=""
          tabIndex={0}
          data-disabled={context.disabled ? "" : undefined}
          data-selected={isSelected ? "" : undefined}
          aria-selected={isSelected}
        >
          {children}
        </Primitive.div>
      </TagsInputItemProvider>
    );
  },
);

TagsInputItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * TagsInputItemText
 * -----------------------------------------------------------------------------------------------*/

const ITEM_TEXT_NAME = "TagsInputItemText";

interface TagsInputItemTextProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const TagsInputItemText = React.forwardRef<
  HTMLSpanElement,
  TagsInputItemTextProps
>((props: ScopedProps<TagsInputItemTextProps>, forwardedRef) => {
  const { __scopeTagsInput, ...textProps } = props;

  return <Primitive.span {...textProps} ref={forwardedRef} />;
});

TagsInputItemText.displayName = ITEM_TEXT_NAME;

/* -------------------------------------------------------------------------------------------------
 * TagsInputItemDelete
 * -----------------------------------------------------------------------------------------------*/

const ITEM_DELETE_NAME = "TagsInputItemDelete";

interface TagInputItemDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {
  // removed value prop
}

const TagsInputItemDelete = React.forwardRef<
  HTMLButtonElement,
  TagInputItemDeleteProps
>((props: ScopedProps<TagInputItemDeleteProps>, forwardedRef) => {
  const { __scopeTagsInput, ...triggerProps } = props;
  const context = useTagsInputContext(ITEM_DELETE_NAME, __scopeTagsInput);
  const itemContext = useTagsInputItemContext(
    ITEM_DELETE_NAME,
    __scopeTagsInput,
  );

  return (
    <Primitive.button
      type="button"
      {...triggerProps}
      ref={forwardedRef}
      disabled={context.disabled}
      onClick={() => context.onItemDelete(itemContext.value)}
    />
  );
});

TagsInputItemDelete.displayName = ITEM_DELETE_NAME;

/* -------------------------------------------------------------------------------------------------
 * TagsInputClear
 * -----------------------------------------------------------------------------------------------*/

const CLEAR_NAME = "TagsInputClear";

interface TagsInputClearProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const TagsInputClear = React.forwardRef<HTMLButtonElement, TagsInputClearProps>(
  (props: ScopedProps<TagsInputClearProps>, forwardedRef) => {
    const { __scopeTagsInput, ...clearProps } = props;
    const context = useTagsInputContext(CLEAR_NAME, __scopeTagsInput);

    return (
      <Primitive.button
        type="button"
        {...clearProps}
        ref={forwardedRef}
        disabled={context.disabled}
        onClick={() => context.onValueChange([])}
      />
    );
  },
);

TagsInputClear.displayName = CLEAR_NAME;

/* -------------------------------------------------------------------------------------------------
 * Export
 * -----------------------------------------------------------------------------------------------*/

export {
  TagsInputRoot,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemText,
  TagsInputItemDelete,
  TagsInputClear,
  createTagsInputScope,
};
export type {
  TagsInputProps,
  TagsInputControlProps,
  TagsInputItemProps,
  TagsInputItemTextProps,
  TagInputItemDeleteProps,
  TagsInputClearProps,
};
