"use client";

import { Archive, Tag, UserPlus, X } from "lucide-react";
import * as React from "react";

import { StyleScope } from "@/components/style-scope";
import { cn } from "@/lib/utils";
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/registry/bases/base/ui/action-bar";
import { Avatar, AvatarFallback } from "@/registry/bases/base/ui/avatar";
import { AvatarGroup } from "@/registry/bases/base/ui/avatar-group";
import { BadgeOverflow } from "@/registry/bases/base/ui/badge-overflow";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "@/registry/bases/base/ui/kanban";

interface Task {
  id: string;
  tags: string[];
  title: string;
  assignees: string[];
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
      tags: ["Design", "A11y", "Keyboard", "RTL"],
      title: "Add keyboard support to the angle slider",
      assignees: ["AM", "JS", "KO"],
    },
    {
      id: "DUI-238",
      tags: ["API"],
      title: "Expose controlled value on the tour",
      assignees: ["JS"],
    },
    {
      id: "DUI-234",
      tags: ["Docs"],
      title: "Document the query builder output options",
      assignees: ["KO"],
    },
  ],
  inProgress: [
    {
      id: "DUI-243",
      tags: ["Feature"],
      title: "Cropper: pinch zoom on touch devices",
      assignees: ["AM", "RT"],
    },
    {
      id: "DUI-239",
      tags: ["Bug"],
      title: "Action bar closes on outside scroll",
      assignees: ["RT"],
    },
    {
      id: "DUI-236",
      tags: ["Design"],
      title: "Settle the segmented input focus ring",
      assignees: ["SK"],
    },
  ],
  shipped: [
    {
      id: "DUI-229",
      tags: ["Base UI", "Release", "Radix", "Docs", "Registry"],
      title: "Ship Base UI variants for every component",
      assignees: ["AM", "JS", "SK"],
    },
    {
      id: "DUI-226",
      tags: ["Release"],
      title: "Command Stack: nested pages, inline or dialog",
      assignees: ["JS"],
    },
    {
      id: "DUI-224",
      tags: ["Release"],
      title: "Timeline: sticky markers and RTL support",
      assignees: ["SK"],
    },
  ],
};

interface TaskCardProps extends Omit<
  React.ComponentProps<typeof KanbanItem>,
  "value"
> {
  task: Task;
  selected?: boolean;
}

function TaskCard({ task, selected, className, ...props }: TaskCardProps) {
  return (
    <KanbanItem
      value={task.id}
      render={
        <div
          className={cn(
            "flex flex-col gap-2.5 rounded-[9px] border bg-card p-2.5 transition-colors",
            selected && "border-input bg-muted",
            className,
          )}
        />
      }
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <BadgeOverflow
          items={task.tags}
          className="max-w-44 flex-1"
          renderBadge={(_, label) => (
            <span
              className={cn(
                "rounded-sm px-1.5 py-0.5 font-mono text-[9px] leading-3 text-foreground/75",
                selected ? "bg-background" : "bg-muted",
              )}
            >
              {label}
            </span>
          )}
          renderOverflow={(count) => (
            <span className="rounded-sm border border-input px-[5px] py-px font-mono text-[9px] leading-3 text-muted-foreground">
              +{count}
            </span>
          )}
        />
        <span className="font-mono text-[9px] text-muted-foreground">
          {task.id}
        </span>
      </div>
      <span className="truncate text-xs leading-[1.4]">{task.title}</span>
      <AvatarGroup size={18}>
        {task.assignees.map((initials) => (
          <Avatar key={initials} className="size-[18px]">
            <AvatarFallback className="text-[7px] font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
    </KanbanItem>
  );
}

interface TaskColumnProps {
  value: string;
  tasks: Task[];
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  className?: string;
}

function TaskColumn({
  value,
  tasks,
  selectedIds,
  onSelect,
  className,
}: TaskColumnProps) {
  return (
    <KanbanColumn
      value={value}
      className={cn(
        "gap-[9px] border-0 bg-transparent p-[9px] shadow-none dark:bg-transparent",
        className,
      )}
    >
      <div className="flex h-[22px] items-center gap-[7px] px-0.5 pt-0.5 pb-1">
        <span className={cn("size-1.5 rounded-full", columnDots[value])} />
        <span className="text-xs font-medium text-muted-foreground">
          {columnTitles[value]}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-[9px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            selected={selectedIds?.has(task.id)}
            onClick={() => onSelect?.(task.id)}
            asHandle
          />
        ))}
      </div>
    </KanbanColumn>
  );
}

export function KanbanWindow() {
  const [columns, setColumns] = React.useState(initialColumns);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(["DUI-241", "DUI-238"]),
  );
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  const onSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onOpenChange = React.useCallback((open: boolean) => {
    if (!open) setSelectedIds(new Set());
  }, []);

  const onArchive = React.useCallback(() => {
    setColumns((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([value, tasks]) => [
          value,
          tasks.filter((task) => !selectedIds.has(task.id)),
        ]),
      ),
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  return (
    <div
      ref={setContainer}
      className="relative mx-auto flex h-[480px] w-full max-w-[1120px] flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_64px_rgb(0_0_0/0.08)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_24px_64px_rgb(0_0_0/0.5)]"
    >
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
        <span className="rounded-sm bg-muted px-[7px] py-[3px] font-mono text-[9px] text-muted-foreground">
          BASE UI
        </span>
      </div>
      <StyleScope>
        <div className="flex-1 bg-background p-4">
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
                  selectedIds={selectedIds}
                  onSelect={onSelect}
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

                return task ? (
                  <TaskCard task={task} selected={selectedIds.has(task.id)} />
                ) : null;
              }}
            </KanbanOverlay>
          </Kanban>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-linear-to-b from-transparent to-background to-85%" />
        <ActionBar
          open={selectedIds.size > 0}
          onOpenChange={onOpenChange}
          portalContainer={container}
          sideOffset={24}
          className="py-1"
          style={{ position: "absolute" }}
        >
          <ActionBarSelection className="whitespace-nowrap">
            {selectedIds.size} selected
            <ActionBarSeparator />
            <ActionBarClose>
              <X />
            </ActionBarClose>
          </ActionBarSelection>
          <ActionBarSeparator />
          <ActionBarGroup>
            <ActionBarItem>
              <UserPlus />
              <span className="sr-only sm:not-sr-only">Assign</span>
            </ActionBarItem>
            <ActionBarItem>
              <Tag />
              <span className="sr-only sm:not-sr-only">Label</span>
            </ActionBarItem>
            <ActionBarItem onSelect={onArchive}>
              <Archive />
              <span className="sr-only sm:not-sr-only">Archive</span>
            </ActionBarItem>
          </ActionBarGroup>
        </ActionBar>
      </StyleScope>
    </div>
  );
}
