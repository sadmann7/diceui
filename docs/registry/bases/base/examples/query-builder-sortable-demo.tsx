"use client";

import { GripVerticalIcon } from "lucide-react";
import * as React from "react";

import type {
  QueryField,
  QueryGroup,
  QueryNode,
} from "@/registry/bases/base/lib/query-builder";

import { Button } from "@/registry/bases/base/ui/button";
import { ButtonGroup } from "@/registry/bases/base/ui/button-group";
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
} from "@/registry/bases/base/ui/query-builder";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/registry/bases/base/ui/sortable";

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
                  <SortableItem
                    value={rule.id}
                    render={
                      <QueryBuilderRule className="data-dragging:z-10 data-dragging:bg-background" />
                    }
                  >
                    <QueryBuilderConnector />
                    <ButtonGroup>
                      <QueryBuilderField />
                      <QueryBuilderOperator />
                      <QueryBuilderValue />
                      <QueryBuilderRemove variant="outline" />
                      <SortableItemHandle
                        render={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label="Move rule"
                            className="text-muted-foreground"
                          />
                        }
                      >
                        <GripVerticalIcon />
                      </SortableItemHandle>
                    </ButtonGroup>
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
    </Sortable>
  );
}
