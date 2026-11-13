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
    <div className="flex flex-1 flex-col justify-center p-5">
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
    </div>
  );
}
