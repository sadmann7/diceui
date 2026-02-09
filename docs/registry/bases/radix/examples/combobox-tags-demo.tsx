"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/registry/bases/radix/ui/combobox";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
} from "@/registry/bases/radix/ui/tags-input";

const tricks = [
  "Kickflip",
  "Heelflip",
  "Tre Flip",
  "FS 540",
  "Casper flip 360 flip",
  "Kickflip Backflip",
  "360 Varial McTwist",
  "The 900",
];

export default function ComboboxTagsDemo() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Combobox value={value} onValueChange={setValue} multiple>
      <ComboboxAnchor asChild>
        <TagsInput
          className="relative flex h-full min-h-10 w-[400px] flex-row flex-wrap items-center justify-start gap-1.5 px-2.5 py-2"
          value={value}
          onValueChange={setValue}
        >
          {value.map((item) => (
            <TagsInputItem key={item} value={item}>
              {item}
            </TagsInputItem>
          ))}
          <ComboboxInput className="h-fit flex-1 p-0" asChild>
            <TagsInputInput placeholder="Tricks..." />
          </ComboboxInput>
          <ComboboxTrigger className="absolute top-2.5 right-2">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </ComboboxTrigger>
        </TagsInput>
      </ComboboxAnchor>
      <ComboboxContent sideOffset={5}>
        <ComboboxEmpty>No tricks found.</ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxGroupLabel>Tricks</ComboboxGroupLabel>
          {tricks.map((trick) => (
            <ComboboxItem key={trick} value={trick} outset>
              {trick}
            </ComboboxItem>
          ))}
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  );
}
