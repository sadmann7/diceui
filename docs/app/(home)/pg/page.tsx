"use client";

import { Shell } from "@/components/shell";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
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
import ComboboxDebouncedDemo from "@/registry/default/example/combobox-debounced-demo";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import { CommandLoading } from "cmdk";
import { ChevronDown } from "lucide-react";
import * as React from "react";

export default function PlaygroundPage() {
  const [search, setSearch] = React.useState("");

  const filteredItems = tricks.filter((trick) =>
    trick.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Shell>
      {/* <Command
        className="w-[15rem] rounded-lg border shadow-md"
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={(value) => setSearch(value)}
        />
        <CommandList>
          <CommandEmpty>No tricks found.</CommandEmpty>
          <CommandLoading>Loading...</CommandLoading>
          {filteredItems.map((trick) => (
            <CommandItem key={trick.value} value={trick.value}>
              {trick.label}
            </CommandItem>
          ))}
        </CommandList>
      </Command> */}
      <ComboboxDebouncedDemo />
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
