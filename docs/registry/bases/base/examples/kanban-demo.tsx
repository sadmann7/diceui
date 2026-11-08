"use client";

import { GripVertical } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/bases/base/ui/badge";
import { Button } from "@/registry/bases/base/ui/button";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanOverlay,
} from "@/registry/bases/base/ui/kanban";

interface Task {
  id: string;
  title: string;
  label: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const COLUMN_TITLES: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In Progress",
  done: "Done",
};

export default function KanbanDemo() {
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    backlog: [
      {
        id: "1",
        title: "Add keyboard shortcuts to the command menu",
        label: "Feature",
        priority: "medium",
        dueDate: "2026-11-18",
      },
      {
        id: "2",
        title: "Fix date picker overflow on small screens",
        label: "Bug",
        priority: "high",
        dueDate: "2026-11-12",
      },
      {
        id: "3",
        title: "Write the migration guide for v2",
        label: "Docs",
        priority: "low",
        dueDate: "2026-11-24",
      },
    ],
    inProgress: [
      {
        id: "4",
        title: "Add filters to the search page",
        label: "Feature",
        priority: "high",
        dueDate: "2026-11-10",
      },
      {
        id: "5",
        title: "Reduce re-renders while dragging cards",
        label: "Performance",
        priority: "medium",
        dueDate: "2026-11-14",
      },
    ],
    done: [
      {
        id: "6",
        title: "Set up visual regression tests",
        label: "Testing",
        priority: "low",
        dueDate: "2026-11-03",
      },
      {
        id: "7",
        title: "Fix focus ring on disabled buttons",
        label: "Bug",
        priority: "medium",
        dueDate: "2026-11-01",
      },
    ],
  });

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid h-fit auto-rows-fr sm:grid-cols-3">
        {Object.entries(columns).map(([columnValue, tasks]) => (
          <TaskColumn key={columnValue} value={columnValue} tasks={tasks} />
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        {({ value, variant }) => {
          if (variant === "column") {
            const tasks = columns[value] ?? [];

            return <TaskColumn value={value} tasks={tasks} />;
          }

          const task = Object.values(columns)
            .flat()
            .find((task) => task.id === value);

          if (!task) return null;

          return <TaskCard task={task} />;
        }}
      </KanbanOverlay>
    </Kanban>
  );
}

interface TaskCardProps extends Omit<
  React.ComponentProps<typeof KanbanItem>,
  "value"
> {
  task: Task;
}

function TaskCard({ task, ...props }: TaskCardProps) {
  return (
    <KanbanItem
      key={task.id}
      value={task.id}
      render={
        <div className="flex flex-col gap-2.5 rounded-md border bg-card p-3 shadow-xs" />
      }
      {...props}
    >
      <span className="line-clamp-2 text-sm font-medium">{task.title}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant={
            task.priority === "high"
              ? "destructive"
              : task.priority === "medium"
                ? "default"
                : "secondary"
          }
          className="pointer-events-none h-5 px-1.5 text-[11px] capitalize"
        >
          {task.priority}
        </Badge>
        <Badge
          variant="outline"
          className="pointer-events-none h-5 px-1.5 text-[11px]"
        >
          {task.label}
        </Badge>
        <time
          dateTime={task.dueDate}
          className="ml-auto text-xs text-muted-foreground tabular-nums"
        >
          {dateFormatter.format(new Date(task.dueDate))}
        </time>
      </div>
    </KanbanItem>
  );
}

interface TaskColumnProps extends Omit<
  React.ComponentProps<typeof KanbanColumn>,
  "children"
> {
  tasks: Task[];
}

function TaskColumn({ value, tasks, ...props }: TaskColumnProps) {
  return (
    <KanbanColumn value={value} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{COLUMN_TITLES[value]}</span>
          <Badge variant="secondary" className="pointer-events-none">
            {tasks.length}
          </Badge>
        </div>
        <KanbanColumnHandle render={<Button variant="ghost" size="icon" />}>
          <GripVertical className="h-4 w-4" />
        </KanbanColumnHandle>
      </div>
      <div className="flex flex-col gap-2 p-0.5">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} asHandle />
        ))}
      </div>
    </KanbanColumn>
  );
}
