"use client";

import * as React from "react";

import {
  formatQuery,
  type QueryField,
  type QueryGroup,
  type SqlDialect,
} from "@/registry/bases/base/lib/query-builder";
import {
  QueryBuilder,
  QueryBuilderAddGroup,
  QueryBuilderAddRule,
  QueryBuilderCombinator,
  QueryBuilderField,
  QueryBuilderGroup,
  QueryBuilderGroupHeader,
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
      id: "due-date",
      field: "dueDate",
      operator: "isBetween",
      value: ["2026-10-01", "2026-10-31"],
    },
  ],
};

const dialects: SqlDialect[] = ["postgres", "mysql", "sqlite"];

export default function QueryBuilderSqlDemo() {
  const [query, setQuery] = React.useState(defaultQuery);
  const [dialect, setDialect] = React.useState<SqlDialect>("postgres");
  const { sql, params } = formatQuery(query, fields, { dialect });

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <QueryBuilder fields={fields} value={query} onValueChange={setQuery}>
        <QueryBuilderGroup>
          <QueryBuilderGroupHeader>
            Match
            <QueryBuilderCombinator />
            of the following
            <QueryBuilderRemove className="ms-auto" />
          </QueryBuilderGroupHeader>
          <QueryBuilderRules>
            <QueryBuilderRule>
              <QueryBuilderField />
              <QueryBuilderOperator />
              <QueryBuilderValue />
              <QueryBuilderRemove />
            </QueryBuilderRule>
          </QueryBuilderRules>
          <div className="flex gap-2">
            <QueryBuilderAddRule />
            <QueryBuilderAddGroup />
          </div>
        </QueryBuilderGroup>
      </QueryBuilder>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Generated SQL</span>
          <Select
            value={dialect}
            onValueChange={(value) => {
              if (value) setDialect(value as SqlDialect);
            }}
          >
            <SelectTrigger size="sm" aria-label="SQL dialect" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dialects.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
          {sql ? `WHERE ${sql}` : "-- no rules yet"}
          {params.length > 0 && `\n\n-- params: ${JSON.stringify(params)}`}
        </pre>
      </div>
    </div>
  );
}
