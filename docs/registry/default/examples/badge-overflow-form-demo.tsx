"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeOverflow } from "@/registry/default/ui/badge-overflow";

interface Tag {
  id: string;
  name: string;
}

export default function BadgeOverflowFormDemo() {
  const [tags, setTags] = React.useState<Tag[]>([
    { id: "1", name: "React" },
    { id: "2", name: "TypeScript" },
    { id: "3", name: "Next.js" },
    { id: "4", name: "Tailwind CSS" },
    { id: "5", name: "Shadcn UI" },
  ]);
  const [inputValue, setInputValue] = React.useState("");

  const onAddTag = React.useCallback(() => {
    if (inputValue.trim()) {
      setTags([
        ...tags,
        {
          id: Date.now().toString(),
          name: inputValue.trim(),
        },
      ]);
      setInputValue("");
    }
  }, [inputValue, tags]);

  const onRemoveTag = React.useCallback(
    (id: string) => {
      setTags(tags.filter((tag) => tag.id !== id));
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
            getLabel={(tag) => tag.name}
            renderBadge={(tag, label) => (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onRemoveTag(tag.id)}
              >
                {label} ×
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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-64"
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
