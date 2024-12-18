"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
import * as Combobox from "@diceui/combobox";
import * as React from "react";

export default function PlaygroundPage() {
  const [selectedTrick, setSelectedTrick] = React.useState<string | undefined>(
    undefined,
  );
  // console.log({ selectedTrick });

  return (
    <Shell>
      <Combobox.Root
        className="max-w-[12rem]"
        value={selectedTrick}
        onValueChange={setSelectedTrick}
      >
        <Combobox.Anchor>
          <Combobox.Input placeholder="Search tricks..." />
        </Combobox.Anchor>
        <Combobox.Content>
          <Combobox.Viewport>
            <Combobox.Item value="kickflip">Kickflip</Combobox.Item>
            <Combobox.Item value="heelflip">Heelflip</Combobox.Item>
            <Combobox.Item value="tre-flip">Tre Flip</Combobox.Item>
            <Combobox.Item value="fs-f40">FS 540</Combobox.Item>
            <Combobox.Item value="flip-1">Flip 1</Combobox.Item>
            <Combobox.Item value="flip-2">Flip 2</Combobox.Item>
            <Combobox.Item value="flip-3">Flip 3</Combobox.Item>
            <Combobox.Item value="flip-4">Flip 4</Combobox.Item>
          </Combobox.Viewport>
        </Combobox.Content>
      </Combobox.Root>
      <Command className="max-w-xs rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Basic Tricks">
            <CommandItem value="kickflip">
              <span>Kickflip</span>
            </CommandItem>
            <CommandItem value="heelflip">
              <span>Heelflip</span>
            </CommandItem>
            <CommandItem value="tre-flip">
              <span>Tre Flip</span>
            </CommandItem>
            <CommandItem value="fs-f40">
              <span>FS 540</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Flip Tricks">
            <CommandItem value="flip-1">
              <span>Flip 1</span>
            </CommandItem>
            <CommandItem value="flip-2">
              <span>Flip 2</span>
            </CommandItem>
            <CommandItem value="flip-3">
              <span>Flip 3</span>
            </CommandItem>
            <CommandItem value="flip-4">
              <span>Flip 4</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-fit">
            Open
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Keyboard shortcuts
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>More...</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
              New Team
              <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>GitHub</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem disabled>API</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
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
