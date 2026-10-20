"use client";

import * as React from "react";

import type {
  QueryField,
  QueryGroup,
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
  { name: "dueDate", label: "Due date", type: "date" },
  { name: "archived", label: "Archived", type: "boolean" },
];

const defaultQuery: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "status", field: "status", operator: "eq", value: "todo" },
    { id: "estimate", field: "estimate", operator: "gte", value: "5" },
    { id: "title", field: "title", operator: "iLike", value: "bug" },
  ],
};

export default function QueryBuilderDemo() {
  const [query, setQuery] = React.useState(defaultQuery);

  return (
    <QueryBuilder
      fields={fields}
      value={query}
      onValueChange={setQuery}
      className="w-full max-w-xl"
    >
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
  );
}
