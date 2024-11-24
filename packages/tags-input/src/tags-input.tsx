import { Primitive } from "@radix-ui/react-primitive";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";

interface TagsInputContextProps {
  value: string[];
  onValueChange(value: string[]): void;
  onCreateTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}

const TagsInputContext = React.createContext<TagsInputContextProps | undefined>(
  undefined,
);

interface TagsInputRootProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
}

export const TagsInputRoot = React.forwardRef<
  HTMLDivElement,
  TagsInputRootProps
>((rootProps, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    className,
    children,
    ...props
  } = rootProps;

  const [value = [], setValue] = useControllableState({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange,
  });

  const onCreateTag = React.useCallback(
    (tag: string) => {
      if (!value.includes(tag)) {
        setValue([...value, tag]);
      }
    },
    [value, setValue],
  );

  const onDeleteTag = React.useCallback(
    (tag: string) => {
      setValue(value.filter((t) => t !== tag));
    },
    [value, setValue],
  );

  return (
    <TagsInputContext.Provider
      value={{
        value,
        onValueChange: setValue,
        onCreateTag,
        onDeleteTag,
      }}
    >
      <Primitive.div ref={forwardedRef} className={className} {...props}>
        {children}
      </Primitive.div>
    </TagsInputContext.Provider>
  );
});

TagsInputRoot.displayName = "TagsInputRoot";

interface TagsInputInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {
  onBlurAdd?: boolean;
  onKeyDownAdd?: boolean;
}

export const TagsInputInput = React.forwardRef<
  HTMLInputElement,
  TagsInputInputProps
>((props, forwardedRef) => {
  const {
    placeholder,
    onBlurAdd = true,
    onKeyDownAdd = true,
    className,
    ...inputProps
  } = props;
  const context = useTagsInputContext();
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      event.preventDefault();
      if (inputValue.trim()) {
        context.onCreateTag(inputValue.trim());
        setInputValue("");
      }
    }
  };

  const handleBlur = () => {
    if (onBlurAdd && inputValue.trim()) {
      context.onCreateTag(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <Primitive.input
      ref={forwardedRef}
      className={className}
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={onKeyDownAdd ? handleKeyDown : undefined}
      onBlur={onBlurAdd ? handleBlur : undefined}
      {...inputProps}
    />
  );
});

TagsInputInput.displayName = "TagsInputInput";

const useTagsInputContext = () => {
  const context = React.useContext(TagsInputContext);
  if (!context) {
    throw new Error("TagsInput components must be used within a TagsInputRoot");
  }
  return context;
};

interface TagsInputItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
  disabled?: boolean;
}

interface TagsInputItemContextProps {
  value: string;
  index: number;
  disabled: boolean;
}

const TagsInputItemContext = React.createContext<
  TagsInputItemContextProps | undefined
>(undefined);

export const TagsInputItem = React.forwardRef<
  HTMLDivElement,
  TagsInputItemProps
>((props, forwardedRef) => {
  const { value, children, disabled = false, className, ...itemProps } = props;
  const context = useTagsInputContext();
  const index = context.value.indexOf(value);
  const currentValue = context.value[index];
  const isSelected = currentValue === value;

  return (
    <TagsInputItemContext.Provider value={{ value, index, disabled }}>
      <Primitive.div
        ref={forwardedRef}
        className={className}
        data-value={value}
        data-selected={isSelected ? "" : undefined}
        {...itemProps}
      >
        {children}
      </Primitive.div>
    </TagsInputItemContext.Provider>
  );
});

TagsInputItem.displayName = "TagsInputItem";

const useTagsInputItemContext = () => {
  const context = React.useContext(TagsInputItemContext);
  if (!context) {
    throw new Error("TagsInputItemDelete must be used within a TagsInputItem");
  }
  return context;
};

interface TagsInputItemTextProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

export const TagsInputItemText = React.forwardRef<
  HTMLSpanElement,
  TagsInputItemTextProps
>((props, forwardedRef) => <Primitive.span ref={forwardedRef} {...props} />);

TagsInputItemText.displayName = "TagsInputItemText";

interface TagsInputItemDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

export const TagsInputItemDelete = React.forwardRef<
  HTMLButtonElement,
  TagsInputItemDeleteProps
>((props, forwardedRef) => {
  const context = useTagsInputContext();
  const { value } = useTagsInputItemContext();

  return (
    <Primitive.button
      ref={forwardedRef}
      type="button"
      tabIndex={-1}
      onClick={() => context.onDeleteTag(value)}
      aria-label={`Remove ${value}`}
      {...props}
    />
  );
});

TagsInputItemDelete.displayName = "TagsInputItemDelete";
