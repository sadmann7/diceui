"use client";

import type { ColumnDef } from "@tanstack/react-table";

import * as React from "react";

import type { DataGridFeatures } from "@/lib/data-grid-features";

import { DataGrid } from "@/registry/bases/base/components/data-grid/data-grid";
import { useDataGrid } from "@/registry/bases/base/hooks/use-data-grid";

interface Member {
  id: string;
  name: string;
  base: string;
  status: string;
  joined: string;
}

const initialData: Member[] = [
  {
    id: "1",
    name: "Ada Malin",
    base: "base",
    status: "active",
    joined: "2024-03-12",
  },
  {
    id: "2",
    name: "Jun Seo",
    base: "radix",
    status: "active",
    joined: "2024-01-08",
  },
  {
    id: "3",
    name: "Kemi Ojo",
    base: "base",
    status: "invited",
    joined: "2025-08-21",
  },
  {
    id: "4",
    name: "Rio Tanaka",
    base: "radix",
    status: "active",
    joined: "2024-02-02",
  },
  {
    id: "5",
    name: "Sana Kim",
    base: "base",
    status: "active",
    joined: "2025-01-15",
  },
];

export default function DataGridPreview() {
  const [data, setData] = React.useState(initialData);

  const columns = React.useMemo<ColumnDef<DataGridFeatures, Member>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Member",
        meta: { variant: "text" },
        minSize: 160,
      },
      {
        id: "base",
        accessorKey: "base",
        header: "Base",
        meta: {
          variant: "select",
          options: [
            { label: "Base UI", value: "base" },
            { label: "Radix", value: "radix" },
          ],
        },
        minSize: 120,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        meta: {
          variant: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Invited", value: "invited" },
          ],
        },
        minSize: 120,
      },
      {
        id: "joined",
        accessorKey: "joined",
        header: "Joined",
        meta: { variant: "date" },
        minSize: 130,
      },
    ],
    [],
  );

  const { table, ...dataGridProps } = useDataGrid({
    columns,
    data,
    onDataChange: setData,
    getRowId: (row) => row.id,
  });

  return (
    <div className="flex flex-1 flex-col justify-center p-5">
      <DataGrid {...dataGridProps} table={table} height={236} stretchColumns />
    </div>
  );
}
