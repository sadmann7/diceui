"use client";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  ListPlusIcon,
  PlusIcon,
} from "lucide-react";
import * as React from "react";

import type {
  QueryField,
  QueryGroup,
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

const fields: QueryField[] = [
  { name: "title", label: "Title", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Todo", value: "todo", icon: CircleDashedIcon },
      { label: "In progress", value: "in-progress", icon: CircleDotIcon },
      { label: "Done", value: "done", icon: CircleCheckIcon },
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
    { id: "title", field: "title", operator: "iLike", value: "kickflip" },
  ],
};

export default function QueryBuilderDemo() {
  const [query, setQuery] = React.useState(defaultQuery);

  return (
    <QueryBuilder
      fields={fields}
      value={query}
      onValueChange={setQuery}
      className="w-full max-w-lg"
    >
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
  );
}
