import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

interface TagsInputContextProps {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
}

const TagsInputContext = React.createContext<TagsInputContextProps | undefined>(
  undefined,
);

interface TagsInputRootProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string[];
  onValueChange: (value: string[]) => void;
}

export const TagsInputRoot = React.forwardRef<
  HTMLDivElement,
  TagsInputRootProps
>(({ value, onValueChange, children, className, ...props }, forwardedRef) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const addTag = React.useCallback(
    (tag: string) => {
      if (!value.includes(tag)) {
        onValueChange([...value, tag]);
      }
    },
    [value, onValueChange],
  );

  const removeTag = React.useCallback(
    (tag: string) => {
      onValueChange(value.filter((t) => t !== tag));
    },
    [value, onValueChange],
  );

  return (
    <TagsInputContext.Provider
      value={{
        tags: value,
        addTag,
        removeTag,
        selectedIndex,
        setSelectedIndex,
      }}
    >
      <Primitive.div ref={forwardedRef} className={className} {...props}>
        {children}
      </Primitive.div>
    </TagsInputContext.Provider>
  );
});

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
}

interface TagsInputItemContextProps {
  value: string;
  index: number;
}

const TagsInputItemContext = React.createContext<
  TagsInputItemContextProps | undefined
>(undefined);

export const TagsInputItem = React.forwardRef<
  HTMLDivElement,
  TagsInputItemProps
>(({ value, children, className, ...props }, forwardedRef) => {
  const { tags, removeTag, selectedIndex, setSelectedIndex } =
    useTagsInputContext();
  const index = tags.indexOf(value);
  const isSelected = selectedIndex === index;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Backspace" && isSelected) {
      event.preventDefault();
      removeTag(value);
      setSelectedIndex(index > 0 ? index - 1 : null);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSelectedIndex(index > 0 ? index - 1 : null);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setSelectedIndex(index < tags.length - 1 ? index + 1 : null);
    }
  };

  const handleClick = () => {
    setSelectedIndex(index);
  };

  return (
    <TagsInputItemContext.Provider value={{ value, index }}>
      <Primitive.div
        ref={forwardedRef}
        className={className}
        data-value={value}
        data-selected={isSelected ? "" : undefined}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Primitive.div>
    </TagsInputItemContext.Provider>
  );
});

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

interface TagsInputItemDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

export const TagsInputItemDelete = React.forwardRef<
  HTMLButtonElement,
  TagsInputItemDeleteProps
>((props, forwardedRef) => {
  const { removeTag } = useTagsInputContext();
  const { value } = useTagsInputItemContext();

  return (
    <Primitive.button
      ref={forwardedRef}
      type="button"
      tabIndex={-1}
      onClick={() => removeTag(value)}
      aria-label={`Remove ${value}`}
      {...props}
    />
  );
});

interface TagsInputInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {
  onBlurAdd?: boolean;
  onKeyDownAdd?: boolean;
}

export const TagsInputInput = React.forwardRef<
  HTMLInputElement,
  TagsInputInputProps
>(
  (
    { placeholder, onBlurAdd = true, onKeyDownAdd = true, className, ...props },
    forwardedRef,
  ) => {
    const { addTag, setSelectedIndex } = useTagsInputContext();
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
        event.preventDefault();
        if (inputValue.trim()) {
          addTag(inputValue.trim());
          setInputValue("");
        }
      }
      if (event.key === "Backspace" && inputValue === "") {
        setSelectedIndex(null);
      }
    };

    const handleBlur = () => {
      if (onBlurAdd && inputValue.trim()) {
        addTag(inputValue.trim());
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
        {...props}
      />
    );
  },
);

// Add display names
TagsInputRoot.displayName = "TagsInputRoot";
TagsInputItem.displayName = "TagsInputItem";
TagsInputItemText.displayName = "TagsInputItemText";
TagsInputItemDelete.displayName = "TagsInputItemDelete";
TagsInputInput.displayName = "TagsInputInput";
