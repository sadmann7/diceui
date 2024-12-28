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
import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
} from "@/registry/default/ui/checkbox-group";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import {
  TagsInput,
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@/registry/default/ui/tags-input";
import { SelectArrow } from "@radix-ui/react-select";
import { ArrowUp, ChevronDown, RefreshCcw } from "lucide-react";
import * as React from "react";

export default function PlaygroundPage() {
  const [tricks, setTricks] = React.useState<string[]>([]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log({ tricks });
  }

  return (
    <Shell>
      <form onSubmit={onSubmit}>
        <TagsInput value={tricks} onValueChange={setTricks} editable addOnPaste>
          <TagsInputLabel>Favorite tricks</TagsInputLabel>
          <TagsInputList>
            {tricks.map((trick) => (
              <TagsInputItem key={trick} value={trick}>
                {trick}
              </TagsInputItem>
            ))}
            <TagsInputInput placeholder="Add trick..." />
          </TagsInputList>
          <TagsInputClear asChild>
            <Button variant="outline">
              <RefreshCcw className="h-4 w-4" />
              Clear
            </Button>
          </TagsInputClear>
        </TagsInput>
        <div className="mt-2.5 flex items-center gap-2">
          <Button type="reset" variant="outline" size="sm">
            Reset
          </Button>
          <Button type="submit" size="sm">
            Submit
          </Button>
        </div>
      </form>
      <form onSubmit={onSubmit}>
        <CheckboxGroup
          name="favorite-tricks"
          value={tricks}
          onValueChange={setTricks}
          required
        >
          <CheckboxGroupLabel>Favorite tricks</CheckboxGroupLabel>
          <CheckboxGroupDescription>
            Select your favorite tricks
          </CheckboxGroupDescription>
          <CheckboxGroupList>
            <CheckboxGroupItem value="kickflip" required>
              Kickflip
            </CheckboxGroupItem>
            <CheckboxGroupItem value="heelflip">Heelflip</CheckboxGroupItem>
            <CheckboxGroupItem value="fs-540">FS 540</CheckboxGroupItem>
          </CheckboxGroupList>
        </CheckboxGroup>
        <div className="mt-2.5 flex items-center gap-2">
          <Button type="reset" variant="outline" size="sm">
            Reset
          </Button>
          <Button type="submit" size="sm">
            Submit
          </Button>
        </div>
      </form>
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
            <ComboboxItem key={trick} value={trick}>
              {trick}
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
          <SelectArrow asChild>
            <ArrowUp className="size-4 text-orange-600" />
          </SelectArrow>
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
