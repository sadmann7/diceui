"use client";

import { GripVerticalIcon } from "lucide-react";
import * as React from "react";

import type {
  QueryField,
  QueryGroup,
  QueryNode,
} from "@/registry/bases/radix/lib/query-builder";

import { Button } from "@/registry/bases/radix/ui/button";
import { ButtonGroup } from "@/registry/bases/radix/ui/button-group";
import {
  QueryBuilder,
  QueryBuilderAddRule,
  QueryBuilderConnector,
  QueryBuilderField,
  QueryBuilderGroup,
  QueryBuilderGroupContent,
  QueryBuilderGroupFooter,
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
} from "@/registry/bases/radix/ui/query-builder";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/registry/bases/radix/ui/sortable";

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

export default function QueryBuilderSortableDemo() {
  const [query, setQuery] = React.useState(defaultQuery);

  return (
    <Sortable
      value={query.rules}
      onValueChange={(rules) => setQuery({ ...query, rules })}
      getItemValue={(rule: QueryNode) => rule.id}
    >
      <QueryBuilder
        fields={fields}
        value={query}
        onValueChange={setQuery}
        maxDepth={0}
        className="w-full max-w-lg"
      >
        <QueryBuilderGroup>
          <QueryBuilderGroupContent>
            <SortableContent withoutSlot>
              <QueryBuilderRules>
                {(rule) => (
                  <SortableItem value={rule.id} asChild>
                    <QueryBuilderRule>
                      <SortableItemHandle asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Move rule"
                          className="-me-1 text-muted-foreground"
                        >
                          <GripVerticalIcon />
                        </Button>
                      </SortableItemHandle>
                      <QueryBuilderConnector />
                      <ButtonGroup>
                        <QueryBuilderField />
                        <QueryBuilderOperator />
                        <QueryBuilderValue />
                        <QueryBuilderRemove variant="outline" />
                      </ButtonGroup>
                    </QueryBuilderRule>
                  </SortableItem>
                )}
              </QueryBuilderRules>
            </SortableContent>
            <QueryBuilderGroupFooter>
              <QueryBuilderAddRule />
            </QueryBuilderGroupFooter>
          </QueryBuilderGroupContent>
        </QueryBuilderGroup>
      </QueryBuilder>
      <SortableOverlay>
        <div className="size-full rounded-md bg-primary/10" />
      </SortableOverlay>
    </Sortable>
  );
}
