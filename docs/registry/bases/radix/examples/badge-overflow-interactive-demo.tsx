"use client";

import { X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeOverflow } from "@/registry/bases/radix/ui/badge-overflow";

interface Tag {
  label: string;
  value: string;
}

export default function BadgeOverflowInteractiveDemo() {
  const [tags, setTags] = React.useState<Tag[]>([
    { label: "React", value: "react" },
    { label: "TypeScript", value: "typescript" },
    { label: "Next.js", value: "nextjs" },
    { label: "Tailwind CSS", value: "tailwindcss" },
    { label: "Shadcn UI", value: "shadcn-ui" },
    { label: "Radix UI", value: "radix-ui" },
    { label: "Zustand", value: "zustand" },
    { label: "React Query", value: "react-query" },
    { label: "Prisma", value: "prisma" },
    { label: "PostgreSQL", value: "postgresql" },
    { label: "MySQL", value: "mysql" },
    { label: "MongoDB", value: "mongodb" },
  ]);
  const [input, setInput] = React.useState("");

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const onTagAdd = React.useCallback(() => {
    if (input.trim()) {
      setTags([
        ...tags,
        {
          label: input.trim(),
          value: input.trim(),
        },
      ]);
      setInput("");
    }
  }, [input, tags]);

  const onTagRemove = React.useCallback(
    (value: string) => {
      setTags(tags.filter((tag) => tag.value !== value));
    },
    [tags],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onTagAdd();
      }
    },
    [onTagAdd],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Tags with Overflow</h3>
        <div className="w-full max-w-80 rounded-md border p-3">
          <BadgeOverflow
            items={tags}
            getBadgeLabel={(tag) => tag.label}
            lineCount={2}
            renderBadge={(tag, label) => (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onTagRemove(tag.value)}
              >
                <span>{label}</span>
                <X className="size-3" />
              </Badge>
            )}
            renderOverflow={(count) => (
              <Badge variant="outline" className="bg-muted">
                +{count} more
              </Badge>
            )}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a tag..."
          className="max-w-64 flex-1"
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />
        <Button type="button" onClick={onTagAdd}>
          Add
        </Button>
      </div>
      <div className="flex flex-col gap-px text-balance text-muted-foreground text-sm">
        <p>Click on a badge to remove it.</p>
        <p>Resize the container to see overflow behavior.</p>
      </div>
    </div>
  );
}
