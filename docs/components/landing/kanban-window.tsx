"use client";

import { Maximize2 } from "lucide-react";
import * as React from "react";

import { StyleScope } from "@/components/style-scope";
import { cn } from "@/lib/utils";
import { Badge } from "@/registry/bases/base/ui/badge";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "@/registry/bases/base/ui/kanban";

interface Task {
  id: string;
  tag: string;
  title: string;
  assignee: string;
}

const columnTitles: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In progress",
  shipped: "Shipped",
};

const columnDots: Record<string, string> = {
  backlog: "bg-muted-foreground/60",
  inProgress: "bg-amber-400",
  shipped: "bg-emerald-500",
};

const initialColumns: Record<string, Task[]> = {
  backlog: [
    {
      id: "DUI-241",
      tag: "Design",
      title: "Add keyboard support to the angle slider",
      assignee: "AM",
    },
    {
      id: "DUI-238",
      tag: "API",
      title: "Expose controlled value on the tour",
      assignee: "JS",
    },
    {
      id: "DUI-234",
      tag: "Docs",
      title: "Document the query builder output options",
      assignee: "KO",
    },
  ],
  inProgress: [
    {
      id: "DUI-243",
      tag: "Feature",
      title: "Cropper: pinch zoom on touch devices",
      assignee: "AM",
    },
    {
      id: "DUI-239",
      tag: "Bug",
      title: "Action bar closes on outside scroll",
      assignee: "RT",
    },
    {
      id: "DUI-236",
      tag: "Design",
      title: "Settle the segmented input focus ring",
      assignee: "SK",
    },
  ],
  shipped: [
    {
      id: "DUI-229",
      tag: "Base UI",
      title: "Ship Base UI variants for every component",
      assignee: "AM",
    },
    {
      id: "DUI-226",
      tag: "Release",
      title: "Command Stack: nested pages, inline or dialog",
      assignee: "JS",
    },
    {
      id: "DUI-224",
      tag: "Release",
      title: "Timeline: sticky markers and RTL support",
      assignee: "SK",
    },
  ],
};

function TaskCard({
  task,
  ...props
}: { task: Task } & Omit<React.ComponentProps<typeof KanbanItem>, "value">) {
  return (
    <KanbanItem
      value={task.id}
      render={
        <div className="flex flex-col gap-2.5 rounded-md border bg-card p-3 shadow-xs" />
      }
      {...props}
    >
      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          className="pointer-events-none h-5 px-1.5 font-mono text-[10px]"
        >
          {task.tag}
        </Badge>
        <span className="font-mono text-[10px] text-muted-foreground">
          {task.id}
        </span>
      </div>
      <span className="line-clamp-2 text-sm">{task.title}</span>
      <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
        {task.assignee}
      </span>
    </KanbanItem>
  );
}

function TaskColumn({
  value,
  tasks,
  className,
}: {
  value: string;
  tasks: Task[];
  className?: string;
}) {
  return (
    <KanbanColumn
      value={value}
      className={cn("bg-transparent p-1 shadow-none", className)}
    >
      <div className="flex items-center gap-2 px-1 pb-1">
        <span className={cn("size-1.5 rounded-full", columnDots[value])} />
        <span className="text-sm font-medium text-muted-foreground">
          {columnTitles[value]}
        </span>
        <span className="font-mono text-xs text-muted-foreground/70">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-0.5">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} asHandle />
        ))}
      </div>
    </KanbanColumn>
  );
}

export function KanbanWindow() {
  const [columns, setColumns] = React.useState(initialColumns);

  return (
    <div className="relative flex h-[480px] w-full max-w-[1120px] flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_64px_rgb(0_0_0/0.08)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_24px_64px_rgb(0_0_0/0.5)]">
      <div
        aria-hidden="true"
        className="flex h-[46px] shrink-0 items-center justify-between border-b px-3.5"
      >
        <div className="flex items-center gap-[7px]">
          {Array.from({ length: 3 }, (_, index) => (
            <span key={index} className="size-[9px] rounded-full bg-border" />
          ))}
          <span className="pl-3.5 font-mono text-[11px] text-muted-foreground">
            kanban-board.tsx
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-sm bg-muted px-[7px] py-[3px] font-mono text-[9px] text-muted-foreground">
            BASE UI
          </span>
          <Maximize2 className="size-3 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 bg-background p-4">
        <StyleScope>
          <Kanban
            value={columns}
            onValueChange={setColumns}
            getItemValue={(item) => item.id}
          >
            <KanbanBoard className="grid auto-rows-fr gap-3.5 sm:grid-cols-3">
              {Object.entries(columns).map(([value, tasks], index) => (
                <TaskColumn
                  key={value}
                  value={value}
                  tasks={tasks}
                  className={index > 0 ? "hidden sm:flex" : undefined}
                />
              ))}
            </KanbanBoard>
            <KanbanOverlay>
              {({ value, variant }) => {
                if (variant === "column") {
                  return (
                    <TaskColumn
                      value={String(value)}
                      tasks={columns[value] ?? []}
                    />
                  );
                }

                const task = Object.values(columns)
                  .flat()
                  .find((task) => task.id === value);

                return task ? <TaskCard task={task} /> : null;
              }}
            </KanbanOverlay>
          </Kanban>
        </StyleScope>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-linear-to-b from-transparent to-background to-85%" />
    </div>
  );
}
