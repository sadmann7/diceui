"use client";

import * as React from "react";

import {
  formatQuery,
  type QueryField,
  type QueryGroup,
  type SqlDialect,
} from "@/registry/bases/radix/lib/query-builder";
import {
  QueryBuilder,
  QueryBuilderAddGroup,
  QueryBuilderAddRule,
  QueryBuilderConnector,
  QueryBuilderField,
  QueryBuilderGroup,
  QueryBuilderGroupContent,
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
} from "@/registry/bases/radix/ui/query-builder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/radix/ui/select";

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
      id: "due-date",
      field: "dueDate",
      operator: "isBetween",
      value: ["2026-10-01", "2026-10-31"],
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
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <QueryBuilder fields={fields} value={query} onValueChange={setQuery}>
        <QueryBuilderGroup>
          <QueryBuilderConnector />
          <QueryBuilderGroupContent>
            <QueryBuilderRules>
              <QueryBuilderRule>
                <QueryBuilderConnector />
                <QueryBuilderField />
                <QueryBuilderOperator />
                <QueryBuilderValue />
                <QueryBuilderRemove />
              </QueryBuilderRule>
            </QueryBuilderRules>
            <div className="flex items-center gap-1">
              <QueryBuilderAddRule />
              <QueryBuilderAddGroup />
              <QueryBuilderRemove className="ms-auto" />
            </div>
          </QueryBuilderGroupContent>
        </QueryBuilderGroup>
      </QueryBuilder>
      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b bg-muted/30 py-1.5 ps-3 pe-1.5">
          <span className="text-sm font-medium">SQL</span>
          <Select
            value={dialect}
            onValueChange={(value) => setDialect(value as SqlDialect)}
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
