"use client";

import * as React from "react";

import {
  TagsInput,
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
} from "@/components/ui/tags-input";

import { Shell } from "@/components/shell";

export default function PlaygroundPage() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInput value={value} onValueChange={setValue} editable>
        {value.map((item) => (
          <TagsInputItem key={item} value={item}>
            {item}
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder="Add item..." />
        {value.length > 0 && <TagsInputClear />}
      </TagsInput>
    </Shell>
  );
}
