"use client";

import { Archive, Copy, X } from "lucide-react";
import * as React from "react";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/registry/bases/base/ui/action-bar";
import { Checkbox } from "@/registry/bases/base/ui/checkbox";
import { Label } from "@/registry/bases/base/ui/label";

const tasks = [
  "Add keyboard support to the angle slider",
  "Expose controlled value on the tour",
  "Document the query builder output options",
];

export default function ActionBarPreview() {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(tasks.slice(0, 2)),
  );

  const onOpenChange = React.useCallback((open: boolean) => {
    if (!open) setSelected(new Set());
  }, []);

  const onCheckedChange = React.useCallback(
    (task: string, checked: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (checked) next.add(task);
        else next.delete(task);
        return next;
      });
    },
    [],
  );

  return (
    <div
      ref={setContainer}
      className="relative flex flex-1 flex-col items-center justify-center px-5 pt-5 pb-[76px]"
    >
      <div className="flex w-full max-w-sm flex-col gap-1.5">
        {tasks.map((task) => (
          <Label
            key={task}
            className="flex cursor-pointer items-center gap-2.5 rounded-md border bg-background px-3 py-2"
          >
            <Checkbox
              checked={selected.has(task)}
              onCheckedChange={(checked) => onCheckedChange(task, checked)}
            />
            <span className="truncate text-sm font-normal">{task}</span>
          </Label>
        ))}
      </div>
      <ActionBar
        open={selected.size > 0}
        onOpenChange={onOpenChange}
        portalContainer={container}
        style={{ position: "absolute" }}
      >
        <ActionBarSelection>
          {selected.size} selected
          <ActionBarSeparator />
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem>
            <Copy />
            Duplicate
          </ActionBarItem>
          <ActionBarItem>
            <Archive />
            Archive
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
    </div>
  );
}
