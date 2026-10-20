"use client";

import * as React from "react";

import {
  matchesQuery,
  type QueryField,
  type QueryGroup,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/bases/radix/ui/table";

const statuses = [
  { label: "Todo", value: "todo" },
  { label: "In progress", value: "in-progress" },
  { label: "Done", value: "done" },
];

const fields: QueryField[] = [
  { name: "trick", label: "Trick", type: "text" },
  { name: "status", label: "Status", type: "select", options: statuses },
  { name: "attempts", label: "Attempts", type: "number" },
];

const tricks = [
  { trick: "Kickflip", status: "done", attempts: 12 },
  { trick: "Heelflip", status: "done", attempts: 18 },
  { trick: "Tre flip", status: "in-progress", attempts: 41 },
  { trick: "Hardflip", status: "in-progress", attempts: 27 },
  { trick: "Varial kickflip", status: "todo", attempts: 3 },
  { trick: "Laser flip", status: "todo", attempts: 0 },
  { trick: "FS 360 shove-it", status: "done", attempts: 9 },
  { trick: "Impossible", status: "todo", attempts: 6 },
];

const defaultQuery: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    {
      id: "status",
      field: "status",
      operator: "notInArray",
      value: ["done"],
    },
    { id: "attempts", field: "attempts", operator: "gte", value: "5" },
  ],
};

export default function QueryBuilderFilterDemo() {
  const [query, setQuery] = React.useState(defaultQuery);

  const rows = React.useMemo(
    () => tricks.filter((row) => matchesQuery(row, query, fields)),
    [query],
  );

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trick</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-end">Attempts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.trick}>
                  <TableCell className="font-medium">{row.trick}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {statuses.find((status) => status.value === row.status)
                      ?.label ?? row.status}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {row.attempts}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-20 text-center text-muted-foreground"
                >
                  No tricks match.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        Showing {rows.length} of {tricks.length} tricks.
      </p>
    </div>
  );
}
