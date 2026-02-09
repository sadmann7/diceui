"use client";

import { MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import * as React from "react";

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@/registry/bases/radix/ui/sortable";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@/registry/bases/radix/ui/tags-input";

export default function TagsInputSortableDemo() {
  const [tricks, setTricks] = React.useState(["The 900", "FS 540"]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  return (
    <Sortable
      sensors={sensors}
      value={tricks}
      onValueChange={(items) => setTricks(items)}
      orientation="mixed"
      flatCursor
    >
      <TagsInput value={tricks} onValueChange={setTricks} editable>
        <TagsInputLabel>Sortable</TagsInputLabel>
        <SortableContent>
          <TagsInputList>
            {tricks.map((trick) => (
              <SortableItem
                key={trick}
                value={trick}
                // to prevent tag item from being tabbable
                tabIndex={-1}
                asChild
                asHandle
              >
                <TagsInputItem value={trick}>{trick}</TagsInputItem>
              </SortableItem>
            ))}
            <TagsInputInput placeholder="Add trick..." />
          </TagsInputList>
        </SortableContent>
        <SortableOverlay>
          <div className="size-full animate-pulse rounded-sm bg-primary/10" />
        </SortableOverlay>
      </TagsInput>
    </Sortable>
  );
}
