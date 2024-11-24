import { createContextScope } from "@radix-ui/react-context";
import { useDirection } from "@radix-ui/react-direction";
import { Primitive } from "@radix-ui/react-primitive";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";
import { composeRefs } from "./compose-refs";

type Direction = "ltr" | "rtl";

type Scope = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
};

type ScopedProps<P> = P & { __scopeTagsInput?: Scope };

/* -------------------------------------------------------------------------------------------------
 * TagsInput
 * -----------------------------------------------------------------------------------------------*/

const TAGS_INPUT_NAME = "TagsInput";

const [createTagsInputContext, createTagsInputScope] =
  createContextScope(TAGS_INPUT_NAME);

type TagsInputContextValue = {
  value: string[];
  onValueChange(value: string[]): void;
  disabled?: boolean;
  onItemDelete(value: string): void;
  dir?: Direction;
};

const [TagsInputProvider, useTagsInputContext] =
  createTagsInputContext<TagsInputContextValue>(TAGS_INPUT_NAME);

interface TagsInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?(value: string[]): void;
  dir?: Direction;
  disabled?: boolean;
  children?: React.ReactNode;
}

const TagsInputRoot = React.forwardRef<HTMLDivElement, TagsInputProps>(
  (props: ScopedProps<TagsInputProps>, forwardedRef) => {
    const {
      __scopeTagsInput,
      value: valueProp,
      defaultValue,
      onValueChange,
      dir,
      disabled = false,
      children,
      ...tagInputProps
    } = props;
    const direction = useDirection(dir);
    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const onItemDelete = React.useCallback(
      (itemValue: string) => {
        if (!disabled) {
          setValue(value.filter((v) => v !== itemValue));
        }
      },
      [disabled, setValue, value],
    );

    return (
      <TagsInputProvider
        scope={__scopeTagsInput}
        value={value}
        onValueChange={setValue}
        onItemDelete={onItemDelete}
        dir={direction}
        disabled={disabled}
      >
        <Primitive.div {...tagInputProps} ref={forwardedRef}>
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

const INPUT_NAME = "TagsInputInput";

interface TagsInputInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {
  onAdd?(value: string): void;
}

const TagsInputInput = React.forwardRef<HTMLInputElement, TagsInputInputProps>(
  (props: ScopedProps<TagsInputInputProps>, forwardedRef) => {
    const { __scopeTagsInput, onAdd, onKeyDown, ...controlProps } = props;

    return <Primitive.input {...controlProps} ref={forwardedRef} />;
  },
);

TagsInputInput.displayName = INPUT_NAME;

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
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    return (
      <TagsInputItemProvider scope={__scopeTagsInput} value={value}>
        <Primitive.div
          {...itemProps}
          ref={forwardedRef}
          data-tag-item=""
          tabIndex={0}
          data-disabled={context.disabled ? "" : undefined}
          onKeyDown={(event) => {
            if (event.key === "Backspace" || event.key === "Delete") {
              context.onItemDelete(value);
              const items = Array.from(
                document.querySelectorAll("[data-tag-item]"),
              );
              const currentIndex = items.indexOf(event.currentTarget);
              const prevItem = items[currentIndex - 1] as HTMLElement;
              if (prevItem) {
                prevItem.focus();
              } else if (inputRef.current) {
                inputRef.current.focus();
              }
              event.preventDefault();
            } else if (event.key === "Enter") {
              // Enter edit mode (if implemented)
              // This would require additional state management
            }
          }}
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
  createTagsInputScope,
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
};
export type {
  TagInputItemDeleteProps,
  TagsInputClearProps,
  TagsInputInputProps,
  TagsInputItemProps,
  TagsInputItemTextProps,
  TagsInputProps,
};
