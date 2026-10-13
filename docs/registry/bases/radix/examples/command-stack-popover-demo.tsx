"use client";

import { CircleDashed, ListFilter, SignalHigh, User } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/bases/radix/ui/button";
import {
  CommandStack,
  CommandStackEmpty,
  CommandStackGroup,
  CommandStackInput,
  CommandStackItem,
  CommandStackList,
  CommandStackPage,
  type CommandStackValue,
} from "@/registry/bases/radix/ui/command-stack";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/radix/ui/popover";

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
  const [value, setValue] = React.useState<CommandStackValue>({});

  const selectedCount = Object.values(value).flat().length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          Filter
          {selectedCount > 0 && (
            <span className="rounded-sm bg-muted px-1.5 text-xs font-medium">
              {selectedCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <CommandStack value={value} onValueChange={setValue}>
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
                placeholder={`Filter by ${filter.label.toLowerCase()}...`}
                selectionMode="multiple"
              >
                <CommandStackGroup heading={filter.label}>
                  {filter.options.map((option) => (
                    <CommandStackItem key={option} value={option}>
                      {option}
                    </CommandStackItem>
                  ))}
                </CommandStackGroup>
              </CommandStackPage>
            ))}
          </CommandStackList>
        </CommandStack>
      </PopoverContent>
    </Popover>
  );
}
