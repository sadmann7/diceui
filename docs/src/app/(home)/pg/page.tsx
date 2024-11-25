"use client";

import * as React from "react";

import {
  TagsInput,
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemList,
  TagsInputLabel,
} from "@/components/ui/tags-input";

import { Shell } from "@/components/shell";

export default function PlaygroundPage() {
  const [fruits, setFruits] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInput value={fruits} onValueChange={setFruits} addOnPaste>
        <TagsInputLabel>Fruits</TagsInputLabel>
        <TagsInputItemList>
          {fruits.map((fruit, index) => (
            <TagsInputItem key={index.toString()} value={fruit}>
              {fruit}
            </TagsInputItem>
          ))}
          <TagsInputInput placeholder="Add fruit..." />
        </TagsInputItemList>
        <TagsInputClear />
      </TagsInput>
    </Shell>
  );
}
