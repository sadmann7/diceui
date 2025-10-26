"use client";

import * as React from "react";

// Placeholder component until the actual data-grid is implemented
export default function DataGridDemo() {
  const [data] = React.useState([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      status: "active",
      salary: 75000,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      age: 28,
      status: "active",
      salary: 82000,
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      age: 35,
      status: "inactive",
      salary: 68000,
    },
  ]);

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <div className="bg-muted/50 px-4 py-2 font-medium text-sm">
          Data Grid Demo (Placeholder)
        </div>
        <div className="p-4">
          <p className="mb-4 text-muted-foreground text-sm">
            This is a placeholder for the Data Grid component. The actual
            component will be available once installed.
          </p>

          {/* Simple table representation */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border px-3 py-2 text-left font-medium text-sm">
                    Name
                  </th>
                  <th className="border border-border px-3 py-2 text-left font-medium text-sm">
                    Email
                  </th>
                  <th className="border border-border px-3 py-2 text-left font-medium text-sm">
                    Age
                  </th>
                  <th className="border border-border px-3 py-2 text-left font-medium text-sm">
                    Status
                  </th>
                  <th className="border border-border px-3 py-2 text-left font-medium text-sm">
                    Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50">
                    <td className="border border-border px-3 py-2 text-sm">
                      {row.name}
                    </td>
                    <td className="border border-border px-3 py-2 text-sm">
                      {row.email}
                    </td>
                    <td className="border border-border px-3 py-2 text-sm">
                      {row.age}
                    </td>
                    <td className="border border-border px-3 py-2 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
                          row.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="border border-border px-3 py-2 text-sm">
                      ${row.salary.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-muted-foreground text-xs">
            Features to be available in the full Data Grid:
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>In-place cell editing with various input types</li>
              <li>Virtualization for large datasets</li>
              <li>Keyboard navigation (Arrow keys, Tab, Enter, etc.)</li>
              <li>Context menu with row/cell actions</li>
              <li>Copy/paste functionality</li>
              <li>Column sorting and filtering</li>
              <li>Row selection and bulk operations</li>
              <li>Resizable columns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
