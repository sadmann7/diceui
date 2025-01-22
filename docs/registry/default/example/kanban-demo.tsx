"use client";

import { cn } from "@/lib/utils";
import * as Kanban from "@/registry/default/ui/kanban";
import * as React from "react";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
}

export default function KanbanDemo() {
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    todo: [
      { id: "1", title: "Add authentication", priority: "high" },
      { id: "2", title: "Create API endpoints", priority: "medium" },
      { id: "3", title: "Write documentation", priority: "low" },
    ],
    inProgress: [
      { id: "4", title: "Design system updates", priority: "high" },
      { id: "5", title: "Implement dark mode", priority: "medium" },
    ],
    done: [
      // { id: "6", title: "Setup project", priority: "high" },
      // { id: "7", title: "Initial commit", priority: "low" },
    ],
  });

  return (
    <Kanban.Root
      columns={columns}
      onColumnsChange={setColumns}
      getItemValue={(item) => item.id}
    >
      <Kanban.Board>
        {Object.keys(columns).map((column) => (
          <Kanban.Column
            key={column}
            value={column}
            className="flex max-h-[400px] flex-col gap-2 overflow-y-auto"
          >
            <div className="font-medium">{column}</div>
            {columns[column]?.map((task) => (
              <Kanban.Item key={task.id} value={task.id} asChild asGrip>
                <div className="rounded-md border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{task.title}</div>
                    <div
                      className={cn(
                        "text-xs",
                        task.priority === "high"
                          ? "text-red-500"
                          : task.priority === "medium"
                            ? "text-yellow-500"
                            : "text-green-500",
                      )}
                    >
                      {task.priority}
                    </div>
                  </div>
                </div>
              </Kanban.Item>
            ))}
          </Kanban.Column>
        ))}
      </Kanban.Board>
      <Kanban.Overlay>
        {({ value }) => {
          const task = Object.values(columns)
            .flat()
            .find((task) => task.id === value);

          if (!task) return null;

          return (
            <Kanban.Item value={task.id} asChild>
              <div className="rounded-md border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{task.title}</div>
                  <div
                    className={cn(
                      "text-xs",
                      task.priority === "high"
                        ? "text-red-500"
                        : task.priority === "medium"
                          ? "text-yellow-500"
                          : "text-green-500",
                    )}
                  >
                    {task.priority}
                  </div>
                </div>
              </div>
            </Kanban.Item>
          );
        }}
      </Kanban.Overlay>
    </Kanban.Root>
  );
}
