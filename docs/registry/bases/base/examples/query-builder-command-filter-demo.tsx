"use client";

import {
  CheckIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  CircleXIcon,
  ListFilterIcon,
  OctagonAlertIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";

import {
  createQueryRule,
  getIsQueryGroup,
  matchesQuery,
  type QueryField,
  type QueryGroup,
  type QueryRule,
  setQueryRuleValues,
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
  type CommandStackValue,
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

const fields: QueryField[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Backlog", value: "backlog", icon: CircleDashedIcon },
      { label: "Todo", value: "todo", icon: CircleIcon },
      { label: "In progress", value: "in-progress", icon: CircleDotIcon },
      { label: "Done", value: "done", icon: CircleCheckIcon },
      { label: "Canceled", value: "canceled", icon: CircleXIcon },
    ],
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { label: "Urgent", value: "urgent", icon: OctagonAlertIcon },
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
      { label: "Isabella Nguyen", value: "isabella" },
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
    priority: "urgent",
    assignee: "isabella",
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
    priority: "high",
    assignee: "olivia",
  },
  {
    id: "SKT-18",
    title: "Book the indoor bowl",
    status: "canceled",
    priority: "low",
    assignee: "isabella",
  },
  {
    id: "SKT-19",
    title: "Grip the new deck",
    status: "todo",
    priority: "high",
    assignee: "isabella",
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

function getRuleValues(rule: QueryRule) {
  if (Array.isArray(rule.value)) return rule.value;
  return rule.value ? [rule.value] : [];
}

export default function QueryBuilderCommandFilterDemo() {
  const [query, setQuery] = React.useState(defaultQuery);
  const [open, setOpen] = React.useState(false);
  const [pages, setPages] = React.useState(["root"]);
  const [search, setSearch] = React.useState("");

  const rows = React.useMemo(
    () => issues.filter((issue) => matchesQuery(issue, query, fields)),
    [query],
  );

  const selection = React.useMemo(() => {
    const value: CommandStackValue = {};
    for (const node of query.rules) {
      if (getIsQueryGroup(node) || value[node.field]) continue;
      value[node.field] = getRuleValues(node);
    }
    return value;
  }, [query]);

  const onSelectionChange = React.useCallback((next: CommandStackValue) => {
    setQuery((current) => {
      let rules = current.rules;
      for (const field of fields) {
        const values = next[field.name] ?? [];
        const existing = rules.find(
          (node): node is QueryRule =>
            !getIsQueryGroup(node) && node.field === field.name,
        );
        if (values.length === 0) {
          if (existing) rules = rules.filter((node) => node !== existing);
          continue;
        }
        const rule = setQueryRuleValues(
          existing ?? createQueryRule(field),
          field,
          values,
        );
        rules = existing
          ? rules.map((node) => (node === existing ? rule : node))
          : [...rules, rule];
      }
      return { ...current, rules };
    });
  }, []);

  const onToggle = (field: string, value: string) => {
    const values = selection[field] ?? [];
    onSelectionChange({
      ...selection,
      [field]: values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    });
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <QueryBuilder fields={fields} value={query} onValueChange={setQuery}>
        <QueryBuilderGroup>
          <QueryBuilderGroupContent className="flex-row flex-wrap items-center data-[depth=0]:min-w-0">
            <QueryBuilderRules className="contents">
              <QueryBuilderRule>
                <ButtonGroup>
                  <QueryBuilderField className="w-auto" />
                  <QueryBuilderOperator className="w-auto" />
                  <QueryBuilderValue className="w-auto max-w-48" />
                  <QueryBuilderRemove variant="outline">
                    <XIcon />
                  </QueryBuilderRemove>
                </ButtonGroup>
              </QueryBuilderRule>
            </QueryBuilderRules>
            <Popover
              open={open}
              onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (nextOpen) {
                  setPages(["root"]);
                  setSearch("");
                }
              }}
            >
              <PopoverTrigger render={<Button variant="ghost" size="sm" />}>
                <ListFilterIcon />
                Filter
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-0">
                <CommandStack
                  value={selection}
                  onValueChange={onSelectionChange}
                  pages={pages}
                  onPagesChange={setPages}
                  search={search}
                  onSearchChange={setSearch}
                >
                  <CommandStackInput placeholder="Add filter..." />
                  <CommandStackList>
                    <CommandStackEmpty>No filters found.</CommandStackEmpty>
                    <CommandStackPage value="root">
                      <CommandStackGroup>
                        {fields.map((field) => {
                          const Icon = fieldIcons[field.name] ?? UserIcon;
                          return (
                            <CommandStackItem
                              key={field.name}
                              page={field.name}
                            >
                              <Icon />
                              {field.label}
                            </CommandStackItem>
                          );
                        })}
                      </CommandStackGroup>
                      {search.trim() !== "" &&
                        fields.map((field) => (
                          <CommandStackGroup
                            key={field.name}
                            heading={field.label}
                          >
                            {field.options?.map((option) => (
                              <CommandStackItem
                                key={option.value}
                                value={`${field.name}:${option.value}`}
                                keywords={[option.label, field.label]}
                                onSelect={() =>
                                  onToggle(field.name, option.value)
                                }
                              >
                                {option.icon && <option.icon />}
                                <span className="flex-1 truncate">
                                  {option.label}
                                </span>
                                {selection[field.name]?.includes(
                                  option.value,
                                ) && (
                                  <span className="text-xs text-muted-foreground">
                                    Applied
                                  </span>
                                )}
                              </CommandStackItem>
                            ))}
                          </CommandStackGroup>
                        ))}
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
                                {
                                  issues.filter(
                                    (issue) =>
                                      issue[
                                        field.name as keyof typeof issue
                                      ] === option.value,
                                  ).length
                                }
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
        {rows.length > 0 ? (
          rows.map((issue) => {
            const status = fields[0]?.options?.find(
              (option) => option.value === issue.status,
            );
            const StatusIcon = status?.icon ?? CircleIcon;
            return (
              <div
                key={issue.id}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                <span className="w-14 shrink-0 text-muted-foreground tabular-nums">
                  {issue.id}
                </span>
                <StatusIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{issue.title}</span>
              </div>
            );
          })
        ) : (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No issues match.
          </p>
        )}
      </div>
    </div>
  );
}
