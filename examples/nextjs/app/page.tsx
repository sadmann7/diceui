"use client";

import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from "@diceui/tags-input";
import * as React from "react";

export default function IndexPage() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <TagsInputRoot value={value} onValueChange={setValue}>
      {value.map((item) => (
        <TagsInputItem key={item} value={item}>
          <TagsInputItemText>{item}</TagsInputItemText>
          <TagsInputItemDelete>×</TagsInputItemDelete>
        </TagsInputItem>
      ))}
      <TagsInputInput placeholder="Add item..." />
    </TagsInputRoot>
  );
}
