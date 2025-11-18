"use client";

import { X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeOverflow } from "@/registry/default/ui/badge-overflow";

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
  ]);
  const [input, setInput] = React.useState("");

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const onAddTag = React.useCallback(() => {
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

  const onRemoveTag = React.useCallback(
    (value: string) => {
      setTags(tags.filter((tag) => tag.value !== value));
    },
    [tags],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onAddTag();
      }
    },
    [onAddTag],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="font-medium text-sm">Tags with Overflow</h3>
        <div className="w-80 rounded-lg border p-4">
          <BadgeOverflow
            items={tags}
            getLabel={(tag) => tag.label}
            renderBadge={(tag, label) => (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onRemoveTag(tag.value)}
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
      <div className="flex gap-2">
        <Input
          placeholder="Add a tag..."
          className="w-64"
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />
        <Button onClick={onAddTag} type="button">
          Add
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Click on a badge to remove it. Resize the container to see overflow
        behavior.
      </p>
    </div>
  );
}
