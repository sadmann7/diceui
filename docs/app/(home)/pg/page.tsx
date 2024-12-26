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
  ComboboxLabel,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import { ChevronDown } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import SortableDemo from "@/registry/default/example/sortable-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <SortableDemo />
      <Combobox className="w-[240px]">
        <ComboboxLabel>Tricks</ComboboxLabel>
        <ComboboxAnchor>
          <ComboboxInput placeholder="Select tricks..." />
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
      <Command className="w-[15rem] rounded-md border">
        <CommandInput placeholder="Search tricks..." />
        <CommandList>
          <CommandEmpty>No tricks found</CommandEmpty>
          <CommandGroup>
            {tricks.map((trick) => (
              <CommandItem key={trick.value} value={trick.value}>
                {trick.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
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
