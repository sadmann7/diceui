"use client";

import { Copy, MoreHorizontal, Trash2, X } from "lucide-react";
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

const items = [
  { id: 1, name: "Task 1", status: "Todo" },
  { id: 2, name: "Task 2", status: "In Progress" },
  { id: 3, name: "Task 3", status: "Done" },
  { id: 4, name: "Task 4", status: "Todo" },
];

export default function ActionBarDemo() {
  const [selectedItems, setSelectedItems] = React.useState<Set<number>>(
    new Set(),
  );

  const open = selectedItems.size > 0;

  const onOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setSelectedItems(new Set());
    }
  }, []);

  const onItemSelect = React.useCallback(
    (id: number, checked: boolean) => {
      const newSelected = new Set(selectedItems);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      setSelectedItems(newSelected);
    },
    [selectedItems],
  );

  const onDuplicate = React.useCallback(() => {
    console.log({ action: "duplicate", items: Array.from(selectedItems) });
  }, [selectedItems]);

  const onDelete = React.useCallback(() => {
    console.log({ action: "delete", items: Array.from(selectedItems) });
    setSelectedItems(new Set());
  }, [selectedItems]);

  return (
    <div className="relative flex min-h-[400px] w-full flex-col">
      <div className="flex flex-1 flex-col gap-2">
        {items.map((item) => (
          <label
            key={item.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors",
              selectedItems.has(item.id) && "border-primary bg-accent",
            )}
          >
            <Checkbox
              checked={selectedItems.has(item.id)}
              onCheckedChange={(checked) =>
                onItemSelect(item.id, checked === true)
              }
            />
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-muted-foreground text-sm">{item.status}</div>
            </div>
          </label>
        ))}
      </div>

      <ActionBar open={open} onOpenChange={onOpenChange}>
        <ActionBarSelection>
          {selectedItems.size} selected
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarItem onClick={onDuplicate}>
          <Copy className="size-4" />
          Duplicate
        </ActionBarItem>
        <ActionBarItem>
          <MoreHorizontal className="size-4" />
          More
        </ActionBarItem>
        <ActionBarSeparator />
        <ActionBarItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </ActionBarItem>
      </ActionBar>
    </div>
  );
}
