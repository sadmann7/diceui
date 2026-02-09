"use client";

import * as React from "react";
import {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
} from "@/registry/bases/radix/ui/listbox";

const tricks = {
  basic: [
    {
      label: "Kickflip",
      description: "Flip the board 360° along its long axis",
    },
    {
      label: "Heelflip",
      description:
        "Flip the board 360° along its long axis in the opposite direction",
    },
  ],
  advanced: [
    {
      label: "Varial McTwist",
      description: "A 540° inverted aerial with a board rotation",
    },
    {
      label: "The 900",
      description: "Legendary 900° aerial rotation pioneered by Tony Hawk",
    },
  ],
};

export default function ListboxGroupDemo() {
  const [selectedTricks, setSelectedTricks] = React.useState<string[]>([]);

  return (
    <Listbox multiple value={selectedTricks} onValueChange={setSelectedTricks}>
      <ListboxGroup>
        <ListboxGroupLabel>Basic Tricks</ListboxGroupLabel>
        {tricks.basic.map((trick) => (
          <ListboxItem key={trick.label} value={trick.label}>
            <div className="flex flex-col items-start">
              <span>{trick.label}</span>
              <span className="text-muted-foreground text-xs">
                {trick.description}
              </span>
            </div>
            <ListboxItemIndicator />
          </ListboxItem>
        ))}
      </ListboxGroup>
      <ListboxGroup>
        <ListboxGroupLabel>Advanced Tricks</ListboxGroupLabel>
        {tricks.advanced.map((trick) => (
          <ListboxItem key={trick.label} value={trick.label}>
            <div className="flex flex-col items-start">
              <span>{trick.label}</span>
              <span className="text-muted-foreground text-xs">
                {trick.description}
              </span>
            </div>
            <ListboxItemIndicator />
          </ListboxItem>
        ))}
      </ListboxGroup>
    </Listbox>
  );
}
