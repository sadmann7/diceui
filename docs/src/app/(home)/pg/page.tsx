"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TagsInput,
  TagsInputClear,
  TagsInputContent,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
} from "@/components/ui/tags-input";
import * as React from "react";

import { Shell } from "@/components/shell";

export default function PlaygroundPage() {
  const [fruits, setFruits] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInput
        value={fruits}
        onValueChange={(value) => setFruits(value as string[])}
        editable
      >
        <TagsInputLabel>Fruits</TagsInputLabel>
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
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Shell>
  );
}
