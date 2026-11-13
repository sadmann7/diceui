"use client";

import * as React from "react";

import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@/registry/bases/base/ui/tags-input";

export default function TagsInputPreview() {
  const [tags, setTags] = React.useState([
    "react",
    "typescript",
    "tailwindcss",
  ]);

  return (
    <div className="mx-auto flex w-full max-w-xs flex-1 flex-col justify-center py-5">
      <TagsInput
        value={tags}
        onValueChange={setTags}
        editable
        className="w-full"
      >
        <TagsInputLabel>Stack</TagsInputLabel>
        <TagsInputList>
          {tags.map((tag) => (
            <TagsInputItem key={tag} value={tag}>
              {tag}
            </TagsInputItem>
          ))}
          <TagsInputInput placeholder="Add…" />
        </TagsInputList>
      </TagsInput>
      <p className="pt-3 text-xs text-muted-foreground">
        Enter to add, Backspace to remove, double-click to edit.
      </p>
    </div>
  );
}
