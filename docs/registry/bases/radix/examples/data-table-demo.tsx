"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";

import {
  CheckCircle,
  CheckCircle2,
  DollarSign,
  MoreHorizontal,
  Text,
  XCircle,
} from "lucide-react";

import type { DataTableFeatures } from "@/lib/data-table-features";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getDataTableSelectColumn } from "@/components/data-table/data-table-select-column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { Badge } from "@/registry/bases/radix/ui/badge";
import { Button } from "@/registry/bases/radix/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/bases/radix/ui/dropdown-menu";

interface Project {
  id: string;
  title: string;
  status: "active" | "inactive";
  budget: number;
}

const data: Project[] = [
  {
    id: "1",
    title: "Project Alpha",
    status: "active",
    budget: 50000,
  },
  {
    id: "2",
    title: "Project Beta",
    status: "inactive",
    budget: 75000,
  },
  {
    id: "3",
    title: "Project Gamma",
    status: "active",
    budget: 25000,
  },
  {
    id: "4",
    title: "Project Delta",
    status: "active",
    budget: 100000,
  },
];

const columns: ColumnDef<DataTableFeatures, Project>[] = [
  getDataTableSelectColumn(),
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }: { column: Column<DataTableFeatures, Project> }) => (
      <DataTableColumnHeader column={column} label="Title" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Project["title"]>()}</div>,
    meta: {
      label: "Title",
      placeholder: "Search titles...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<DataTableFeatures, Project> }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Project["status"]>();
      const Icon = status === "active" ? CheckCircle2 : XCircle;

      return (
        <Badge variant="outline" className="capitalize">
          <Icon />
          {status}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "active", icon: CheckCircle },
        { label: "Inactive", value: "inactive", icon: XCircle },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "budget",
    accessorKey: "budget",
    header: ({ column }: { column: Column<DataTableFeatures, Project> }) => (
      <DataTableColumnHeader column={column} label="Budget" />
    ),
    cell: ({ cell }) => {
      const budget = cell.getValue<Project["budget"]>();

      return (
        <div className="flex items-center gap-1">
          <DollarSign className="size-4" />
          {budget.toLocaleString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: function Cell() {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 32,
  },
];

export default function DataTableDemo() {
  // Client mode sorts, filters, and paginates `data` in the browser
  const { table } = useDataTable({
    mode: "client",
    data,
    columns,
    initialState: {
      sorting: [{ id: "title", desc: true }],
      columnPinning: { start: [], end: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
