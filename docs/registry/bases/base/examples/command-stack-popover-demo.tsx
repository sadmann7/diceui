"use client";

import {
  Check,
  CircleDashed,
  ListFilter,
  SignalHigh,
  User,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/bases/base/ui/button";
import {
  CommandStack,
  CommandStackEmpty,
  CommandStackGroup,
  CommandStackInput,
  CommandStackItem,
  CommandStackList,
  CommandStackPage,
} from "@/registry/bases/base/ui/command-stack";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/base/ui/popover";

const filters = [
  {
    value: "status",
    label: "Status",
    icon: CircleDashed,
    options: [
      "Backlog",
      "Todo",
      "In Progress",
      "In Review",
      "Done",
      "Canceled",
    ],
  },
  {
    value: "priority",
    label: "Priority",
    icon: SignalHigh,
    options: ["Urgent", "High", "Medium", "Low", "No priority"],
  },
  {
    value: "assignee",
    label: "Assignee",
    icon: User,
    options: [
      "Me",
      "Olivia Martin",
      "Jackson Lee",
      "Isabella Nguyen",
      "Unassigned",
    ],
  },
];

export default function CommandStackPopoverDemo() {
  const [open, setOpen] = React.useState(false);
  const [pages, setPages] = React.useState(["root"]);
  const [selected, setSelected] = React.useState<Record<string, string[]>>({});

  const selectedCount = Object.values(selected).flat().length;

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setPages(["root"]);
  }

  function onToggle(filter: string, option: string) {
    setSelected((prevSelected) => {
      const values = prevSelected[filter] ?? [];
      return {
        ...prevSelected,
        [filter]: values.includes(option)
          ? values.filter((value) => value !== option)
          : [...values, option],
      };
    });
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <ListFilter />
        Filter
        {selectedCount > 0 && (
          <span className="rounded-sm bg-muted px-1.5 text-xs font-medium">
            {selectedCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <CommandStack pages={pages} onPagesChange={setPages}>
          <CommandStackInput placeholder="Filter..." />
          <CommandStackList>
            <CommandStackEmpty>No results found.</CommandStackEmpty>
            <CommandStackPage value="root">
              {filters.map((filter) => (
                <CommandStackItem key={filter.value} page={filter.value}>
                  <filter.icon />
                  {filter.label}
                </CommandStackItem>
              ))}
            </CommandStackPage>
            {filters.map((filter) => (
              <CommandStackPage
                key={filter.value}
                value={filter.value}
                label={filter.label}
              >
                <CommandStackGroup heading={filter.label}>
                  {filter.options.map((option) => {
                    const isSelected =
                      selected[filter.value]?.includes(option) ?? false;

                    return (
                      <CommandStackItem
                        key={option}
                        onSelect={() => onToggle(filter.value, option)}
                      >
                        {option}
                        <Check
                          className={
                            isSelected ? "ml-auto" : "ml-auto opacity-0"
                          }
                        />
                      </CommandStackItem>
                    );
                  })}
                </CommandStackGroup>
              </CommandStackPage>
            ))}
          </CommandStackList>
        </CommandStack>
      </PopoverContent>
    </Popover>
  );
}
