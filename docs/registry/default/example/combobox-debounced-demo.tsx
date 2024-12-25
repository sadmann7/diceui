"use client";

import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxProgress,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import { ChevronDown, Loader2 } from "lucide-react";
import * as React from "react";

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

export default function ComboboxDebouncedDemo() {
  const [value, setValue] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filteredItems = tricks.filter((trick) =>
    trick.label.toLowerCase().includes(search.toLowerCase()),
  );

  console.log({ filteredItems });

  return (
    <Combobox
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      manualFiltering
      className="w-[15rem]"
    >
      <ComboboxLabel>Trick</ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxInput placeholder="Search trick..." />
        <ComboboxTrigger>
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent>
        {filteredItems.length === 0 && (
          <ComboboxEmpty>No trick found.</ComboboxEmpty>
        )}
        {filteredItems.map((trick) => (
          <ComboboxItem
            key={trick.value}
            value={trick.value}
            indicatorSide="right"
          >
            {trick.label}
          </ComboboxItem>
        ))}
      </ComboboxContent>
    </Combobox>
  );
}
