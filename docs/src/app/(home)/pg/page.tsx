"use client";

import * as React from "react";

import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
} from "@/components/ui/tags-input";

import { Shell } from "@/components/shell";

export default function PlaygroundPage() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInput value={value} onValueChange={setValue}>
        {value.map((item, index) => (
          <TagsInputItem key={item} value={item} index={index}>
            {item}
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder="Add item..." />
      </TagsInput>
    </Shell>
  );
}
