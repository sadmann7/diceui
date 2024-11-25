"use client";

import * as React from "react";

import {
  TagsInput,
  TagsInputClear,
  TagsInputContent,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
} from "@/components/ui/tags-input";

import { Shell } from "@/components/shell";

export default function PlaygroundPage() {
  const [fruits, setFruits] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInput value={fruits} onValueChange={setFruits} addOnPaste>
        <TagsInputLabel>Fruits</TagsInputLabel>
        <TagsInputContent>
          {fruits.map((fruit, index) => (
            <TagsInputItem key={index.toString()} value={fruit}>
              {fruit}
            </TagsInputItem>
          ))}
          <TagsInputInput placeholder="Add fruit..." />
        </TagsInputContent>
        <TagsInputClear />
      </TagsInput>
    </Shell>
  );
}
