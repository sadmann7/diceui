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

export function TagsInputEditableDemo() {
  const [fruits, setFruits] = React.useState(["Apple", "Banana", "Cherry"]);

  return (
    <TagsInput value={fruits} onValueChange={setFruits} addOnPaste editable>
      <TagsInputLabel>Editable</TagsInputLabel>
      <TagsInputContent>
        {fruits.map((fruit) => (
          <TagsInputItem key={fruit} value={fruit}>
            {fruit}
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder="Add fruit..." />
      </TagsInputContent>
      <TagsInputClear />
    </TagsInput>
  );
}
