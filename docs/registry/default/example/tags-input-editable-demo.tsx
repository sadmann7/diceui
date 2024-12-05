"use client";

import * as React from "react";

import {
  TagsInput,
  TagsInputClear,
  TagsInputContent,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
} from "@/registry/default/ui/tags-input";

export default function TagsInputEditableDemo() {
  const [tricks, setTricks] = React.useState([
    "Kickflip",
    "Heelflip",
    "FS 540",
  ]);

  return (
    <TagsInput value={tricks} onValueChange={setTricks} editable addOnPaste>
      <TagsInputLabel>Tricks</TagsInputLabel>
      <TagsInputContent>
        {tricks.map((trick) => (
          <TagsInputItem key={trick} value={trick}>
            {trick}
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder="Add trick..." />
      </TagsInputContent>
      <TagsInputClear>Clear</TagsInputClear>
    </TagsInput>
  );
}
