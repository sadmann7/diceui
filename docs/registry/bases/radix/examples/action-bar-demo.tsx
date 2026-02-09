"use client";

import { Copy, Trash2, X } from "lucide-react";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/registry/bases/radix/ui/action-bar";

interface Task {
  id: string;
  name: string;
}

export default function ActionBarDemo() {
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: crypto.randomUUID(), name: "Weekly Status Report" },
    { id: crypto.randomUUID(), name: "Client Invoice Review" },
    { id: crypto.randomUUID(), name: "Product Roadmap" },
    { id: crypto.randomUUID(), name: "Team Standup Notes" },
  ]);
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(
    new Set(),
  );

  const open = selectedTaskIds.size > 0;

  const onOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setSelectedTaskIds(new Set());
    }
  }, []);

  const onItemSelect = React.useCallback(
    (id: string, checked: boolean) => {
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
      id: crypto.randomUUID(),
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
    <div className="flex w-full flex-col gap-2.5">
      <h3 className="font-semibold text-lg">Tasks</h3>
      <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
        {tasks.map((task) => (
          <Label
            key={task.id}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md border bg-card/70 px-3 py-2.5 transition-colors hover:bg-accent/70",
              selectedTaskIds.has(task.id) && "bg-accent/70",
            )}
          >
            <Checkbox
              checked={selectedTaskIds.has(task.id)}
              onCheckedChange={(checked) =>
                onItemSelect(task.id, checked === true)
              }
            />
            <span className="truncate font-medium text-sm">{task.name}</span>
          </Label>
        ))}
      </div>

      <ActionBar open={open} onOpenChange={onOpenChange}>
        <ActionBarSelection>
          {selectedTaskIds.size} selected
          <ActionBarSeparator />
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem onSelect={onDuplicate}>
            <Copy />
            Duplicate
          </ActionBarItem>
          <ActionBarItem variant="destructive" onSelect={onDelete}>
            <Trash2 />
            Delete
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
    </div>
  );
}
