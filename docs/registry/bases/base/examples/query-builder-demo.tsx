"use client";

import * as React from "react";

import type {
  QueryField,
  QueryGroup,
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
    {
      id: "estimate-or-title",
      combinator: "or",
      rules: [
        { id: "estimate", field: "estimate", operator: "gte", value: "5" },
        { id: "title", field: "title", operator: "iLike", value: "bug" },
      ],
    },
  ],
};

export default function QueryBuilderDemo() {
  const [query, setQuery] = React.useState(defaultQuery);

  return (
    <QueryBuilder
      fields={fields}
      value={query}
      onValueChange={setQuery}
      className="w-full max-w-2xl"
    >
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
  );
}
