"use client";

import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@/registry/default/ui/tags-input";
import * as React from "react";

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@/registry/default/ui/sortable";

import { MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

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
      value={tricks.map((trick) => ({ id: trick }))}
      onValueChange={(items) => setTricks(items.map((item) => item.id))}
      orientation="both"
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
                asGrip
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
