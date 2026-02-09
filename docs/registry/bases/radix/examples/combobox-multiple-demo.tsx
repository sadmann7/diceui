"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxBadgeItem,
  ComboboxBadgeList,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxTrigger,
} from "@/registry/bases/radix/ui/combobox";

const tricks = [
  { label: "Kickflip", value: "kickflip" },
  { label: "Heelflip", value: "heelflip" },
  { label: "Tre Flip", value: "tre-flip" },
  { label: "FS 540", value: "fs-540" },
  { label: "Casper flip 360 flip", value: "casper-flip-360-flip" },
  { label: "Kickflip Backflip", value: "kickflip-backflip" },
  { label: "360 Varial McTwist", value: "360-varial-mc-twist" },
  { label: "The 900", value: "the-900" },
];

export default function ComboboxMultipleDemo() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Combobox
      value={value}
      onValueChange={setValue}
      className="w-[400px]"
      multiple
      autoHighlight
    >
      <ComboboxLabel>Tricks</ComboboxLabel>
      <ComboboxAnchor className="h-full min-h-10 flex-wrap px-3 py-2">
        <ComboboxBadgeList>
          {value.map((item) => {
            const option = tricks.find((trick) => trick.value === item);
            if (!option) return null;

            return (
              <ComboboxBadgeItem key={item} value={item}>
                {option.label}
              </ComboboxBadgeItem>
            );
          })}
        </ComboboxBadgeList>
        <ComboboxInput
          placeholder="Select tricks..."
          className="h-auto min-w-20 flex-1"
        />
        <ComboboxTrigger className="absolute top-3 right-2">
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent>
        <ComboboxEmpty>No tricks found.</ComboboxEmpty>
        {tricks.map((trick) => (
          <ComboboxItem key={trick.value} value={trick.value}>
            {trick.label}
          </ComboboxItem>
        ))}
      </ComboboxContent>
    </Combobox>
  );
}
