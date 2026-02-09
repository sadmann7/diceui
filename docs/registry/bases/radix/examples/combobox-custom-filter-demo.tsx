"use client";

import { ChevronDown } from "lucide-react";
import { matchSorter } from "match-sorter";
import * as React from "react";
import {
  Combobox,
  ComboboxAnchor,
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

export default function ComboboxCustomFilterDemo() {
  const [value, setValue] = React.useState("");

  function onFilter(options: string[], inputValue: string) {
    const trickOptions = tricks.filter((trick) =>
      options.includes(trick.value),
    );
    return matchSorter(trickOptions, inputValue, {
      keys: ["label", "value"],
      threshold: matchSorter.rankings.MATCHES,
    }).map((trick) => trick.value);
  }

  return (
    <Combobox value={value} onValueChange={setValue} onFilter={onFilter}>
      <ComboboxLabel>Trick</ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxInput placeholder="Select trick..." />
        <ComboboxTrigger>
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
