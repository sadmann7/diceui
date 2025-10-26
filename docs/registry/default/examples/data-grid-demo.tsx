"use client";

import * as React from "react";
import { DataGrid } from "@/components/data-grid/data-grid";
import { useDataGrid } from "@/hooks/use-data-grid";

interface Person {
  id: string;
  name: string;
  email: string;
  age: number;
  status: "active" | "inactive";
  salary: number;
  department: string;
  startDate: string;
  isManager: boolean;
}

const initialData: Person[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    status: "active",
    salary: 75000,
    department: "Engineering",
    startDate: "2022-01-15",
    isManager: false,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    age: 28,
    status: "active",
    salary: 82000,
    department: "Design",
    startDate: "2021-06-10",
    isManager: true,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 35,
    status: "inactive",
    salary: 68000,
    department: "Marketing",
    startDate: "2020-03-22",
    isManager: false,
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    age: 32,
    status: "active",
    salary: 90000,
    department: "Engineering",
    startDate: "2019-11-08",
    isManager: true,
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    age: 26,
    status: "active",
    salary: 65000,
    department: "Sales",
    startDate: "2023-02-14",
    isManager: false,
  },
];

export default function DataGridDemo() {
  const [data, setData] = React.useState<Person[]>(initialData);

  const columns = React.useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        meta: {
          label: "Name",
          cell: {
            variant: "short-text" as const,
          },
        },
        size: 150,
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        meta: {
          label: "Email",
          cell: {
            variant: "short-text" as const,
          },
        },
        size: 200,
      },
      {
        id: "age",
        accessorKey: "age",
        header: "Age",
        meta: {
          label: "Age",
          cell: {
            variant: "number" as const,
            min: 18,
            max: 100,
          },
        },
        size: 80,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        meta: {
          label: "Status",
          cell: {
            variant: "select" as const,
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        },
        size: 120,
      },
      {
        id: "salary",
        accessorKey: "salary",
        header: "Salary",
        meta: {
          label: "Salary",
          cell: {
            variant: "number" as const,
            min: 0,
            step: 1000,
          },
        },
        size: 120,
      },
      {
        id: "department",
        accessorKey: "department",
        header: "Department",
        meta: {
          label: "Department",
          cell: {
            variant: "select" as const,
            options: [
              { label: "Engineering", value: "Engineering" },
              { label: "Design", value: "Design" },
              { label: "Marketing", value: "Marketing" },
              { label: "Sales", value: "Sales" },
              { label: "HR", value: "HR" },
            ],
          },
        },
        size: 140,
      },
      {
        id: "startDate",
        accessorKey: "startDate",
        header: "Start Date",
        meta: {
          label: "Start Date",
          cell: {
            variant: "date" as const,
          },
        },
        size: 130,
      },
      {
        id: "isManager",
        accessorKey: "isManager",
        header: "Manager",
        meta: {
          label: "Is Manager",
          cell: {
            variant: "checkbox" as const,
          },
        },
        size: 100,
      },
    ],
    [],
  );

  const onDataChange = React.useCallback((newData: Person[]) => {
    setData(newData);
  }, []);

  const onRowAdd = React.useCallback(() => {
    const newRow: Person = {
      id: `${Date.now()}`,
      name: "",
      email: "",
      age: 25,
      status: "active",
      salary: 50000,
      department: "Engineering",
      startDate: new Date().toISOString().split("T")[0] ?? "",
      isManager: false,
    };
    setData((prev) => [...prev, newRow]);
    return { rowIndex: data.length, columnId: "name" };
  }, [data.length]);

  const { table, ...gridProps } = useDataGrid({
    data,
    columns,
    onDataChange,
    initialState: {
      sorting: [{ id: "name", desc: false }],
    },
  });

  return (
    <DataGrid {...gridProps} table={table} height={540} onRowAdd={onRowAdd} />
  );
}
