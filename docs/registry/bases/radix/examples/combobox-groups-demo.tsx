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
  ComboboxLabel,
  ComboboxSeparator,
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

const groupedTricks = {
  "Basic Tricks": tricks.slice(0, 3),
  "Advanced Tricks": tricks.slice(3, 5),
  "Pro Tricks": tricks.slice(5),
};

export default function ComboboxGroupsDemo() {
  const [value, setValue] = React.useState("");

  return (
    <Combobox value={value} onValueChange={setValue}>
      <ComboboxLabel>Trick</ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxInput placeholder="Select trick..." />
        <ComboboxTrigger>
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent>
        <ComboboxEmpty>No tricks found</ComboboxEmpty>
        {Object.entries(groupedTricks).map(([category, items], index) => (
          <React.Fragment key={category}>
            <ComboboxGroup>
              <ComboboxGroupLabel>{category}</ComboboxGroupLabel>
              {items.map((trick) => (
                <ComboboxItem key={trick.value} value={trick.value} outset>
                  {trick.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
            {index < Object.entries(groupedTricks).length - 1 && (
              <ComboboxSeparator />
            )}
          </React.Fragment>
        ))}
      </ComboboxContent>
    </Combobox>
  );
}
