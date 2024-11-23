"use client";

import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from "@diceui/tags-input";
import * as React from "react";

import { Shell } from "@/components/shell";

export default function PlaygroundPage() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInputRoot
        value={value}
        onValueChange={setValue}
        className="w-40 border"
      >
        {value.map((item) => (
          <TagsInputItem key={item} value={item}>
            <TagsInputItemText>{item}</TagsInputItemText>
            <TagsInputItemDelete>×</TagsInputItemDelete>
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder="Add item..." />
      </TagsInputRoot>
    </Shell>
  );
}
