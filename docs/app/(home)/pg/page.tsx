"use client";

import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CommandLoading } from "cmdk";
import { ChevronDown } from "lucide-react";

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
import ComboboxDebouncedDemo from "@/registry/default/example/combobox-debounced-demo";
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
      <Combobox className="w-[15rem]">
        <ComboboxAnchor>
          <ComboboxInput placeholder="Search tricks..." />
          <ComboboxTrigger>
            <ChevronDown className="h-4 w-4" />
          </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxContent>
          <ComboboxEmpty>No tricks found</ComboboxEmpty>
          {tricks.map((trick) => (
            <ComboboxItem key={trick.value} value={trick.value}>
              {trick.label}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit">
            Open
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <DropdownMenuItem>Banana</DropdownMenuItem>
          <DropdownMenuItem>Blueberry</DropdownMenuItem>
          <DropdownMenuItem>Grapes</DropdownMenuItem>
          <DropdownMenuItem>Pineapple</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
