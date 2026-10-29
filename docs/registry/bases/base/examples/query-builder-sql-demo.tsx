"use client";

import { ListPlusIcon, PlusIcon } from "lucide-react";
import * as React from "react";

import {
  formatQuery,
  type QueryField,
  type QueryGroup,
  type SqlDialect,
} from "@/registry/bases/base/lib/query-builder";
import { ButtonGroup } from "@/registry/bases/base/ui/button-group";
import {
  QueryBuilder,
  QueryBuilderAddGroup,
  QueryBuilderAddRule,
  QueryBuilderConnector,
  QueryBuilderField,
  QueryBuilderGroup,
  QueryBuilderGroupContent,
  QueryBuilderGroupFooter,
  QueryBuilderGroupHeader,
  QueryBuilderGroupTitle,
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
} from "@/registry/bases/base/ui/query-builder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/base/ui/select";

const fields: QueryField[] = [
  { name: "title", label: "Title", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Todo", value: "todo" },
      { label: "In progress", value: "in-progress" },
      { label: "Done", value: "done" },
    ],
  },
  { name: "estimate", label: "Estimate", type: "number" },
  { name: "dueDate", label: "Due date", type: "date", column: "due_date" },
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
    {
      id: "estimate",
      field: "estimate",
      operator: "isBetween",
      value: ["3", "8"],
    },
  ],
};

const dialects: { label: string; value: SqlDialect }[] = [
  { label: "Postgres", value: "postgres" },
  { label: "MySQL", value: "mysql" },
  { label: "SQLite", value: "sqlite" },
];

export default function QueryBuilderSqlDemo() {
  const [query, setQuery] = React.useState(defaultQuery);
  const [dialect, setDialect] = React.useState<SqlDialect>("postgres");
  const { sql, params } = formatQuery(query, fields, { dialect });

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <QueryBuilder fields={fields} value={query} onValueChange={setQuery}>
        <QueryBuilderGroup>
          <QueryBuilderConnector />
          <QueryBuilderGroupContent>
            <QueryBuilderGroupHeader className="data-[depth=0]:hidden">
              <QueryBuilderGroupTitle />
              <QueryBuilderAddRule size="icon-sm" aria-label="Add rule">
                <PlusIcon />
              </QueryBuilderAddRule>
              <QueryBuilderAddGroup size="icon-sm" aria-label="Add group">
                <ListPlusIcon />
              </QueryBuilderAddGroup>
              <QueryBuilderRemove />
            </QueryBuilderGroupHeader>
            <QueryBuilderRules>
              <QueryBuilderRule>
                <QueryBuilderConnector />
                <ButtonGroup>
                  <QueryBuilderField />
                  <QueryBuilderOperator />
                  <QueryBuilderValue />
                  <QueryBuilderRemove variant="outline" />
                </ButtonGroup>
              </QueryBuilderRule>
            </QueryBuilderRules>
            <QueryBuilderGroupFooter className="not-data-[depth=0]:hidden">
              <QueryBuilderAddRule />
              <QueryBuilderAddGroup />
            </QueryBuilderGroupFooter>
          </QueryBuilderGroupContent>
        </QueryBuilderGroup>
      </QueryBuilder>
      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b bg-muted/30 py-1.5 ps-3 pe-1.5">
          <span className="text-sm font-medium">SQL</span>
          <Select
            value={dialect}
            items={dialects}
            onValueChange={(value) => {
              if (value) setDialect(value as SqlDialect);
            }}
          >
            <SelectTrigger size="sm" aria-label="SQL dialect" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {dialects.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <pre className="p-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
          {sql ? (
            <code>WHERE {sql}</code>
          ) : (
            <code className="text-muted-foreground">-- Add a rule</code>
          )}
          {params.length > 0 && (
            <code className="mt-2 block text-muted-foreground">
              -- {JSON.stringify(params)}
            </code>
          )}
        </pre>
      </div>
    </div>
  );
}
