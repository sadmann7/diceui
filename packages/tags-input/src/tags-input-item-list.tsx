import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

interface TagsInputItemListProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const TagsInputItemList = React.forwardRef<
  HTMLDivElement,
  TagsInputItemListProps
>((props, ref) => {
  const context = useTagsInput();

  return (
    <Primitive.div
      ref={ref}
      data-disabled={context.disabled ? "" : undefined}
      {...props}
    />
  );
});

TagsInputItemList.displayName = "TagsInputItemList";

const ItemList = TagsInputItemList;

export { ItemList, TagsInputItemList };

export type { TagsInputItemListProps };
