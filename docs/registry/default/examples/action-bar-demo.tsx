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

interface Item {
  id: number;
  name: string;
  status: string;
}

const initialItems: Item[] = [
  { id: 1, name: "Task 1", status: "Todo" },
  { id: 2, name: "Task 2", status: "In Progress" },
  { id: 3, name: "Task 3", status: "Done" },
];

export default function ActionBarDemo() {
  const [items, setItems] = React.useState(initialItems);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const nextIdRef = React.useRef(4);

  const open = selectedIds.size > 0;

  const onOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setSelectedIds(new Set());
    }
  }, []);

  const onItemSelect = React.useCallback(
    (id: number, checked: boolean) => {
      const newSelected = new Set(selectedIds);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      setSelectedIds(newSelected);
    },
    [selectedIds],
  );

  const onDuplicate = React.useCallback(() => {
    const selectedItems = items.filter((item) => selectedIds.has(item.id));
    const duplicates = selectedItems.map((item) => ({
      ...item,
      id: nextIdRef.current++,
      name: `${item.name} (copy)`,
    }));
    setItems([...items, ...duplicates]);
    setSelectedIds(new Set());
  }, [items, selectedIds]);

  const onDelete = React.useCallback(() => {
    setItems(items.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  }, [items, selectedIds]);

  return (
    <div className="relative flex w-full flex-col">
      <div className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto">
        {items.map((item) => (
          <label
            key={item.id}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md border bg-card px-3 py-2.5 transition-colors",
              selectedIds.has(item.id) && "border-primary bg-accent",
            )}
          >
            <Checkbox
              checked={selectedIds.has(item.id)}
              onCheckedChange={(checked) =>
                onItemSelect(item.id, checked === true)
              }
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-sm">{item.name}</div>
              <div className="text-muted-foreground text-xs">{item.status}</div>
            </div>
          </label>
        ))}
      </div>

      <ActionBar open={open} onOpenChange={onOpenChange}>
        <ActionBarSelection>
          {selectedIds.size} selected
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarItem onSelect={onDuplicate}>
          <Copy className="size-4" />
          Duplicate
        </ActionBarItem>
        <ActionBarSeparator />
        <ActionBarItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </ActionBarItem>
      </ActionBar>
    </div>
  );
}
