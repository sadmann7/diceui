"use client";

import {
  TagsInput,
  TagsInputClear,
  TagsInputContent,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
} from "@/components/ui/tags-input";

export function TagsInputDemo() {
  return (
    <TagsInput>
      <TagsInputLabel>Fruits</TagsInputLabel>
      <TagsInputContent>
        {({ value }) => (
          <>
            {value.map((item) => (
              <TagsInputItem key={item} value={item}>
                {item}
              </TagsInputItem>
            ))}
            <TagsInputInput placeholder="Add fruit..." />
          </>
        )}
      </TagsInputContent>
      <TagsInputClear />
    </TagsInput>
  );
}
