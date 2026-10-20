"use client";

import {
  CheckIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  ListFilterIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";

import {
  getQuerySelection,
  matchesQuery,
  type QueryField,
  type QueryGroup,
  setQuerySelection,
} from "@/registry/bases/base/lib/query-builder";
import { Button } from "@/registry/bases/base/ui/button";
import { ButtonGroup } from "@/registry/bases/base/ui/button-group";
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
import {
  QueryBuilder,
  QueryBuilderField,
  QueryBuilderGroup,
  QueryBuilderGroupContent,
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
} from "@/registry/bases/base/ui/query-builder";

const statuses = [
  { label: "Backlog", value: "backlog", icon: CircleDashedIcon },
  { label: "Todo", value: "todo", icon: CircleIcon },
  { label: "In progress", value: "in-progress", icon: CircleDotIcon },
  { label: "Done", value: "done", icon: CircleCheckIcon },
];

const fields: QueryField[] = [
  { name: "status", label: "Status", type: "select", options: statuses },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { label: "High", value: "high", icon: SignalHighIcon },
      { label: "Medium", value: "medium", icon: SignalMediumIcon },
      { label: "Low", value: "low", icon: SignalLowIcon },
    ],
  },
  {
    name: "assignee",
    label: "Assignee",
    type: "select",
    options: [
      { label: "Olivia Martin", value: "olivia" },
      { label: "Jackson Lee", value: "jackson" },
    ],
  },
];

const fieldIcons: Record<string, React.ComponentType> = {
  status: CircleDashedIcon,
  priority: SignalHighIcon,
  assignee: UserIcon,
};

const issues = [
  {
    id: "SKT-12",
    title: "Land the first kickflip",
    status: "done",
    priority: "high",
    assignee: "olivia",
  },
  {
    id: "SKT-13",
    title: "Wax the ledge at the park",
    status: "todo",
    priority: "low",
    assignee: "jackson",
  },
  {
    id: "SKT-14",
    title: "Film a tre flip line",
    status: "in-progress",
    priority: "high",
    assignee: "olivia",
  },
  {
    id: "SKT-15",
    title: "Replace worn bearings",
    status: "todo",
    priority: "medium",
    assignee: "olivia",
  },
  {
    id: "SKT-16",
    title: "Learn a hardflip",
    status: "backlog",
    priority: "medium",
    assignee: "jackson",
  },
  {
    id: "SKT-17",
    title: "Edit the session clips",
    status: "in-progress",
    priority: "low",
    assignee: "jackson",
  },
];

const defaultQuery: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    {
      id: "status",
      field: "status",
      operator: "inArray",
      value: ["todo", "in-progress"],
    },
  ],
};

function getCount(field: string, value: string) {
  return issues.filter(
    (issue) => issue[field as keyof (typeof issues)[number]] === value,
  ).length;
}

export default function QueryBuilderCommandFilterDemo() {
  const [query, setQuery] = React.useState(defaultQuery);

  const rows = issues.filter((issue) => matchesQuery(issue, query, fields));

  const selection = getQuerySelection(query);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <QueryBuilder fields={fields} value={query} onValueChange={setQuery}>
        <QueryBuilderGroup>
          <QueryBuilderGroupContent className="flex-row flex-wrap items-center data-[depth=0]:min-w-0">
            <QueryBuilderRules className="contents">
              <QueryBuilderRule>
                <ButtonGroup className="**:data-[slot=query-builder-select-icon]:hidden">
                  <QueryBuilderField className="w-auto" />
                  <QueryBuilderOperator className="w-auto" />
                  <QueryBuilderValue className="w-auto max-w-48" />
                  <QueryBuilderRemove variant="outline">
                    <XIcon />
                  </QueryBuilderRemove>
                </ButtonGroup>
              </QueryBuilderRule>
            </QueryBuilderRules>
            <Popover>
              <PopoverTrigger render={<Button variant="ghost" size="sm" />}>
                <ListFilterIcon />
                Filter
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-0">
                <CommandStack
                  value={selection}
                  onValueChange={(next) =>
                    setQuery(setQuerySelection(query, fields, next))
                  }
                >
                  <CommandStackInput placeholder="Add filter..." />
                  <CommandStackList>
                    <CommandStackEmpty>No results found.</CommandStackEmpty>
                    <CommandStackPage value="root">
                      {fields.map((field) => {
                        const Icon = fieldIcons[field.name] ?? UserIcon;
                        return (
                          <CommandStackItem key={field.name} page={field.name}>
                            <Icon />
                            {field.label}
                          </CommandStackItem>
                        );
                      })}
                    </CommandStackPage>
                    {fields.map((field) => (
                      <CommandStackPage
                        key={field.name}
                        value={field.name}
                        label={field.label}
                        placeholder={`Filter by ${field.label.toLowerCase()}...`}
                        selectionMode="multiple"
                      >
                        <CommandStackGroup heading={field.label}>
                          {field.options?.map((option) => (
                            <CommandStackItem
                              key={option.value}
                              value={option.value}
                              keywords={[option.label]}
                              className="[&>svg:last-child]:hidden"
                            >
                              <span
                                aria-hidden="true"
                                className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input text-primary-foreground group-data-[checked=true]/command-item:border-primary group-data-[checked=true]/command-item:bg-primary"
                              >
                                <CheckIcon className="size-3 opacity-0 group-data-[checked=true]/command-item:opacity-100" />
                              </span>
                              {option.icon && <option.icon />}
                              <span className="flex-1 truncate">
                                {option.label}
                              </span>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {getCount(field.name, option.value)}
                              </span>
                            </CommandStackItem>
                          ))}
                        </CommandStackGroup>
                      </CommandStackPage>
                    ))}
                  </CommandStackList>
                </CommandStack>
              </PopoverContent>
            </Popover>
            {query.rules.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setQuery({ ...query, rules: [] })}
              >
                Clear
              </Button>
            )}
          </QueryBuilderGroupContent>
        </QueryBuilderGroup>
      </QueryBuilder>
      <div className="divide-y overflow-hidden rounded-lg border">
        {rows.map((issue) => {
          const Icon =
            statuses.find((status) => status.value === issue.status)?.icon ??
            CircleIcon;
          return (
            <div
              key={issue.id}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <span className="w-14 text-muted-foreground">{issue.id}</span>
              <Icon className="size-4 text-muted-foreground" />
              <span className="truncate">{issue.title}</span>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No issues match.
          </p>
        )}
      </div>
    </div>
  );
}
