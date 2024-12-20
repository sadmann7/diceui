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
} from "@/registry/default/ui/combobox";
import * as ComboboxPrimitive from "@diceui/combobox";
import { Check } from "lucide-react";
import * as React from "react";

export default function PlaygroundPage() {
  const [selectedTrick, setSelectedTrick] = React.useState<string | undefined>(
    undefined,
  );
  // console.log({ selectedTrick });

  return (
    <Shell>
      <ComboboxPrimitive.Root
        className="w-full max-w-[15rem]"
        value={selectedTrick}
        onValueChange={setSelectedTrick}
      >
        <ComboboxPrimitive.Anchor>
          <ComboboxPrimitive.Input placeholder="Search tricks..." />
        </ComboboxPrimitive.Anchor>
        <ComboboxPrimitive.Positioner>
          <ComboboxPrimitive.Content className="w-full max-w-[15rem]">
            <ComboboxPrimitive.Viewport>
              <ComboboxPrimitive.Empty>No tricks found</ComboboxPrimitive.Empty>
              {tricks.map((trick) => (
                <ComboboxPrimitive.Item
                  key={trick.value}
                  value={trick.value}
                  className="flex items-center gap-2 pr-2 pl-8"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <ComboboxPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </ComboboxPrimitive.ItemIndicator>
                  </span>
                  {trick.label}
                </ComboboxPrimitive.Item>
              ))}
            </ComboboxPrimitive.Viewport>
          </ComboboxPrimitive.Content>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Root>
      <Combobox
        value={selectedTrick}
        onValueChange={setSelectedTrick}
        className="w-full max-w-[15rem]"
      >
        <ComboboxAnchor>
          <ComboboxInput placeholder="Search tricks..." />
        </ComboboxAnchor>
        <ComboboxContent className="w-full max-w-[15rem]">
          <ComboboxEmpty>No tricks found</ComboboxEmpty>
          {tricks.map((trick) => (
            <ComboboxItem key={trick.value} value={trick.value}>
              {trick.label}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
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
