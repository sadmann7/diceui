import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { type InputValue, useTagsInput } from "./tags-input-root";

interface TagsInputItemListProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "children"
  > {
  children?: ((value: InputValue[]) => React.ReactNode) | React.ReactNode;
}

const TagsInputItemList = React.forwardRef<
  HTMLDivElement,
  TagsInputItemListProps
>((props, ref) => {
  const { children, ...tagsInputItemListProps } = props;
  const context = useTagsInput();

  return (
    <Primitive.div
      ref={ref}
      data-disabled={context.disabled ? "" : undefined}
      {...tagsInputItemListProps}
    >
      {typeof children === "function" ? (
        <>{children(context.value)}</>
      ) : (
        children
      )}
    </Primitive.div>
  );
});

TagsInputItemList.displayName = "TagsInputItemList";

const ItemList = TagsInputItemList;

export { ItemList, TagsInputItemList };

export type { TagsInputItemListProps };
