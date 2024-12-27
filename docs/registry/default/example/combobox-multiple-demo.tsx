"use client";

import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import { ChevronDown, X } from "lucide-react";
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

export default function ComboboxMultipleDemo() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Combobox
      value={value}
      onValueChange={setValue}
      className="w-[400px]"
      multiple
    >
      <ComboboxLabel>Tricks</ComboboxLabel>
      <ComboboxAnchor className="h-full min-h-10 flex-wrap p-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {value.map((item) => {
            const trick = tricks.find((t) => t.value === item);
            if (!trick) return null;

            return (
              <div
                key={item}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-medium text-secondary-foreground text-sm"
              >
                {trick?.label}
                <button
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                  tabIndex={-1}
                  onClick={() => setValue(value.filter((v) => v !== item))}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      setValue(value.filter((v) => v !== item));
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
        <ComboboxInput
          placeholder="Select tricks..."
          className="h-full min-w-20 flex-1"
        />
        <ComboboxTrigger className="absolute top-2 right-2">
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
