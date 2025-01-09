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
import { Textarea } from "@/components/ui/textarea";
import { tricks } from "@/lib/data";
import * as ComboboxPrimitive from "@/registry/default/ui/combobox";
import * as Mention from "@diceui/mention";
import { ChevronDown } from "lucide-react";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

export default function PlaygroundPage() {
  return (
    <Shell>
      <div className="h-screen bg-accent" />
      <Mention.Root className="flex w-[20rem] flex-col gap-2" showLabel>
        <Mention.Label>Tricks</Mention.Label>
        <Mention.Input
          placeholder="Enter @ to mention a trick"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          asChild
        >
          <Textarea />
        </Mention.Input>
        <Mention.Portal>
          <Mention.Content className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in">
            {tricks.map((trick) => (
              <Mention.Item
                key={trick.value}
                value={trick.value}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50"
              >
                {trick.label}
              </Mention.Item>
            ))}
          </Mention.Content>
        </Mention.Portal>
      </Mention.Root>
      <Combobox defaultValue={tricks[0]?.value}>
        <ComboboxInput aria-label="Assignee" />
        <ComboboxOptions anchor="bottom" className="border empty:invisible">
          {tricks.map((trick) => (
            <ComboboxOption
              key={trick.value}
              value={trick.value}
              className="data-[focus]:bg-blue-100"
            >
              {trick.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
      <ComboboxPrimitive.Combobox
        defaultValue={tricks[0]?.value}
        className="w-[15rem]"
      >
        <ComboboxPrimitive.ComboboxAnchor>
          <ComboboxPrimitive.ComboboxInput placeholder="Search tricks..." />
          <ComboboxPrimitive.ComboboxTrigger>
            <ChevronDown className="h-4 w-4" />
          </ComboboxPrimitive.ComboboxTrigger>
        </ComboboxPrimitive.ComboboxAnchor>
        <ComboboxPrimitive.ComboboxContent>
          <ComboboxPrimitive.ComboboxEmpty>
            No tricks found
          </ComboboxPrimitive.ComboboxEmpty>
          {tricks.map((trick) => (
            <ComboboxPrimitive.ComboboxItem
              key={trick.value}
              value={trick.value}
            >
              {trick.label}
            </ComboboxPrimitive.ComboboxItem>
          ))}
        </ComboboxPrimitive.ComboboxContent>
      </ComboboxPrimitive.Combobox>
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
          <SelectValue placeholder="Select a trick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tricks</SelectLabel>
            {tricks.map((trick) => (
              <SelectItem key={trick.value} value={trick.value}>
                {trick.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="h-screen bg-accent" />
    </Shell>
  );
}
