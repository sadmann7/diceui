"use client";

import { GripVerticalIcon, PlusIcon } from "lucide-react";
import * as React from "react";

import {
  getIsQueryGroup,
  type QueryField,
  type QueryGroup,
  type QueryNode,
  updateQueryNode,
} from "@/registry/bases/base/lib/query-builder";
import { Button } from "@/registry/bases/base/ui/button";
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
    {
      id: "group",
      combinator: "or",
      rules: [
        { id: "estimate", field: "estimate", operator: "gte", value: "5" },
        { id: "dueDate", field: "dueDate", operator: "isEmpty" },
      ],
    },
    { id: "title", field: "title", operator: "iLike", value: "kickflip" },
  ],
};

function QueryBuilderSortableHandle({
  label,
  variant = "outline",
}: {
  label: string;
  variant?: "outline" | "ghost";
}) {
  return (
    <SortableItemHandle
      render={
        <Button
          variant={variant}
          size="icon-sm"
          aria-label={label}
          className="text-muted-foreground"
        />
      }
    >
      <GripVerticalIcon />
    </SortableItemHandle>
  );
}

export default function QueryBuilderSortableDemo() {
  const [query, setQuery] = React.useState(defaultQuery);

  const onRulesChange = (groupId: string, rules: QueryNode[]) =>
    setQuery((current) =>
      updateQueryNode(current, groupId, (node) =>
        getIsQueryGroup(node) ? { ...node, rules } : node,
      ),
    );

  return (
    <QueryBuilder
      fields={fields}
      value={query}
      onValueChange={setQuery}
      className="w-full max-w-lg"
    >
      <QueryBuilderGroup>
        {(group) => (
          <>
            <QueryBuilderConnector />
            <QueryBuilderGroupContent>
              <QueryBuilderGroupHeader className="data-[depth=0]:hidden">
                <QueryBuilderGroupTitle />
                <QueryBuilderAddRule size="icon-sm" aria-label="Add rule">
                  <PlusIcon />
                </QueryBuilderAddRule>
                <QueryBuilderRemove />
                {group.id !== query.id && (
                  <QueryBuilderSortableHandle
                    label="Move group"
                    variant="ghost"
                  />
                )}
              </QueryBuilderGroupHeader>
              <Sortable
                value={group.rules}
                onValueChange={(rules) => onRulesChange(group.id, rules)}
                getItemValue={(node: QueryNode) => node.id}
              >
                <SortableContent withoutSlot>
                  <QueryBuilderRules>
                    {(node) =>
                      getIsQueryGroup(node) ? (
                        <SortableItem
                          value={node.id}
                          render={
                            <QueryBuilderGroup className="data-dragging:z-10 data-dragging:bg-background" />
                          }
                        />
                      ) : (
                        <SortableItem
                          value={node.id}
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
                            <QueryBuilderSortableHandle label="Move rule" />
                          </ButtonGroup>
                        </SortableItem>
                      )
                    }
                  </QueryBuilderRules>
                </SortableContent>
              </Sortable>
              <QueryBuilderGroupFooter className="not-data-[depth=0]:hidden">
                <QueryBuilderAddRule />
                <QueryBuilderAddGroup />
              </QueryBuilderGroupFooter>
            </QueryBuilderGroupContent>
          </>
        )}
      </QueryBuilderGroup>
    </QueryBuilder>
  );
}
