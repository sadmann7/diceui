"use client";

import { Copy, Trash2, X } from "lucide-react";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ActionBar,
  ActionBarClose,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/registry/default/ui/action-bar";

interface Task {
  id: number;
  name: string;
}

export default function ActionBarDemo() {
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 1, name: "Weekly Status Report" },
    { id: 2, name: "Client Invoice Review" },
    { id: 3, name: "Product Roadmap" },
    { id: 4, name: "Team Standup Notes" },
  ]);
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<number>>(
    new Set(),
  );
  const nextIdRef = React.useRef(4);

  const open = selectedTaskIds.size > 0;

  const onOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setSelectedTaskIds(new Set());
    }
  }, []);

  const onItemSelect = React.useCallback(
    (id: number, checked: boolean) => {
      const newSelected = new Set(selectedTaskIds);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      setSelectedTaskIds(newSelected);
    },
    [selectedTaskIds],
  );

  const onDuplicate = React.useCallback(() => {
    const selectedItems = tasks.filter((task) => selectedTaskIds.has(task.id));
    const duplicates = selectedItems.map((task) => ({
      ...task,
      id: nextIdRef.current++,
      name: `${task.name} (copy)`,
    }));
    setTasks([...tasks, ...duplicates]);
    setSelectedTaskIds(new Set());
  }, [tasks, selectedTaskIds]);

  const onDelete = React.useCallback(() => {
    setTasks(tasks.filter((task) => !selectedTaskIds.has(task.id)));
    setSelectedTaskIds(new Set());
  }, [tasks, selectedTaskIds]);

  return (
    <div className="relative flex w-full flex-col">
      <div className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto">
        {tasks.map((task) => (
          <label
            key={task.id}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md border bg-card/70 px-3 py-2.5 transition-colors transition-colors hover:bg-accent/70",
              selectedTaskIds.has(task.id) && "bg-accent/70",
            )}
          >
            <Checkbox
              checked={selectedTaskIds.has(task.id)}
              onCheckedChange={(checked) =>
                onItemSelect(task.id, checked === true)
              }
            />
            <div className="truncate font-medium text-sm">{task.name}</div>
          </label>
        ))}
      </div>

      <ActionBar open={open} onOpenChange={onOpenChange}>
        <ActionBarSelection>
          {selectedTaskIds.size} selected
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarItem onSelect={onDuplicate}>
          <Copy />
          Duplicate
        </ActionBarItem>
        <ActionBarSeparator />
        <ActionBarItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          Delete
        </ActionBarItem>
      </ActionBar>
    </div>
  );
}
