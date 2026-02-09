"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@/registry/bases/radix/ui/tags-input";

export default function TagsInputValidationDemo() {
  const [tricks, setTricks] = React.useState<string[]>([]);

  return (
    <TagsInput
      value={tricks}
      onValueChange={setTricks}
      onValidate={(value) => value.length > 2 && !value.includes("ollie")}
      onInvalid={(value) =>
        tricks.length >= 6
          ? toast.error("Up to 6 tricks are allowed.")
          : tricks.includes(value)
            ? toast.error(`${value} already exists.`)
            : toast.error(`${value} is not a valid trick.`)
      }
      max={6}
      editable
      addOnPaste
    >
      <TagsInputLabel>Tricks</TagsInputLabel>
      <TagsInputList>
        {tricks.map((trick) => (
          <TagsInputItem key={trick} value={trick}>
            {trick}
          </TagsInputItem>
        ))}
        <TagsInputInput placeholder="Add trick..." />
      </TagsInputList>
      <div className="text-muted-foreground text-sm">
        Add up to 6 tricks with at least 3 characters, excluding "ollie".
      </div>
    </TagsInput>
  );
}
