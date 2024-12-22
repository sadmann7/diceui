"use client";

import { Shell } from "@/components/shell";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tricks } from "@/lib/data";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import * as ComboboxPrimitive from "@diceui/combobox";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

export default function PlaygroundPage() {
  const [selectedTrick, setSelectedTrick] = React.useState<string | undefined>(
    undefined,
  );
  // console.log({ selectedTrick });

  return (
    <Shell>
      <ComboboxPrimitive.Root
        className="max-w-[15rem]"
        value={selectedTrick}
        onValueChange={setSelectedTrick}
      >
        <ComboboxPrimitive.Anchor>
          <ComboboxPrimitive.Input placeholder="Search tricks..." />
        </ComboboxPrimitive.Anchor>
        <ComboboxPrimitive.Positioner>
          <ComboboxPrimitive.Content className="max-w-[15rem]">
            <ComboboxPrimitive.Empty>No tricks found</ComboboxPrimitive.Empty>
            {tricks.map((trick) => (
              <ComboboxPrimitive.Item
                key={trick.value}
                value={trick.value}
                className="flex items-center gap-2 pr-2 pl-8"
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <ComboboxPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </span>
                {trick.label}
              </ComboboxPrimitive.Item>
            ))}
          </ComboboxPrimitive.Content>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Root>
      <Combobox
        value={selectedTrick}
        onValueChange={setSelectedTrick}
        className="w-[15rem]"
      >
        <ComboboxAnchor>
          <ComboboxInput placeholder="Search tricks..." />
          <ComboboxTrigger>
            <ChevronDown className="h-4 w-4" />
          </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxContent
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <ComboboxEmpty>No tricks found</ComboboxEmpty>
          {tricks.map((trick) => (
            <ComboboxItem key={trick.value} value={trick.value}>
              {trick.label}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
      <Select>
        <SelectTrigger className="w-[11.25rem]">
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
